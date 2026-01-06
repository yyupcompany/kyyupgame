const sdk = require('@alicloud/kms-sdk');
console.log('Keys:', Object.keys(sdk));
console.log('Has default:', !!sdk.default);
console.log('Has KMS:', !!sdk.KMS);
if (sdk.default) {
  console.log('default keys:', Object.keys(sdk.default));
}
