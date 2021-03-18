# aws-codeartifact

An npm module for using AWS CodeArtifact a little easier

[![npm version](https://img.shields.io/npm/v/@digitalroute/aws-codeartifact.svg?style=flat-square)](https://www.npmjs.org/package/@digitalroute/aws-codeartifact)
[![npm downloads](https://img.shields.io/npm/dm/@digitalroute/aws-codeartifact.svg?style=flat-square)](http://npm-stat.com/charts.html?package=@digitalroute/aws-codeartifact&from=2015-08-01)

## Features

- Configure login details in package.json or as external module
- Different logins for local users and CI

## Quickstart

### Installation

```bash
npm install --save-dev @digitalroute/aws-codeartifact
```

and then add the following to package.json:

```json
{
  "scripts": {
    "ca:login": "aws-codeartifact login",
    "ca:npm-global-config": "aws-codeartifact npm-global-config",
    "ca:npm-local-config": "aws-codeartifact npm-local-config"
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

The `npm` part is used to create local config, i.e for `.npmrc` in a repo.
