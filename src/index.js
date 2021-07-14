
// @ts-check

import * as oasis from '@oasisprotocol/client';
import * as oasisRT from '@oasisprotocol/client-rt';

import * as oasisExt from '@oasisprotocol/client-ext-utils';
let grpc = ""

const oasisClient = new oasis.client.NodeInternal("grpc")

const haveInterActive = false
const extPath = haveInterActive ? '/oasis-xu-frame.html?test_noninteractive=1' : undefined;

function toBase64(/** @type {Uint8Array} */ u8) {
  return btoa(String.fromCharCode.apply(null, u8));
}

function hex2uint(hex) {
  return new Uint8Array(Buffer.from(hex, 'hex'))
}
function uint2hex(uint) {
  return Buffer.from(uint).toString('hex')
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

  let extensionId = "fdkfkdobkkgngljecckfaeiabkinnnij"

  const extension_url = "chrome-extension://" + extensionId

  // blgopabeahlgefobchbgbkekajmbnfmh   ext
  // fdkfkdobkkgngljecckfaeiabkinnnij     my ext
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
      console.log('connection===', connection)
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
      const keys = await oasisExt.keys.list(connection).catch(err => err);
      let result = keys
      if (Array.isArray(keys)) {
        result = keys
      } else {
        result = keys.error
      }
      account = result
      accountsResults.innerHTML = result || 'Not able to get accounts'
    }
  }



  // transfer

  const sendButton = document.getElementById('sendButton')
  const sendAmountInput = document.getElementById('sendAmountInput')
  const receiveAddressInput = document.getElementById('receiveAddressInput')


  const sendNonceInput = document.getElementById('sendNonceInput')
  const sendFeeGasInput = document.getElementById('sendFeeGasInput')
  const sendFeeAmountInput = document.getElementById('sendFeeAmountInput')
  const sendResultDisplay = document.getElementById('sendResultDisplay')

  /**
   * send transfer
   */
  sendButton.onclick = async () => {
    try {


      // 设置转账金额
      // 设置收款金额
      // 设置nonce
      // 设置feeGas
      // 设置feeAmount

      let from = account && account.length > 0 ? account[0] : ""

      const signer = await oasisExt.signature.ExtContextSigner.request(connection, from).catch(err => err);
      console.log('web---got signer', signer);
      if (signer.error) {
        alert(signer.error)
        return
      }
      //第四步 公钥
      const publicKey = signer.public();
      console.log('web---public key base64', toBase64(publicKey));
      console.log(
        'web---address bech32',
        oasis.staking.addressToBech32(await oasis.staking.addressFromPublicKey(publicKey)),
      );

      //第五步 获取收款地址

      let sendAmount = sendAmountInput.value || 2
      sendAmount = oasis.quantity.fromBigInt(sendAmount)

      let receiveAddress = receiveAddressInput.value || "oasis1qzaa7s3df8ztgdryn8u8zdsc8zx0drqsa5eynmam"
      receiveAddress = await oasis.staking.addressFromBech32(receiveAddress)

      let sendNonce = sendNonceInput.value || 43

      let sendFeeGas = sendFeeGasInput.value || 3000
      sendFeeGas = oasis.quantity.fromBigInt(sendFeeGas)

      let sendFeeAmount = sendFeeAmountInput.value || 0
      sendFeeAmount = oasis.quantity.fromBigInt(sendFeeAmount)



      const tw = oasis.staking
        .transferWrapper()
        .setNonce(sendNonce)
        .setFeeAmount(sendFeeAmount)
        .setFeeGas(sendFeeGas)
        .setBody({
          to: receiveAddress,
          amount: sendAmount,
        });
      await tw.sign(signer, 'fake-chain-context-for-testing');
      let signature = hex2uint(tw.signedTransaction.signature.signature)
      
      await tw.submit(oasisClient);
      
      let hash = await tw.hash()

      sendResultDisplay.innerHTML = hash || ''
    } catch (error) {
      sendResultDisplay.innerHTML = error || ''
    }
  }


  /**
   * add Escrow
   */

  /**
   * add escrow
   */
  const addEscrowButton = document.getElementById('addEscrowButton')
  const addEscrowAmountInput = document.getElementById('addEscrowAmountInput')
  const vaildatorAddressInput = document.getElementById('vaildatorAddressInput')
  const addEscrowResultDisplay = document.getElementById('addEscrowResultDisplay')

  const stakeNonceInput = document.getElementById('stakeNonceInput')
  const stakeFeeGasInput = document.getElementById('stakeFeeGasInput')
  const stakeFeeAmountInput = document.getElementById('stakeFeeAmountInput')

  addEscrowButton.onclick = async () => {
    let from = account && account.length > 0 ? account[0] : ""
    console.log("web---sendButton===from", from)
    console.log("web---sendButton===connection", connection)

    const signer = await oasisExt.signature.ExtContextSigner.request(connection, from).catch(err => err);
    console.log('web---got signer', signer);


    let addEscrowAmount = addEscrowAmountInput.value || 2
    addEscrowAmount = oasis.quantity.fromBigInt(addEscrowAmount)

    let vaildatorAddress = vaildatorAddressInput.value || "oasis1qzaa7s3df8ztgdryn8u8zdsc8zx0drqsa5eynmam"
    vaildatorAddress = await oasis.staking.addressFromBech32(vaildatorAddress)

    let stakeNonce = stakeNonceInput.value || 43

    let stakeFeeGas = stakeFeeGasInput.value || 3000
    stakeFeeGas = oasis.quantity.fromBigInt(stakeFeeGas)

    let stakeFeeAmount = stakeFeeAmountInput.value || 0
    stakeFeeAmount = oasis.quantity.fromBigInt(stakeFeeAmount)


    //第五步 获取收款地址
    const dst = oasis.signature.NaclSigner.fromRandom('this key is not important');


    const tw = oasis.staking
      .addEscrowWrapper()
      .setNonce(stakeNonce)
      .setFeeAmount(stakeFeeAmount)
      .setFeeGas(stakeFeeGas)
      .setBody({
        account: vaildatorAddress,
        amount: addEscrowAmount,
      });
    // 第七步 签名
    let res = await tw.sign(signer, 'fake-chain-context-for-testing');
    let signature = hex2uint(tw.signedTransaction.signature.signature)
    let base64Sign = toBase64(signature)
    let hash = await tw.hash()
    addEscrowResultDisplay.innerHTML = hash || ''
  }
})();

playground.catch((e) => {
  console.error(e);
});