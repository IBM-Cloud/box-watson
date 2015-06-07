// Licensed under the Apache 2.0 License. See footer for details.

var express = require("express"),
    http = require("http"),
    path = require("path"),
    program = require("commander"),
    pkg = require(path.join(__dirname, "package.json"));

http.post = require("http-post");

var app = express();

if (process.env.VCAP_APPLICATION) {
    var vcapApplication = JSON.parse(process.env.VCAP_APPLICATION);
    app.set("vcapApplication", vcapApplication);
}

program
  .command("track")
  .description("Track application deployments")
  .action(function(options) {
    var vcapApplication = app.get("vcapApplication");
    if (vcapApplication) {
      var event = {
        date_sent: new Date().toJSON()
      };
      if (pkg.version) {
        event.code_version = pkg.version;
      }
      if (pkg.repository && pkg.repository.url) {
        event.repository_url = pkg.repository.url;
      }
      if (vcapApplication.application_name) {
        event.application_name = vcapApplication.application_name;
      }
      if (vcapApplication.space_id) {
        event.space_id = vcapApplication.space_id;
      }
      if (vcapApplication.application_version) {
        event.application_version = vcapApplication.application_version;
      }
      if (vcapApplication.application_uris) {
        event.application_uris = vcapApplication.application_uris;
      }
      // TODO: Make this work over HTTPS
      http.post("http://deployment-tracker.mybluemix.net/", event);
    }
  }).on("--help", function() {
    console.log("  Examples:");
    console.log();
    console.log("    $ track");
    console.log();
  });

program.parse(process.argv);
