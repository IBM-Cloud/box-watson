var express = require('express'),
    app = express(),
    config = require("./config")(),
  passport = require('passport'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  methodOverride = require('method-override'),
  BoxStrategy = require('passport-box').Strategy,
  box_sdk = require('box-sdk'),
  fs = require("fs"),
  watson = require('watson-developer-cloud');

var port = process.env.VCAP_APP_PORT || 3000;

var BOX_CLIENT_ID = config.boxClientId(),
    BOX_CLIENT_SECRET = config.boxClientSecret();

var personality_insights = watson.personality_insights({
  username: config.watsonUsername(),
  password: config.watsonPassword(),
  version: 'v2'
});

var box = box_sdk.Box();

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});


passport.use(new BoxStrategy({
    clientID: BOX_CLIENT_ID,
    clientSecret: BOX_CLIENT_SECRET,
    callbackURL: "https://box-watson.mybluemix.net/auth/box/callback"
  }, box.authenticate()));


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morgan());
app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({
  secret: 'keyboard cat'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

app.listen(port, function() {
  console.log("server started on port " + port);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.get('/', function (req, res) {
  var opts = {
    user: req.user
  };
  if (req.user) {
    var connection = box.getConnection(req.user.login);
    connection.ready(function () {
      connection.getFolderItems(0, null, function (err, result) {
        if (err) {
          opts.body = err;
        } else {
          opts.body = result;
        }
        res.render('index', opts);
      });
    });
  } else {
    res.render('index', opts);
  }
});

app.get('/account', ensureAuthenticated, function (req, res) {
  console.log(req.user);
  res.render('account', {
    user: req.user
  });
});

app.get('/login', function (req, res) {
  res.render('login', {
    user: req.user
  });
});

app.get('/auth/box',
  passport.authenticate('box'),
  function (req, res) {
  });

app.get('/auth/box/callback',
  passport.authenticate('box', {
    failureRedirect: '/login'
  }),
  function (req, res) {
    res.redirect('/');
  });

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

app.get("/api/v1/files", ensureAuthenticated, function (request, response) {
  var connection = box.getConnection(request.user.login);
  connection.ready(function () {
    connection.getFolderItems(0, null, function (err, result) {
      if (err) {
        response.send(err);
      } else {
        response.send(result);
      }
    });
  });
});

app.get("/api/v1/personality/:fileId", ensureAuthenticated, function (request, response) {
   var connection = box.getConnection(request.user.login),
    fileId = parseInt(request.params.fileId);
    connection.ready(function () {
      connection.getFile(fileId, null, "/tmp/wedding.txt", function (err, result) {
        if (err) {
          response.send(err);
        }
        else {
          var txtFile = "";
          fs.readFile("/tmp/wedding.txt", function(error, result) {
            if (error) {
              response.send(error);
              return;
            }
            txtFile = result.toString();
            console.log(txtFile);
            personality_insights.profile({
              text: txtFile },
              function (err, result) {
                if (err) {
                  response.send(err);
                }
                else {
                  response.send(result);
                }
            });
          });
        }
    });
  });
});
