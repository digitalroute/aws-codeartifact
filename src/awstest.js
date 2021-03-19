#!/usr/bin/env node

const { CodeartifactClient, GetAuthorizationTokenCommand } = require("@aws-sdk/client-codeartifact");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { STS } = require("@aws-sdk/client-sts");

async function assume(sourceCreds, params) {
	const sts = new STS({credentials: sourceCreds});
	const result = await sts.assumeRole(params);
	if(!result.Credentials) {
		throw new Error("unable to assume credentials - empty credential object");
	}
	return {
		accessKeyId: String(result.Credentials.AccessKeyId),
		secretAccessKey: String(result.Credentials.SecretAccessKey),
		sessionToken: result.Credentials.SessionToken
	}
}

const client = new CodeartifactClient({ region: 'eu-west-1', credentials: defaultProvider({roleAssumer: assume}) });

const kalle = new GetAuthorizationTokenCommand({
  "domain": "digitalroute",
  "domainOwner": "812206349901"
 })

client.send(kalle).then(
  (data) => {
    console.log(data);
    // process data.
  },
  (error) => {
    console.log(error);

    // error handling.
  }
);
