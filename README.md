# aws-codeartifact

An npm module for using AWS CodeArtifact a little easier. Idea is to be able to configure AWS CodeArtifact in `package.json`.

[![npm version](https://img.shields.io/npm/v/aws-codeartifact.svg?style=flat-square)](https://www.npmjs.org/package/aws-codeartifact)
[![npm downloads](https://img.shields.io/npm/dm/aws-codeartifact.svg?style=flat-square)](http://npm-stat.com/charts.html?package=aws-codeartifact&from=2015-08-01)

## Features

- Configure login details in package.json or as external module
- Different logins for local users and CI

## Quickstart

### Usage

You can install it as a dev dependency to use it in your CI for example, but it will be like the chicken and the egg if you want to use it for login to AWS CodeArtifact since the module will not be installed until after `npm install` and you propably need to log in before running that... So, instead, either use the normal aws command for logging in or use npx. We can take advantage of the npm config even for the static aws command, see `co:login` below.

Add the following to package.json:

```json
{
  "scripts": {
    "co:login": "AWS_PROFILE=<aws-profile> aws codeartifact login --tool npm --namespace ${npm_package_config_awsCodeArtifact_scope} --repository ${npm_package_config_awsCodeArtifact_repository} --domain ${npm_package_config_awsCodeArtifact_domain}",
    "co:login-npx": "AWS_PROFILE=<profile> npx aws-codeartifact login",
    "codeartifact:registry-copy-token": "aws-codeartifact registry-copy-token",
    "codeartifact:registry-aws-token": "aws-codeartifact registry-aws-token"
},
  "config": {
    "awsCodeArtifact": {
      "domain": "<domain-in-aws-codeartifact>",
      "repository": "<repository-in-codeartifact>",
      "scope": "<scope>",
      "region": "<aws-region>",
      "accountId": "<aws-account-id>"
    }
  },
}
```

One binary will be installed called `aws-codeartifact`. It has two "commands":

#### Login

Use to do the AWS CodeArtifact login, will put the login info in `~/.npmrc`. As explained above with the chickend and egg analogy, it is not possible to use this as an npm script, since the module is not installed. You could install the module globally but not sure that is very beneficial, at least in our organisation we want to not having developers installing a lot of things globally.

```bash
aws-codeartifact login
```

#### registry-copy-token

Will try to create or update a local project config (`.npmrc`) for AWS CodeArtifact. Will use `CODEARTIFACT_AUTH_TOKEN` environment variable as the login token if set, otherwise it will try to parse it from `~/.npmrc`.

```bash
aws-codeartifact registry-copy-token
```

#### registry-aws-token

Will try to create or update a local project config (`.npmrc`) for AWS CodeArtifact. Will try to get a new token from AWS using aws cli.

```bash
aws-codeartifact registry-aws-token
```

#### registry-delete

Will remove the registry from your `.npmrc` file because sometime you dont have this git ignored for example.

```bash
aws-codeartifact registry-delete
```

