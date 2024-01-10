const fs = require('fs');
const core = require('@actions/core');
const fetch = require('node-fetch');

const input = {
  id: parseInt(core.getInput('id')) || process.env.INPUT_ID,
  hostname: core.getInput('hostname') || process.env.INPUT_HOSTNAME,
  accessKey: core.getInput('access-key') || process.env.INPUT_ACCESS_KEY,
  fullchainFile: core.getInput('fullchain-file') || process.env.INPUT_FULLCHAIN_FILE,
  keyFile: core.getInput('key-file') || process.env.INPUT_KEY_FILE,
};

function base64Encode(str) {
  return Buffer.from(str).toString('base64');
}

async function main() {
  async function doRequest(body) {
    return await fetch(new URL(`https://api.bunny.net/pullzone/${input.id}/addCertificate`).toString(), {
      method: 'POST',
      headers: {
        'AccessKey': input.accessKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    }).then((res) => res.status);
  }

  const cert = fs.readFileSync(input.fullchainFile, 'utf8');
  const key = fs.readFileSync(input.keyFile, 'utf8');
  const encCert = base64Encode(cert);
  const encKey = base64Encode(key);

  const res = await doRequest({
    Hostname: input.hostname,
    Certificate: encCert,
    CertificateKey: encKey,
  });

  core.debug(res);

  if (res !== 204) {
    throw new Error(`status code expecting 204, got ${res}`)
  }

  console.log('Uploaded cert.');
}

main().catch((err) => core.setFailed(err.message));
