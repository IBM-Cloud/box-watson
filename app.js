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
    watson = require('watson-developer-cloud'),
    _ = require("underscore"),
    uuid = require("node-uuid"),
    cfenv = require("cfenv");

//---Deployment Tracker---------------------------------------------------------
require("cf-deployment-tracker-client").track();

//---Environment Vars-----------------------------------------------------------
var vcapLocal = null
try {
  vcapLocal = require("./vcap-local.json")
}
catch (e) {}

var appEnvOpts = vcapLocal ? {vcap:vcapLocal} : {}
var appEnv = cfenv.getAppEnv(appEnvOpts);

//---Set up Watson Personality Insights-----------------------------------------
var personalityInsightsCreds = getServiceCreds(appEnv, "personality-insights-box");
personalityInsightsCreds.version = "v2";
var personality_insights = watson.personality_insights(personalityInsightsCreds);

//---Set up Box--------------------------------------------------------------
var boxCreds = getServiceCreds(appEnv, "box"),
    box = box_sdk.Box();

var port = process.env.VCAP_APP_PORT || 3000;

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Authenticate bos identification
passport.use(new BoxStrategy({
    clientID: boxCreds.clientId || boxCreds.client_id,
    clientSecret: boxCreds.client_secret,
    callbackURL: config.appURL(appEnv.port) + "/auth/box/callback"
  }, box.authenticate()));

//---Routers and View Engine----------------------------------------------------
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

app.listen(appEnv.port, function() {
  console.log("server started on port " + appEnv.port);
});

// Used to ensure the user is authenticated in Box
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Serve the home page
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

//---API call handlers----------------------------------------------------------

// Get user's files and return txt files to caller
app.get("/api/v1/files", ensureAuthenticated, function (request, response) {
  var connection = box.getConnection(request.user.login);
  connection.ready(function () {
    connection.getFolderItems(0, null, function (err, result) {
      if (err) {
        response.send(err);
      }
      else {
        //filter out anything other than .txt files
        var files = [];
        _.each(result.entries, function(file) {
          // get the description for the .txt files
            if (file.name.indexOf(".txt") !== -1) {
              files.push(file);
            }
        });
        response.send(files);
      }
    });
  });
});

// Get personality insights based for text of the passed file
app.get("/api/v1/personality/:fileId", ensureAuthenticated, function (request, response) {
   var connection = box.getConnection(request.user.login),
    fileId = parseInt(request.params.fileId);
    randomUuid = uuid.v4();
    connection.ready(function () {
      connection.getFile(fileId, null, "/tmp/" + randomUuid + ".txt", function (err, result) {
        if (err) {
          response.send(err);
        }
        else {
          var txtFile = "";
          fs.readFile("/tmp/" + randomUuid + ".txt", function(error, result) {
            if (error) {
              response.send(error);
              return;
            }
            txtFile = result.toString();
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

// Get file info for a particular file
app.get("/api/v1/fileInfo/:fileId/:iterator", ensureAuthenticated, function (request, response) {
  var connection = box.getConnection(request.user.login);
  var fileId = parseInt(request.params.fileId);
  connection.ready(function () {
    connection.getFileInfo(fileId, function (err, result) {
      if (err) {
        response.send(err);
      }
      else {
        result.iterator = request.params.iterator;
        response.send(result);
      }
    });
  });
});

// Retrieves service credentials for the input service
function getServiceCreds(appEnv, serviceName) {
  var serviceCreds = appEnv.getServiceCreds(serviceName)
  if (!serviceCreds) {
    console.log("service " + serviceName + " not bound to this application");
    return null;
  }
  return serviceCreds;
}
