#!/usr/bin/env node

const { login, setProjectRegistryCopyToken, setProjectRegistryGetToken, deleteRegistry } = require('./codeartifact.js');

const package = process.env.PACKAGE_FILE ? require(process.env.PACKAGE_FILE) : require( process.cwd() + "/package.json" );

if (!package.config.awsCodeArtifact) {
    console.error('No awsCodeArtifact config found');
    process.exit(1);
}

const awsCodeArtifact = package.config.awsCodeArtifact;
const {domain: codeArtifactDomain, repository: codeArtifactRepository, scope: codeArtifactScope, accountId: codeArticactAccountId, region: codeArticactRegion} = awsCodeArtifact;

if (!codeArtifactDomain) {
  console.error('Missing domain config in awsCodeArtifact');
  process.exit(1);
}

if (!codeArtifactRepository) {
  console.error('Missing repository config in awsCodeArtifact');
  process.exit(1);
}

process.argv.slice(2).forEach(async function (arg, index, array) {
  console.log(`processing arg: ${arg}`)

  switch (arg) {
    case 'login':
      await login(codeArtifactDomain, codeArtifactRepository, codeArtifactScope);
      break;

    case 'registry-copy-token':
      await setProjectRegistryCopyToken(codeArtifactDomain, codeArtifactRepository, codeArtifactScope, codeArticactAccountId, codeArticactRegion);
      break;

    case 'registry-aws-token':
      await setProjectRegistryGetToken(codeArtifactDomain, codeArtifactRepository, codeArtifactScope, codeArticactAccountId, codeArticactRegion);
      break;

    case 'registry-delete':
      await deleteRegistry(codeArtifactDomain, codeArtifactRepository, codeArtifactScope, codeArticactAccountId, codeArticactRegion);
      break;

    default:
      console.log(`Command not found: ${command}.`);
  }
});
