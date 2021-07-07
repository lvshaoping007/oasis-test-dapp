
// @ts-check

import * as oasis from '@oasisprotocol/client';
import * as oasisRT from '@oasisprotocol/client-rt';

import * as oasisExt from '@oasisprotocol/client-ext-utils';


const haveInterActive = true
const extPath = haveInterActive ? '/oasis-xu-frame.html?test_noninteractive=1' : undefined;

function toBase64(/** @type {Uint8Array} */ u8) {
  return btoa(String.fromCharCode.apply(null, u8));
}

export const playground = (async function () {
  console.log('connecting');
  // const connection = await oasisExt.connection.connect(extOrigin, extPath);
  const extension_url = "chrome-extension://blgopabeahlgefobchbgbkekajmbnfmh"
  // 第一步 连接账户
  const connection = await oasisExt.connection.connect(extension_url, extPath);
  console.log('connected==', connection);

  //第二步 获取所有的key
  console.log('listing keys');
  const keys = await oasisExt.keys.list(connection);
  console.log('listed keys');
  console.log('keys', keys);

  // 第三步 获取签名者
  console.log('requesting signer');
  const signer = await oasisExt.signature.ExtContextSigner.request(connection, keys[0].which);
  console.log('got signer');
  //第四步 公钥
  const publicKey = signer.public();
  console.log('public key base64', toBase64(publicKey));
  console.log(
    'address bech32',
    oasis.staking.addressToBech32(await oasis.staking.addressFromPublicKey(publicKey)),
  );
  //第五步 获取收款地址
  const dst = oasis.signature.NaclSigner.fromRandom('this key is not important');
  
  // 第六步 打包交易
  const tw = oasis.staking
    .transferWrapper()
    .setNonce(101n)
    .setFeeAmount(oasis.quantity.fromBigInt(102n))
    .setFeeGas(103n)
    .setBody({
      to: await oasis.staking.addressFromPublicKey(dst.public()),
      amount: oasis.quantity.fromBigInt(104n),
    });
  console.log('requesting signature');
  // 第七步 签名
  await tw.sign(signer, 'fake-chain-context-for-testing');
  console.log('got signature');
  console.log('signature base64', toBase64(tw.signedTransaction.signature.signature));

  
  // const rtw = new oasisRT.accounts.Wrapper(oasis.misc.fromString('fake-runtime-id-for-testing'))
  //   .callTransfer()
  //   .setBody({
  //     to: await oasis.staking.addressFromPublicKey(dst.public()),
  //     amount: [oasis.quantity.fromBigInt(105n), oasis.misc.fromString('TEST')],
  //   })
  //   .setSignerInfo([
  //     {
  //       address_spec: { signature: { ed25519: publicKey } },
  //       nonce: 106n,
  //     },
  //   ])
  //   .setFeeAmount([oasis.quantity.fromBigInt(107n), oasisRT.token.NATIVE_DENOMINATION])
  //   .setFeeGas(108n);
  // console.log('requesting signature');
  // await rtw.sign([signer], 'fake-chain-context-for-testing');
  // console.log('got signature');
  // console.log('signature base64', toBase64(rtw.unverifiedTransaction[1][0].signature));
})();

playground.catch((e) => {
  console.error(e);
});