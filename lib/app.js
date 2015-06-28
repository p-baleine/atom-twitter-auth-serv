var express = require('express');
var logger = require('winston');
var morgan = require('morgan');
var Promise = require('bluebird');
var request = require('request');
var url = require('url');
var querystring = require('querystring');

var app = module.exports = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/../public'));
app.use(morgan('combined'));

var OAUTH_PARAMS = {
  callback: process.env.CALLBACK,
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET
};

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/auth', function(req, res) {
  res.render('auth');
});

app.post('/auth', function(req, res, next) {
  var url = 'https://api.twitter.com/oauth/request_token';

  postAsync({ url: url, oauth: OAUTH_PARAMS })
    .then(function(body) {
      var reqData = querystring.parse(body);
      var uri = 'https://api.twitter.com/oauth/authenticate'
        + '?' + querystring.stringify({ oauth_token: reqData.oauth_token });

      res.redirect(uri);
    })
    .catch(next);
});

app.get(url.parse(OAUTH_PARAMS.callback).path, function(req, res) {
  var oauth = {
     consumer_key: OAUTH_PARAMS.CONSUMER_KEY,
     consumer_secret: OAUTH_PARAMS.CONSUMER_SECRET,
     token: req.query.oauth_token,
     token_secret: OAUTH_PARAMS.oauth_token_secret,
     verifier: req.query.oauth_verifier
  };
  var url = 'https://api.twitter.com/oauth/access_token'

  postAsync({ url: url, oauth: oauth })
    .then(function(body) {
      var permData = querystring.parse(body);
      res.render('success', permData);
    })
    .catch(next);
});

function postAsync(params) {
  return new Promise(function(resolve, reject) {
      request.post(params, function(e, r, body) {
        if (e) {
          reject(e);
        } else if (r.statusCode !== 200) {
          reject(r.statusCode);
        } else {
          resolve(body);
        }
      });
  });
}
