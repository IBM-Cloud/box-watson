# Overview

Personality Box pulls the txt files from your [Box][box_url] acount and allows you to analyze the unique personality traits of each file's author using Watson [Personality Insights][personality_insights_url] technology. For sample files, feel free to use either [President Obama's 2015 State of the Union Address] [sotu_url] or [Moby Dick - Chapter 1] [moby_dick_url] hosted in our Box account.

This app is meant to serve as a demo to showcase how quickly and easily an app can be built on Bluemix using the Watson Personality Insights and Box services.

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy)

[![Build Status](https://codeship.com/projects/5a54ade0-f674-0132-750d-5edba2a997f7/status?branch=master)](https://codeship.com/projects/5a54ade0-f674-0132-750d-5edba2a997f7/status?branch=master)

*Note: If deploying by this method, the app will fail on first deploy. After this initial failure, you must complete steps 9-12 as described in the section 'Running the app on Bluemix' below for your app to start successfully.

## How it Works

1. Sign up for a [Box account] [box_signup_url] if you do not have one already.

2. Upload several txt files (we recommend each file contain a minimum of 2000 words) to the root folder of your account.

3. Navigate to the app home page and select 'Sign in with Box' to log in with your Box account.

5. Once your files load, select one to run its contents through the Personality Insights service and see the author's personality breakdown.

6. To view a visualization of the full result set, select the 'Full Personality Graph' button beneath the Big 5 results.

7. If you have a large number of files and you would like to find a specific one, use the search filter in the navigation bar.

8. To log in as a different user, click the logout button in the navigation bar and you will return to the home page.

### Architecture Diagram

<img src="https://raw.githubusercontent.com/IBM-Bluemix/box-watson/master/github_content/architecture_diagram.png?token=ABdqJ9zAmLUyqdSM52uzRXalUuW0UwhOks5VhEmUwA%3D%3D" width="650px"><br>This an architectural overview of the systems that make this app run.<br>

## Running the app on Bluemix

1. Create a Bluemix Account

    [Sign up][bluemix_signup_url] for Bluemix, or use an existing account.

2. Download and install the [Cloud-foundry CLI][cloud_foundry_url] tool

3. Clone the app to your local environment from your terminal using the following command

  ```
  git clone https://github.com/IBM-Bluemix/box-watson.git
  ```

4. cd into this newly created directory

5. Edit the `manifest.yml` file and change the `<application-name>` and `<application-host>` to something unique.

  ```
  applications:
  - name: personality-box-test
    framework: node
    runtime: node12
    memory: 128M
    instances: 1
    host: personality-box-test
  ```
  The host you use will determinate your application url initially, e.g. `<application-host>.mybluemix.net`.

6. Connect to Bluemix in the command line tool and follow the prompts to log in.

  ```
  $ cf api https://api.ng.bluemix.net
  $ cf login
  ```

7. Create the Personality Insights service in Bluemix.

  ```
  $ cf create-service personality_insights IBM\ Watson\ Personality\ Insights\ Monthly\ Plan personality-insights-box
  ```

8. Push it to Bluemix. We need to perform additional steps once it is deployed, so we will add the option --no-start argument

  ```
  $ cf push --no-start
  ```

9. Next, you need to sign up for a Box developer account if you do not have one already. You can do this [here][box_dev_signup_url].

10. Once you have created an account, select 'Create a Box Application' from the side panel. Name your app, select the Box Content API, and click 'Create Application'. On the next page you will find your API key and your app's client_id and client_secret, which you will need for the following step.

11. Using the credentials you received in step 9, we will create a user-provided service in Bluemix so that our app can leverage them.

  ```
  $ cf cups box -p '{"url":"https://api.box.com","apikey":"BOX_API_KEY","clientId":"BOX_CLIENT_ID","clientSecret":"BOX_CLIENT_SECRET"}'
  ```
Now bind the service to your app.

  ```
  $ cf bind-service APP_NAME box
  ```

12. Finally, we need to restage our app to ensure these env variables changes took effect.

  ```
  $ cf restage APP_NAME
  ```

And voila! You now have your very own instance of Personality Box running on Bluemix.

## Running the app locally

1. Create a Bluemix Account. You will need this to create a Personality Insights service and grab the credentials later on.

    [Sign up][bluemix_signup_url] in Bluemix, or use an existing account.

2. If you have not already, [download node.js][download_node_url] and install it on your local machine.

3. Clone the app to your local environment from your terminal using the following command

  ```
  git clone https://github.com/IBM-Bluemix/box-watson.git
  ```

4. cd into this newly created directory

5. Install the required npm and bower packages using the following command

  ```
  npm install
  ```

6. Next, you need to sign up for a Box developer account if you do not have one already. You can do this [here][box_dev_signup_url].

7. Once you have created an account, select 'Create a Box Application' from the side panel. Name your app, select the Box Content API, and click 'Create Application'. On the next page you will find your app's client_id and client_secret, which you will need for the following step.

8. Using the credentials you received in step 9, replace the default Box configs in vcap-local.json. After you have done that, create a Personality Insights service using your Bluemix account and replace the corresponding credentials in vcap-local.json.

9. Start your app locally with the following command.

  ```
  npm start
  ```

Your app will be automatically assigned to a port which will be logged to your terminal. To access the app, go to localhost:PORT in your browser. Happy developing!

### Troubleshooting

To troubleshoot your Bluemix app the main useful source of information is the logs. To see them, run:

  ```
  $ cf logs <application-name> --recent
  ```

### Privacy Notice

The Personality Box sample web application includes code to track deployments to Bluemix and other Cloud Foundry platforms. The following information is sent to a [Deployment Tracker] [deploy_track_url] service on each deployment:

* Application Name (`application_name`)
* Space ID (`space_id`)
* Application Version (`application_version`)
* Application URIs (`application_uris`)

This data is collected from the `VCAP_APPLICATION` environment variable in IBM Bluemix and other Cloud Foundry platforms. This data is used by IBM to track metrics around deployments of sample applications to IBM Bluemix. Only deployments of sample applications that include code to ping the Deployment Tracker service will be tracked.

### Disabling Deployment Tracking

Deployment tracking can be disabled by removing `"install": "node admin.js track"` from the `scripts` section within `package.json`.

[box_url]: https://www.box.com/
[personality_insights_url]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/personality-insights.html
[moby_dick_url]: https://app.box.com/s/xe4mv4tc7fi4mmuj6kgeurq0qvfv6ukd
[sotu_url]: https://app.box.com/s/bw5l1mtlodhib0yiu5rx4hyb9az7gt4m
[bluemix_signup_url]: https://console.ng.bluemix.net/?cm_mmc=GitHubReadMe-_-BluemixSampleApp-_-Node-_-Box
[box_signup_url]: https://app.box.com/signup/personal
[box_dev_signup_url]: https://app.box.com/signup/o/default_developer_offer
[cloud_foundry_url]: https://github.com/cloudfoundry/cli
[download_node_url]: https://nodejs.org/download/
[deploy_track_url]: https://github.com/cloudant-labs/deployment-tracker
