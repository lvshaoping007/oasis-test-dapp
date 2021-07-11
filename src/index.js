
// @ts-check

import * as oasis from '@oasisprotocol/client';
import * as oasisRT from '@oasisprotocol/client-rt';

import * as oasisExt from '@oasisprotocol/client-ext-utils';


const haveInterActive = false
const extPath = haveInterActive ? '/oasis-xu-frame.html?test_noninteractive=1' : undefined;

function toBase64(/** @type {Uint8Array} */ u8) {
  return btoa(String.fromCharCode.apply(null, u8));
}


let connection
let account
export const playground = (async function () {

  // 1,点击connect 去连接账户
  // 2，如果有connect ，则可以点击获取账户


  // 3，输入转账金额和收款地址 
  // 获取签名者
  // 打包交易
  // 4，签名
  const extension_url = "chrome-extension://blgopabeahlgefobchbgbkekajmbnfmh"

  // ID：blgopabeahlgefobchbgbkekajmbnfmh
  // ID：fdkfkdobkkgngljecckfaeiabkinnnij
  const onboardButton = document.getElementById('connectButton')
  const getAccountsButton = document.getElementById('getAccounts')
  const accountsResults = document.getElementById('getAccountsResult')

  onboardButton.onclick = async () => {
    console.log('onboardButton')
    // todo 1 如何判断已经安装插件
    if (!connection) {
      // alert("请先安装oasis-extension-wallet")
      onboardButton.innerText = 'Onboarding in progress'
      connection = await oasisExt.connection.connect(extension_url, extPath);
      console.log('connection===',connection)
      if (connection) {
        onboardButton.innerText = 'Connected'
        onboardButton.disabled = true
      } else {
        onboardButton.innerText = 'Connect'
        onboardButton.disabled = false
      }
    } else {
      onboardButton.innerText = 'Connected'
      onboardButton.disabled = true
    }
  }
  /**
   * get account
   */
  getAccountsButton.onclick = async () => {
    if (connection) {
      const keys = await oasisExt.keys.list(connection);
      console.log(keys)
      account = keys
      accountsResults.innerHTML = keys || 'Not able to get accounts'
    }
  }



  // transfer

  const sendButton = document.getElementById('sendButton')
  const sendAmountInput = document.getElementById('sendAmountInput')
  const receiveAddressInput = document.getElementById('receiveAddressInput')
  const sendResultDisplay = document.getElementById('sendResultDisplay')

  /**
   * send transfer
   */
  sendButton.onclick = async () => {
    let from = account && account.length > 0 ? account[0] : ""
    console.log("web---sendButton===from",from)
    console.log("web---sendButton===connection",connection)
    const signer = await oasisExt.signature.ExtContextSigner.request(connection, from);
    console.log('web---got signer');

    //第四步 公钥
    const publicKey = signer.public();
    console.log('web---public key base64', toBase64(publicKey));
    console.log(
      'web---address bech32',
      oasis.staking.addressToBech32(await oasis.staking.addressFromPublicKey(publicKey)),
    );

    //第五步 获取收款地址
    const dst = oasis.signature.NaclSigner.fromRandom('this key is not important');

    const tw = oasis.staking
      .transferWrapper()
      .setNonce(101n)
      .setFeeAmount(oasis.quantity.fromBigInt(102n))
      .setFeeGas(103n)
      .setBody({
        to: await oasis.staking.addressFromPublicKey(dst.public()),
        amount: oasis.quantity.fromBigInt(104n),
      });
    console.log('web---requesting signature');
    // 第七步 签名
    await tw.sign(signer, 'fake-chain-context-for-testing');
    console.log('web---got signature');
    console.log('web---signature base64', toBase64(tw.signedTransaction.signature.signature));
    // let signResult = await window.oasis.signTransaction({
    //   amount: sendAmountInput.value,
    //   from: from,
    //   to: receiveAddressInput.value,
    // })
    // sendResultDisplay.innerHTML = signResult.error || signResult.hash
  }





  /*
  
    console.log('connecting');
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
  
    */
})();

playground.catch((e) => {
  console.error(e);
});