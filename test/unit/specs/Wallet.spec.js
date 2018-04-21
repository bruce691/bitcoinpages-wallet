import { Wallet } from '../../../src/store/wallet'
import { Coins } from '../../../src/store/coins.js'
import { StorageDecoder } from '../../../src/store/storageDecoder'
import bitcoin from '../../../src/vendor/bitcoinjs-lib'

describe('storage/wallet', () => {

  let xpub = 'xpub6Cd4Wz2ewNDeT6kCWgFTCYp5ZDDHJ7xqBV9RSHwg8L6rB4VVu49LERSyohcRHsJhVS5hN5cNM6ox6FzvUYqUNfEGwDVpSSAyRoESe4QtvJh'
  let ypub = 'ypub6C1ahY33CWyaKzdZd3MQrGqR6GBpiqjExzJSBmdxwAP2ZeLi7XYXvoY48hRrGgYwsSZ1WKUqxLRqqkK9bR6sDvWpJSbq13wHHTmNTX89d5B'
  let xpriv = 'xprv9s21ZrQH143K4DRBUU8Dp25M61mtjm9T3LsdLLFCXL2U6AiKEqs7dtCJWGFcDJ9DtHpdwwmoqLgzPrW7unpwUyL49FZvut9xUzpNB6wbEnz'

  function setupImportWallet(ticker) {
    let wallet = new Wallet(Coins.getByTicker(ticker), 'plop')
    let mnemonic = 'praise you muffin lion enable neck grocery crumble super myself license ghost'
    wallet.import (mnemonic)
    return wallet
  }

  it('wallet.getPath works for all coins', () => {
    var wallet = setupImportWallet('BTC')
    let path = wallet.getPath ('44', 0, 0, 0) 
    expect(path).toEqual("m/44'/0'/0'/0/0")
    var wallet = setupImportWallet('LTC')
    path = wallet.getPath ('44', 0, 0, 0) 
    expect(path).toEqual("m/44'/2'/0'/0/0")    
  })

  it('import store a valid xPriv & xPub & wallet_id', () => {
    var wallet = setupImportWallet('BTC')
    expect(wallet._xPub).toEqual(xpub)
    expect(wallet._xPriv).toEqual(xpriv)
    expect(wallet._yPub).toEqual(ypub)
  })

  it('import correctly derive first legacy BTC  address', () => {
    var wallet = setupImportWallet('BTC')
    var root44 = wallet.getChildAddress('44', 0, 0, 0)
    expect(root44.keyPair.getAddress().toString()).toEqual("1PLDRLacEkAaaiWnfojVDb5hWpwXvKJrRa")
    expect( root44.keyPair.toWIF()).toEqual("KwksS3oTchQvPQqm1AV1T2H8bjJpWYKejSn3rRSSX3j7NBhxYbH5") 
  })

  it('import correctly derive first segwit address', () => {
    var wallet = setupImportWallet('BTC')
    var root49 = wallet.getChildAddress('49', 0, 0, 0)
    expect(wallet.getBip49Address(root49)).toEqual("3GU5e9mPrLgPemhawVHHrDt6bjZZ6M9CPc")
    expect( root49.keyPair.toWIF()).toEqual("L2c4fjxz2a58a42FPqYRdYLNAjTPWFGh2x2WWmMusj7BNc9vsjt3") 
  })

  it('can sign a createWallet Message', () => {
    var wallet = setupImportWallet('BTC')
    var body  = wallet.signCreateMessage("123456")
    let message  = JSON.parse(atob(body.message));
    expect(message['ticker']).toEqual('BTC')
    expect(message['pinCode']).toEqual('123456')
    expect(message['name']).toEqual('plop')
    expect(message['xPub']).toEqual(wallet._xPub)
  })
  
})
