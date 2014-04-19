then-home-grid-api
==================

Beginning work on the Then Home Grid API.

### To run locally ###

To install the application locally firstly you will need to install the dependencies using
npm install.

You will also need to login to Heroku to upload any changes to the production environment.

To run the app locally, make sure you have the Heroku Toolbelt https://toolbelt.heroku.com/
Installed.

Then use

<code>foreman start</code>

To start the server locally.

Once you have done a change, to push this change use

<code> git push heroku master </code>
to push your change to Heroku production.

Note : You will need to ensure that you have at least one dyno running web process, so type :
heroku ps:scale web=1

You can check the start of the dyno using :
heroku ps

You may need to add more dynos later on.

To open the app in a browser just type
heroku open

To check out the logs use
heroku logs

So process for new piece of code you want to test on production.

Commit it, and push it to github.
then  git push heroku master
and that's it!


References for this information : https://devcenter.heroku.com/articles/getting-started-with-nodejs#prerequisites