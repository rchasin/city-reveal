const serverless = require("serverless-http");

const { startApp } = require("./app");

let serverlessApp;

// See https://stackoverflow.com/questions/47848336/how-to-return-a-promise-to-serverless-http
const handler = async function (event, context) {
  console.log(event);
  if (serverlessApp === undefined) {
    console.log("Wrapping in serverless app");
    const app = await startApp();
    serverlessApp = serverless(app);
  }
  return serverlessApp(event, context);
};

module.exports = { handler };
