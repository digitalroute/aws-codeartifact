const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs')
const readline = require('readline');

const userConfig = '--userconfig .npmrc'

async function runShellCommand(command, mask='') {
  if (mask) {
    console.log(`running: ${command.replace(mask, '<masked>')}`);
  } else {
    console.log(`running: ${command}`);
  }

  try {
    const { stdout, stderr } = await exec(command);
    if (stdout) {
      console.log('stdout:', stdout);
    }
    if (stderr) {
      console.log('stderr:', stderr);
    }
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
    process.exit(1);
  }
}

function getRegistryWithoutProtocol(domain, repository, accountId, region) {
  return `//${domain}-${accountId}.d.codeartifact.${region}.amazonaws.com/npm/${repository}/`;
}

function getRegistry(domain, repository, accountId, region) {
  return 'https:' + getRegistryWithoutProtocol(domain, repository, accountId, region);
}

async function setNpmRegistry(domain, repository, scope, accountId, region) {
  const registry = getRegistry(domain, repository, accountId, region);
  if (scope) {
    await runShellCommand(`npm config set @${scope}:registry ${registry} ${userConfig}`);
  } else {
    await runShellCommand(`npm config set registry ${registry} ${userConfig}`);
  }
}

async function deleteNpmRegistry(scope) {
  if (scope) {
    await runShellCommand(`npm config delete @${scope}:registry ${userConfig}`);
  } else {
    await runShellCommand(`npm config delete registry ${userConfig}`);
  }
}

async function setNpmAlwaysAuth(domain, repository, accountId, region) {
  const registryWithoutProtocol = getRegistryWithoutProtocol(domain, repository, accountId, region);
  await runShellCommand(`npm config set ${registryWithoutProtocol}:always-auth true ${userConfig}`);
}

async function deleteNpmAlwaysAuth(domain, repository, accountId, region) {
  const registryWithoutProtocol = getRegistryWithoutProtocol(domain, repository, accountId, region);
  await runShellCommand(`npm config delete ${registryWithoutProtocol}:always-auth ${userConfig}`);
}

async function setNpmToken(domain, repository, accountId, region, token) {
  const registryWithoutProtocol = getRegistryWithoutProtocol(domain, repository, accountId, region);
  await runShellCommand(`npm config set ${registryWithoutProtocol}:_authToken ${token} ${userConfig}`, token);
}

async function deleteNpmToken(domain, repository, accountId, region) {
  const registryWithoutProtocol = getRegistryWithoutProtocol(domain, repository, accountId, region);
  await runShellCommand(`npm config delete ${registryWithoutProtocol}:_authToken ${userConfig}`);
}

async function getTokenFromUserConfig(domain, repository, accountId, region) {
  const registryWithoutProtocol = getRegistryWithoutProtocol(domain, repository, accountId, region);
  const nodeRcFile=`${process.env.HOME}/.npmrc`;
  const rl = readline.createInterface({
    input: fs.createReadStream(nodeRcFile),
    output: process.stdout,
    terminal: false
  });

  let token='';
  const myReg = new RegExp(`^${registryWithoutProtocol}:_authToken=(.*)`);
  for await (const line of rl) {
    const myMatch = line.match(myReg)
    if (myMatch) {
      return myMatch[1];
    }
  }

  return token;
}

/*
** Get AWS CodeArtifact token from AWS using aws cli
*/

async function getTokenFromAws(domain, accountId) {
  const command = `aws codeartifact get-authorization-token --domain ${domain} --domain-owner ${accountId} --query authorizationToken --output text`;
  try {
    const { stdout, stderr } = await exec(command);
    if (stdout) {
      return stdout.replace(/\n*$/, "");
    }
    if (stderr) {
      console.log('stderr:', stderr);
    }
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
    process.exit(1);
  }
}

/*
** Login using aws cli
*/

async function login(domain, repository, scope) {
  const namespaceString = scope ? `--namespace ${scope}` : ""
  await runShellCommand(`aws codeartifact login --tool npm ${namespaceString} --repository ${repository} --domain ${domain}`)
}

/*
**
*/

async function setProjectRegistryCopyToken(domain, repository, scope, accountId, region) {
  const registryWithoutProtocol = `//${domain}-${accountId}.d.codeartifact.${region}.amazonaws.com/npm/${repository}/`;
  const registry = `https:${registryWithoutProtocol}`;

  await setNpmRegistry(domain, repository, scope, accountId, region);
  await setNpmAlwaysAuth(domain, repository, accountId, region);

  token = process.env.CODEARTIFACT_AUTH_TOKEN ? process.env.CODEARTIFACT_AUTH_TOKEN : await getTokenFromUserConfig(domain, repository, accountId, region)
  await setNpmToken(domain, repository, accountId, region, token);
}

/*
**
*/

async function setProjectRegistryGetToken(domain, repository, scope, accountId, region) {
  const registryWithoutProtocol = `//${domain}-${accountId}.d.codeartifact.${region}.amazonaws.com/npm/${repository}/`;
  const registry = `https:${registryWithoutProtocol}`;
  const userConfig = '--userconfig .npmrc'

  await setNpmRegistry(domain, repository, scope, accountId, region);
  await setNpmAlwaysAuth(domain, repository, accountId, region);

  const token = await getTokenFromAws(domain, accountId);
  await setNpmToken(domain, repository, accountId, region, token);
}

/*
**
*/

async function deleteRegistry(domain, repository, scope, accountId, region) {
  const registryWithoutProtocol = `//${domain}-${accountId}.d.codeartifact.${region}.amazonaws.com/npm/${repository}/`;
  const userConfig = '--userconfig .npmrc'

  await deleteNpmRegistry(scope);
  await deleteNpmAlwaysAuth(domain, repository, accountId, region);
  await deleteNpmToken(domain, repository, accountId, region);
}

module.exports = {
  login: login,
  setProjectRegistryCopyToken: setProjectRegistryCopyToken,
  setProjectRegistryGetToken: setProjectRegistryGetToken,
  deleteRegistry: deleteRegistry
};
