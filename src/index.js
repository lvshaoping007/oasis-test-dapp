
// @ts-nocheck
import * as oasis from '@oasisprotocol/client';
import * as oasisExt from '@oasisprotocol/client-ext-utils';

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

async function publicKeyToAddress(publicKey){
  let address
  let public_key = publicKey?.metadata?.public_key || ""
  if (public_key) {
    console.log('publicKey', uint2hex(public_key))
    const data = await oasis.staking.addressFromPublicKey(public_key)
    address = oasis.staking.addressToBech32(data)
    account.public_key = public_key
    account.address = address
  }
  
  return address
}

/**
 * use grpc get nonce
 * @param {*} address 
 */
async function getNonce(address) {
  const oasisClient = getOasisClient()
  let publicKey = await oasis.staking.addressFromBech32(address)
  const nonce = await oasisClient.consensusGetSignerNonce({
    account_address: publicKey,
    height: oasis.consensus.HEIGHT_LATEST
  }) ?? 0;
  console.log('getNonce===nonce', nonce)
  return nonce
}
/**
 * use grpc get nonce
 * @param {*} address 
 */
async function getUseBalance(address) {
  const oasisClient = getOasisClient()
  let shortKey = await oasis.staking.addressFromBech32(address)
  let height = oasis.consensus.HEIGHT_LATEST
  let account = await oasisClient.stakingAccount({ height: height, owner: shortKey, }).catch((err) => err)
  if (account && account.code && account.code !== 0) {
    return { err: account }
  }
  let balance = account?.general?.balance || 0
  balance = oasis.quantity.toBigInt(balance).toString()
  let nonce = account?.general?.nonce || 0
  return { balance, nonce }
}
/**
 * get grpc client
 * @returns 
 */
function getOasisClient() {
  const oasisClient = new oasis.client.NodeInternal('https://grpc-testnet.oasisscan.com')
  // ("https://grpc-testnet.oasisscan.com")
  return oasisClient
}
// ========================================================================
/**
 * 获取html div
 */


/** top account detail */
const accountsDiv = document.getElementById('accounts')
const balanceDiv = document.getElementById('balance')
const nonceDiv = document.getElementById('nonce')


/** connect and get account */
 const onboardButton = document.getElementById('connectButton')
 const getAccountsButton = document.getElementById('getAccounts')
 const accountsResults = document.getElementById('getAccountsResult')


/** send  transaction*/
 const sendButton2 = document.getElementById('sendButton')
 const sendAmountInput = document.getElementById('sendAmountInput')
 const receiveAddressInput = document.getElementById('receiveAddressInput')

 const sendNonceInput = document.getElementById('sendNonceInput')
 const sendResultDisplay = document.getElementById('sendResultDisplay')



 /** add escrow about */
 const addEscrowButton = document.getElementById('addEscrowButton')
 const addEscrowAmountInput = document.getElementById('addEscrowAmountInput')
 const vaildatorAddressInput = document.getElementById('vaildatorAddressInput')
 const addEscrowResultDisplay = document.getElementById('addEscrowResultDisplay')

 const stakeNonceInput = document.getElementById('stakeNonceInput')
 const stakeFeeGasInput = document.getElementById('stakeFeeGasInput')
 const stakeFeeAmountInput = document.getElementById('stakeFeeAmountInput')


//==============================================================================
function watchKeys(conn, handleNewKeys) {
  console.log('watchKeys======2', conn);
  if (!conn) {
    return
  }
  console.log('watchKeys======3');
  let lastRequested = 0;
  oasisExt.keys.setKeysChangeHandler(conn, (_) => {
    console.log('watchKeys======4');
    const requestSeq = ++lastRequested;
    oasisExt.keys
      .list(conn)
      .then((keys) => {
        console.log('watchKeys======5', keys);
        if (requestSeq !== lastRequested) return;
        console.log('watchKeys======6', keys);
        handleNewKeys(keys);
      })
      .catch((e) => {
        console.error(e);
      });
  });
}



