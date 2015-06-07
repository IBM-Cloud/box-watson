# Overview

Personality Box pulls the txt files from your [Box][box_url] acount and allows you to analyze the unique personality traits of each file's author using Watson [Personality Insights][personality_insights_url] technology. For sample files, feel free to use either [President Obama's 2015 State of the Union Address] [sotu_url] or [Moby Dick - Chapter 1] [moby_dick_url] hosted in our Box account.

This app is meant to serve as a demo to showcase how quickly and easily an app can be built on Bluemix using the Watson Personality Insights and Box services.

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://github.com/IBM-Bluemix/box-watson)
Bluemix sample/tutorial: Integrating Box API's with Watson built on IBM Bluemix
*Note: If deploying by this method, the app will fail on first deploy. You must complete steps 8-11 as described in 'Running the app on Bluemix' below for your app to start successfully.

## How it Works

1. Sign up for a [Box account] [box_signup_url] if you do not have one already.

2. Upload several txt files (we recommend each file contain a minimum of 2000 words) to the root folder of your account.

3. Navigate to the app home page and select 'Sign in with Box' to log in with your Box account.

5. Once your files load, select one to run its contents through the Personality Insights service and see the author's personality breakdown.

6. To view a visualization of the full result set, select the 'Full Personality Graph' button beneath the Big 5 results.

7. If you have a large number of files and you would like to find a specific one, use the search filter in the navigation bar.

8. To log in as a different user, click the logout button in the navigation bar and you will return to the home page.

## Architecture Diagram

<img src="https://raw.githubusercontent.com/IBM-Bluemix/box-watson/master/github_content/architecture_diagram.png" width="650px"><br>This an architectural overview of the systems that make this app run.<br>

## Running the app on Bluemix

1. Create a Bluemix Account

    [Sign up][bluemix_signup_url] in Bluemix, or use an existing account.

2. Download and install the [Cloud-foundry CLI][cloud_foundry_url] tool

3. Clone the app to your local environment from your terminal using the following command
  ```sh
  git clone https://github.com/IBM-Bluemix/box-watson.git
  ```

4. cd into this newly created directory

5. Edit the `manifest.yml` file and change the `<application-name>` and `<application-host>` to something unique.
  ```none
  applications:
  - name: box-sample-app-test
    framework: node
    runtime: node12
    memory: 128M
    instances: 1
    host: box-sample-app-test
  ```
  The host you use will determinate your application url initially, e.g. `<application-host>.mybluemix.net`.

6. Connect to Bluemix in the command line tool and follow the prompts to log in.
  ```sh
  $ cf api https://api.ng.bluemix.net
  $ cf login
  ```

7. Create the Personality Insights service in Bluemix.
  ```sh
  $ cf create-service personality_insights IBM\ Watson\ Personality\ Insights\ Monthly\ Plan personality-insights-box
  ```

7. Push it to Bluemix. We need to perform additional steps once it is deployed, so we will add the option --no-start argument
  ```sh
  $ cf push --no-start
  ```

8. Next, you need to sign up for a Box developer account if you do not have one already. You can do this [here] [box_dev_signup_url].

9. Once you have created an account, select 'Create a Box Application' from the side panel. Name your app, select the Box Content API, and click 'Create Application'. On the next page you will find your app's client_id and client_secret, which you will need for the following step.

10. Using the credentials you received in step 9, we will create a user-provided service in Bluemix so that our app can leverage them.
  ```sh
  $ cf cups box -p '{"url":"https://view-api.box.com/","clientId":"BOX_CLIENT_ID","clientSecret":"BOX_CLIENT_SECRET"}'
  ```
Now bind the service to your app.
  ```sh
  $ cf bind-service APP_NAME box
  ```

11. Finally, we need to restage our app to ensure these env variables changes took effect.
  ```sh
  $ cf restage APP_NAME
  ```

And voila! You now have your very own instance of Personality Box running on Bluemix.

## Running the app locally

1. Create a Bluemix Account. You will need this to create a Personality Insights service and grab the credentials.

    [Sign up][bluemix_signup_url] in Bluemix, or use an existing account.

2. [Download and install node.js] [download_node_url] on your local machine, if you do not already have it.

2. Clone the app to your local environment from your terminal using the following command
  ```sh
  git clone https://github.com/IBM-Bluemix/box-watson.git
  ```

3. cd into this newly created directory

4. Install the required npm and bower packages using the following command
  ```sh
  npm install
  ```

5. Next, you need to sign up for a Box developer account if you do not have one already. You can do this [here] [box_dev_signup_url].

6. Once you have created an account, select 'Create a Box Application' from the side panel. Name your app, select the Box Content API, and click 'Create Application'. On the next page you will find your app's client_id and client_secret, which you will need for the following step.

7. Using the credentials you received in step 9, replace the default Box configs in vcap-local.json. After you have done that, create a Personality Insights service using your Bluemix account and replace the corresponding credentials in vcap-local.json.

8. Start your app locally with the following command.
  ```sh
  npm start
  ```

Your app will be automatically assigned to a port which will be logged to your terminal. To access the app, go to localhost:PORT in your browser. Happy developing!

## Troubleshooting

To troubleshoot your Bluemix app the main useful source of information is the logs. To see them, run:

  ```sh
  $ cf logs <application-name> --recent
  ```

[box_url]: https://www.box.com/
[personality_insights_url]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/personality-insights.html
[moby_dick_url]: https://app.box.com/s/xe4mv4tc7fi4mmuj6kgeurq0qvfv6ukd
[sotu_url]: https://app.box.com/s/bw5l1mtlodhib0yiu5rx4hyb9az7gt4m
[bluemix_signup_url]: https://console.ng.bluemix.net/registration/
[box_signup_url]: https://app.box.com/signup/personal
[box_dev_signup_url]: https://app.box.com/signup/o/default_developer_offer
[cloud_foundry_url]: https://github.com/cloudfoundry/cli
[download_node_url]: https://nodejs.org/download/
