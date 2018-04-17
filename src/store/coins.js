import bitcoin from '../../node_modules/bitcoinjs-lib/src/index.js'

export class Coins {
  static getArray () {
    return [
      {
        ticker: 'BTCT',
        symbol: '฿',
        name: 'Bitcoin TESTNET',
        derivationPath: '1',
        network: bitcoin.networks.testnet
      },
      {
        ticker: 'LTCT',
        symbol: 'Ł',
        name: 'Litecoin TESTNET',
        derivationPath: '1',
        network: Coins.stubLTCTNetwork()
      },
      {
        ticker: 'BTC',
        name: 'Bitcoin',
        symbol: '฿',
        derivationPath: '0',
        network: bitcoin.networks.bitcoin
      },
      {
        ticker: 'LTC',
        symbol: 'Ł',
        name: 'Litecoin',
        derivationPath: '2',
        network: bitcoin.networks.litecoin
      }
    ]
  }

  // https://github.com/litecoin-project/litecore-lib/blob/segwit/lib/networks.js
  static stubLTCTNetwork () {
    return {
      messagePrefix: '\x19Litecoin Signed Message:\n',
      bip32: {
        public: 0x0436f6e1,
        private: 0x0436ef7d
      },
      pubKeyHash: 0x6f,
      scriptHash: 0x3a,
      wif: 0xef
    }
  }

  static getByTicker (ticker) {
    var a = this.getArray()
    for (var i = 0; i < a.length; i++) {
      if (a[i].ticker === ticker) {
        return a[i]
      }
    }
  }
}
