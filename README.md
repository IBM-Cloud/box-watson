Bluemix sample/tutorial: Integrating Box API's with Watson built on IBM Bluemix
===

INSTALLATION
===
* Sign up for a [Bluemix](http://bluemix.net) account
* Create an app at [http://developer.box.com](http://developer.box.com)
* Create a Watson Personality Inights Service in Bluemix
* Create a Box Service in Bluemix
* `cf push <appname> --no-start` to publish the application
* Bind the services to the app
  * `cf bind-service <appname> <nameOfWatsonService>`
  * `cf bind-service <appname> <nameOfBoxService>`
* `cf start <appname>` to start the application

USAGE
===
Demo app: [https://box-watson.mybluemix.net/](https://box-watson.mybluemix.net/)

* Login with your Box.com username and password

AUTHOR
===
Jeff Sloyer <jbsloyer@us.ibm.com>

CONTRIBUTORS
===
Jake Peyser <jepeyser@us.ibm.com>

LICENSE
===
Apache 2.0. See [LICENSE.txt](LICENSE.txt)