let connection
let account = {}
const playground = (async function () {

  // 1,点击connect 去连接账户
  // 2，如果有connect ，则可以点击获取账户


  // 3，输入转账金额和收款地址 
  // 获取签名者
  // 打包交易
  // 4，签名
  let extensionId = "fdkfkdobkkgngljecckfaeiabkinnnij"
  // "aeiciliacehpifhikhkgkmohihocgain"//"fdkfkdobkkgngljecckfaeiabkinnnij"

  const extension_url = "chrome-extension://" + extensionId

  // blgopabeahlgefobchbgbkekajmbnfmh   ext
  // fdkfkdobkkgngljecckfaeiabkinnnij     my ext


  onboardButton.onclick = async () => {
    console.log('onboardButton')
    // todo 1 如何判断已经安装插件
    if (!connection) {
      // alert("请先安装oasis-extension-wallet")
      onboardButton.innerText = 'Onboarding in progress'
      connection = await oasisExt.connection.connect(extension_url, extPath);
      console.log('connection===', connection)
      if (connection) {
        console.log('watchKeys======0', connection);
        watchKeys(connection, (newKeys) => {
          console.log('watchKeys======1', newKeys);
          console.log('keys change', toBase64(newKeys[0].metadata.public_key));
        });

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

  async function setAccountDetail(address) {
    console.log('setAccountDetail==address',address)

    accountsDiv.innerHTML = address
    let accountDetail = await getUseBalance(address)

    balanceDiv.innerHTML = accountDetail.balance
    nonceDiv.innerHTML = accountDetail.nonce
  }
  /**
   * get account
   */
  getAccountsButton.onclick = async () => {
    if (connection) {
      const keys = await oasisExt.keys.list(connection)
        .catch(err => err);
      let result
      if (keys.length > 0) {
        result = keys[0]
        result = await publicKeyToAddress(result)
        setAccountDetail(result)
        // 授权完账后就开始渲染账户情况
        // 获取账户余额 和nonce  然后显示在页面上
        // nonce 显示在输入框里 和html外面
        accountsResults.innerHTML = result || 'Not able to get accounts'
      } else {
        result = keys.error
        accountsResults.innerHTML = result || 'Not able to get accounts'
      }
    }
  }



  /**
   * send transfer
   */
  sendButton2.onclick = async () => {
    console.log('sendButton=====0', account);
    try {

      // 设置转账金额
      // 设置收款金额
      // 设置nonce
      // 设置feeGas
      // 设置feeAmount
      console.log('sendButton=====0', account);
      let from = account && account.address ? account.address : ""

      // let nonce = await getNonce(from)
      // console.log('getUseBalance==nonce',nonce)
      console.log('sendButton=====1', from);
      console.log('sendButton=====1-1', connection);
      const signer = await oasisExt.signature.ExtContextSigner.request(connection, from).catch(err => err);
      console.log('sendButton=====2', signer);
      console.log('web---got signer', signer);
      if (signer.error) {
        alert(signer.error)
        return
      }
      //第四步 公钥
      const publicKey = signer.public();

      const oasisClient = getOasisClient()
      let accountDetail = await getUseBalance(from)
      console.log('getUseBalance==balance', accountDetail)
      //第五步 获取收款地址

      let sendAmount = sendAmountInput.value || 2
      sendAmount = oasis.quantity.fromBigInt(sendAmount)

      let receiveAddress = receiveAddressInput.value || "oasis1qzaa7s3df8ztgdryn8u8zdsc8zx0drqsa5eynmam"
      receiveAddress = await oasis.staking.addressFromBech32(receiveAddress)

      let sendNonce = sendNonceInput.value || accountDetail.nonce


      let sendFeeAmount = 0n

      const tw = oasis.staking.transferWrapper()
      tw.setNonce(sendNonce)

      let lastFeeAmount = sendFeeAmount
      tw.setFeeAmount(oasis.quantity.fromBigInt(BigInt(lastFeeAmount)))

     

      

      tw.setBody({
        to: receiveAddress,
        amount: sendAmount,
      })
      let feeGas = await tw.estimateGas(oasisClient, publicKey)
      let sendFeeGas = feeGas
      tw.setFeeGas(sendFeeGas)

      let chainContext = await oasisClient.consensusGetChainContext()
      await tw.sign(signer, chainContext)

      console.log('sendButton=====5', tw.signedTransaction.signature.signature);
      console.log('sendButton=====6', uint2hex(tw.signedTransaction.signature.signature));

      console.log('sendButton=====7', tw.signedTransaction.untrusted_raw_value);
      console.log('sendButton=====8', uint2hex(tw.signedTransaction.untrusted_raw_value));

      console.log('sendButton=====9', oasis.misc.toHex(oasis.misc.toCBOR(tw.signedTransaction)));



      try {
        await tw.submit(oasisClient);
      } catch (e) {
        console.error('submit failed', e);
        throw e;
      }

      let hash = await tw.hash()
      console.log('sendButton=====6', hash);

      sendResultDisplay.innerHTML = hash || ''
    } catch (error) {
      console.log('sendButton=====error', error);
      sendResultDisplay.innerHTML = error || ''
    }
  }


  /**
   * add escrow
   */


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