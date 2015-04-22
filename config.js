var VCAP_SERVICES = process.env["VCAP_SERVICES"],
    vcapServices,
    VCAP_APPLICATION = process.env["VCAP_APPLICATION"],
    vcapApplication;

if (VCAP_SERVICES) {
    vcapServices = JSON.parse(VCAP_SERVICES);
}

if (VCAP_APPLICATION) {
    vcapApplication = JSON.parse(VCAP_APPLICATION);
}

function getEnv(propName, defaultValue) {
    if (process.env[propName]) {
        return process.env[propName];
    } else {
        return defaultValue;
    }
}

module.exports = function() {
    return {
        getEnv : getEnv,
        watsonUsername: function() {
            if (VCAP_SERVICES) {
                return vcapServices["personality_insights"][0].credentials.username;
            }
            else {
                return getEnv("WATSON_USERNAME", "");
            }
        },
        watsonPassword: function() {
            if (VCAP_SERVICES) {
                return vcapServices["personality_insights"][0].credentials.password;
            }
            else {
                return getEnv("WATSON_PASSWORD", "");
            }
        },
        boxClientId: function() {
            if (VCAP_SERVICES) {
                return vcapServices["user-provided"][0].credentials.client_id;
            }
            else {
                return getEnv("BOX_CLIENT_ID", "");
            }
        },
        boxClientSecret: function() {
            if (VCAP_SERVICES) {
                return vcapServices["user-provided"][0].credentials.client_secret;
            }
            else {
                return getEnv("BOX_CLIENT_SECRET", "");
            }
        },
        appURL: function() {
            if (VCAP_APPLICATION) {
                return "https://" + vcapApplication.application_uris[0];
            }
            else {
                return "http://localhost:3000"
            }
        }
    };
};
