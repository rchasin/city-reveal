const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');
const { GetObjectCommand, S3Client } = require('@aws-sdk/client-s3');

let secrets = {};

// This would be better, but we can't use it if we don't want to run
// the lambda in the VPC (requiring a NAT gateway)
const loadSecretsViaSecretsManager = async () => {
  if (process.env.NODE_ENV === 'production') {
    const secret_name = `city-reveal/${process.env.ENVIRONMENT}.json`;
    const client = new SecretsManagerClient({
      region: 'us-east-1',
    });

    let response;

    try {
      response = await client.send(
        new GetSecretValueCommand({
          SecretId: secret_name,
          VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
        })
      );
    } catch (error) {
      // For a list of exceptions thrown, see
      // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
      throw error;
    }

    secrets = JSON.parse(response.SecretString);
  }
};

const loadSecretsViaS3 = async () => {
  if (process.env.NODE_ENV === 'production') {
    const bucket = 'rchasin-city-reveal';
    const key = `secrets/${process.env.ENVIRONMENT}.json`;
    const client = new S3Client({
      region: 'us-east-1',
    });

    let response;

    try {
      response = await client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key
        })
      );
    } catch (error) {
      throw error;
    }

    secrets = JSON.parse(await response.Body.transformToString());
  }
};

const loadSecrets = () => loadSecretsViaS3();

const getSecret = (key) => {
  // Prefer environment variable override if set
  return process.env[key] ?? secrets[key];
};

module.exports = { loadSecrets, getSecret };
