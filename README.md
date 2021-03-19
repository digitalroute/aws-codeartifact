# aws-codeartifact

An npm module for using AWS CodeArtifact a little easier

[![npm version](https://img.shields.io/npm/v/@digitalroute/aws-codeartifact.svg?style=flat-square)](https://www.npmjs.org/package/@digitalroute/aws-codeartifact)
[![npm downloads](https://img.shields.io/npm/dm/@digitalroute/aws-codeartifact.svg?style=flat-square)](http://npm-stat.com/charts.html?package=@digitalroute/aws-codeartifact&from=2015-08-01)

## Features

- Configure login details in package.json or as external module
- Different logins for local users and CI

## Quickstart

### Usage

The idea is to not actually install this because it will not be usable in npm scripts if it first needs to be installed and then we have modules that needs the AWS CodeArtifact token already set. So we use `npx` instead...

Add the following to package.json:

```json
{
  "scripts": {
    "codeartifact": "npx --package @digitalroute/aws-codeartifact@^1.0.0 aws-codeartifact",
    "co:login": "AWS_PROFILE=<profile> npm run codeartifact login",
    "co:npm-local-config": "npm run codeartifact npm-local-config"
},
  "awsCodeArtifact": {
    "domain": "digitalroute",
    "repository": "dazzler",
    "namespace": "digitalroute",
    "npm": {
      "registry": "https://digitalroute-812206349901.d.codeartifact.eu-west-1.amazonaws.com/npm/dazzler/",
      "scope": "@digitalroute"
    }
  },
}
```

The `npm` part is used to create local config, i.e for `.npmrc` in the repo.

Now you can use `npm run co:npm-local-config` in your CI if you have `CODEARTIFACT_AUTH_TOKEN` set as enviromnent variable or `npm run co:login` if you have AWS credentials set.
