const fs = require('fs');
const core = require('@actions/core');
const fetch = require('node-fetch');
const pki = require('node-forge').pki;

const input = {
  apiEndpoint: core.getInput('api-endpoint') || process.env.INPUT_API_ENDPOINT,
  accessKeyType: core.getInput('access-key-type') || process.env.INPUT_ACCESS_KEY_TYPE,
  accessKeyId: core.getInput('access-key-id') || process.env.INPUT_ACCESS_KEY_ID,
  accessKey: core.getInput('access-key') || process.env.INPUT_ACCESS_KEY,
  certId: parseInt(core.getInput('cert-id') || process.env.INPUT_CERT_ID),
  fullchainFile: core.getInput('fullchain-file') || process.env.INPUT_FULLCHAIN_FILE,
  keyFile: core.getInput('key-file') || process.env.INPUT_KEY_FILE,
};

function getReqUrl(path) {
  return new URL(path, input.apiEndpoint).toString();
}

function base64Encode(str) {
  return Buffer.from(str).toString('base64');
}

function base64Decode(str) {
  return Buffer.from(str, 'base64').toString('utf8');
}

async function main() {
  const token = await fetch(getReqUrl('/APIAccessTokenService/getAPIAccessToken'), {
    method: 'POST',
    body: JSON.stringify({
      type: input.accessKeyType,
      accessKeyId: input.accessKeyId,
      accessKey: input.accessKey,
    }),
  })
    .then((res) => res.json())
    .then((json) => json.data.token);

  core.debug('Got token.');

  async function doRequest(path, body) {
    return await fetch(getReqUrl(path), {
      method: 'POST',
      headers: {
        'X-Edge-Access-Token': token,
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  }

  const cert = fs.readFileSync(input.fullchainFile, 'utf8');
  const key = fs.readFileSync(input.keyFile, 'utf8');
  const encCert = base64Encode(cert);
  const encKey = base64Encode(key);
  const certInfo = pki.certificateFromPem(cert);

  const data = await doRequest('/SSLCertService/findEnabledSSLCertConfig', {
    sslCertId: input.certId,
  }).then((res) => JSON.parse(base64Decode(res.data.sslCertJSON)));

  const res = await doRequest('/SSLCertService/updateSSLCert', {
    sslCertId: input.certId,
    isOn: true,
    name: data.name,
    description: data.description,
    serverName: certInfo.subject.getField('CN').value,
    isCA: data.isCA,
    certData: encCert,
    keyData: encKey,
    timeBeginAt: parseInt((certInfo.validity.notBefore.getTime() / 1000).toFixed(0)),
    timeEndAt: parseInt((certInfo.validity.notAfter.getTime() / 1000).toFixed(0)),
    dnsNames: certInfo.extensions
      .find((item) => item.name === 'subjectAltName')
      .altNames.map((item) => item.value),
    commonNames: certInfo.issuer.attributes.map((attr) => attr.value), // FIXME
  });

  core.debug(res);

  console.log('Uploaded cert.');
}

main().catch((err) => core.setFailed(err.message));
