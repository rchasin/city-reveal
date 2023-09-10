# city-reveal
Server node app as an OwnTracks consumer and client react app for visualizing your visited locations.
No user support is built into the client yet, so you have to hard-code the user id that comes with the data when running the client. There is also no auth yet so really it's meant for a single person to use.
And the client is not set up for deployment anywhere, can only be run locally and against a local server (as the production server is not deployed with CORS support). However the server must be deployed to receive location data.

Server deployment to AWS:
* Run a postgres database somewhere, creating DB `cityreveal` and running `src/ddls/01_initial_setup.sql` on it to create the tables.
* Create an S3 bucket and put a file at path `city-reveal/prod.json` containing `{"PG_CONNECTION_STRING": "postgresql://user:password@host:port/cityreveal"}`
* Install `serverless` and run: `serverless deploy --stage prod --param "s3_bucket=<an s3 bucket you create>"` (assumes you have AWS credentials available, e.g. in ~/.aws/credentials for a default profile)

This deploys to AWS lambda with AWS API Gateway in us-east-1. Find the API endpoint it is deployed to by going to your lambda in the AWS console -> Configuration -> Triggers.

OwnTracks configuration:
* Download and install OwnTracks app. Works best in "move mode" but this takes quite a bit of battery.
* Configure the connection
  * Mode: `HTTP`
  * Host: `<the url of your lambda>/api/ownTracks`
  * Identification: Username: `choose a user id`, Device ID: `whatever you want`

Local run:
* Run server locally with `npm run start` from src/, first exporting an environment variable `PG_CONNECTION_STRING` with the secret connection string.
* Run client locally on port 3001 against local server (assumed on port 3000) with `REACT_APP_USER_ID="<chosen user id>" REACT_APP_API_BASE="http://localhost:3000" PORT=3001 npm run start` from src/client/.

Example of viewing the client:
![map with locations visited colored in blue](https://github.com/rchasin/city-reveal/blob/main/readme_images/example_map.png?raw=true)
