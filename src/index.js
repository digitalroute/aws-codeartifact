#!/usr/bin/env node

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const package = require( process.cwd() + "/package.json" );

if (!package.awsCodeArtifact) {
    console.error('No awsCodeArtifact config found');
    process.exit(1);
}

const awsCodeArtifact = package.awsCodeArtifact;

async function runShellCommand(command) {
  console.log(`running: ${command}`);
  try {
    const { stdout, stderr } = await exec(command);
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
    process.exit(1);
  }
}

async function processArg(arg) {
  console.log(`processing arg: ${arg}`)

  switch (arg) {
    case 'login':
      const {domain, repository, namespace} = awsCodeArtifact;
      if (!domain) {
        console.error('Missing domain config in awsCodeArtifact');
        process.exit(1);
      }
      if (!repository) {
        console.error('Missing repository config in awsCodeArtifact');
        process.exit(1);
      }

      const namespaceString = namespace ? `--namespace ${namespace}` : ""
      await runShellCommand(`aws codeartifact login --tool npm ${namespaceString} --repository ${repository} --domain ${domain}`)
      break;

    case 'npm-global-config':
    case 'npm-local-config':
      const { npm } = awsCodeArtifact;
      if (!npm) {
        console.error('Missing npm block in awsCodeArtifact');
        process.exit(1);
      }

      const { registry, scope } = npm;
      if (!registry) {
        console.error('Missing registry config in npm block');
        process.exit(1);
      }

      const userConfig = arg === 'npm-local-config' ? '--userconfig .npmrc' : ''

      if (scope) {
        await runShellCommand(`npm config set ${scope}:registry ${registry} ${userConfig}`);
      } else {
        await runShellCommand(`npm config set registry ${registry} ${userConfig}`);
      }

      const registryWithoutProtocol = registry.replace(/^https:|^http:/gi, '');
      await runShellCommand(`npm config set ${registryWithoutProtocol}:always-auth true ${userConfig}`);
      await runShellCommand(`npm config set ${registryWithoutProtocol}:_authToken \${CODEARTIFACT_AUTH_TOKEN} ${userConfig}`);

      break;

    default:
      console.log(`Command not found: ${command}.`);
  }
}

const arg = process.argv[2] ? process.argv[2] : "default"
processArg(arg);
