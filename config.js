var VCAP_APPLICATION = process.env["VCAP_APPLICATION"],
    vcapApplication;
if (VCAP_APPLICATION) {
    vcapApplication = JSON.parse(VCAP_APPLICATION);
}

module.exports = function() {
    return {
        appURL: function(port) {
            if (VCAP_APPLICATION) {
                return "https://" + vcapApplication.application_uris[0].replace("-b");
            }
            else {
                return "http://localhost:" + port.toString();
            }
        }
    };
};
