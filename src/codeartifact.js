const util = require('util');
const exec = util.promisify(require('child_process').exec);

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

async function login(domain, repository, scope) {
  const namespaceString = scope ? `--namespace ${scope}` : ""
  await runShellCommand(`aws codeartifact login --tool npm ${namespaceString} --repository ${repository} --domain ${domain}`)
}

module.exports = {
  login: login,
};
