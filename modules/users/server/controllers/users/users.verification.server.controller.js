'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  logger = require(path.resolve('./config/lib/logger')),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  nodemailer = require('nodemailer'),
  passport = require('passport'),
  async = require('async'),
  crypto = require('crypto');

var smtpTransport = nodemailer.createTransport(config.mailer.options);

/**
 * post:发送确认邮件
 */
exports.setEmailVerifyToken = function (req, res) {

  genToken()
    .then(setToken)
    .then(genEmailContent)
    .then(sendEmail)
    .catch(err => {
      return res.status(400).json({
        message: err
      });
    });

  // 生成随机Token
  function genToken() {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(20, function (err, buffer) {
        var token = buffer.toString('hex');
        if (err) reject(err);
        else resolve({ token });
      });
    });
  }

  // 设置Token
  function setToken({ token }) {
    return new Promise((resolve, reject) => {
      if (!req.body.username) {
        return res.status(422).json({
          message: 'Username field must not be blank'
        });
      } else {
        User
          .findOne()
          .where('username')
          .equals(req.body.username.toLowerCase())
          .select('-salt -password')
          .exec((err, user) => {
            if (err || !user) {
              return res.status(404).json({
                message: 'No account with that username has been found'
              });
            } else {
              if (user.emailVerified) return res.status(400).json({ message: '用户以验证' });
              user.emailVerifyToken = token;
              user.emailVerifyTokenExpires = Date.now() + config.mailer.verificationDuration;
              user.save(err => {
                if (err) return res.status(400).json({ message: errorHandler.getErrorMessage(err) });
                else resolve({ token, user });
              });
            }
          });
      }
    });
  }

  // 生成邮件
  function genEmailContent({ token, user }) {
    return new Promise((resolve, reject) => {
      var httpTransport = 'http://';
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://';
      }
      var baseUrl = req.app.get('domain') || httpTransport + req.headers.host;
      res.render(path.resolve('./modules/users/server/templates/verify-email'), {
        name: user.displayName,
        appName: config.app.title,
        url: baseUrl + '/api/auth/email/' + token
      }, function (err, emailHTML) {
        if (err) reject(err);
        else resolve({ emailHTML, user });
      });
    });
  }

  // 发送邮件
  function sendEmail({ emailHTML, user }) {
    return new Promise((resolve, reject) => {
      var mailOptions = {
        to: user.email,
        from: config.mailer.from,
        subject: '确认邮件',
        html: emailHTML
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        if (!err) {
          res.status(202).json({
            message: 'An email has been sent to the provided email with further instructions.'
          });
        } else {
          return res.status(400).json({
            message: 'Failure sending email'
          });
        }
      });
    });
  }

};

/**
 * get:确认邮件
 */
exports.verifyEmail = function (req, res) {
  User
    .findOne()
    .where('emailVerifyToken')
    .equals(req.params.token)
    .where('emailVerifyTokenExpires')
    .exec((err, user) => {
      if (err) {
        return res.status(400).json({
          message: errorHandler.getErrorMessage(err)
        });
      } else if (!user) {
        return res.status(404).json({
          message: '用户不存在'
        });
      } else if (user.emailVerifyTokenExpires < Date.now()) {
        return res.status(410).json({
          message: '链接以失效'
        });
      } else {
        user.emailVerified = true;
        user.save(function(err) {
          if (err) return res.status(400).json({
            message: errorHandler.getErrorMessage(err)
          });
          else {
            user.password = undefined;
            user.salt = undefined;
            res.status(200).json(user);
          }
        });
      }
    });
};
