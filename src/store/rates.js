import CurrencyFormatter from '../../node_modules/currency-formatter/'
import Persistent from '../store/persistent'

export default {

  build (message) {
    this.rates = message.rates
    this.ECB = message.ECB
    this.userCurrency = Persistent.getters.user.currency
    this.calcBTC()
    this.calcLTC()
    this.calcTrend()
    var obj = {
      'BTC': {
        'day': this.BTC24H,
        'spot': this.BTCSpot,
        'trend': {
          'hour': this.BTCHTrend,
          'day': this.BTCDTrend
        }
      },
      'LTC': {
        'day': this.LTC24H,
        'spot': this.LTCSpot,
        'trend': {
          'hour': this.LTCHTrend,
          'day': this.LTCDTrend
        }
      }
    }
    return obj
  },

  calcBTC: function () {
    for (var cc in this.ECB) {
      if (cc === this.userCurrency.code && this.userCurrency.code !== 'USD') {
        this.ECBcx = this.ECB[cc]
        for (let i = 0; i < this.rates.length; i++) {
          if (this.rates[i].base === 'BTC' && this.rates[i].quote === 'EUR') {
            this.calcBTC24H(this.rates[i].daily_history, this.userCurrency, this.ECBcx)
            this.BTCSpot = CurrencyFormatter.format(this.rates[i].last * this.ECBcx, this.userCurrency)
            break
          }
        }
      }
    }
    for (let i = 0; i < this.rates.length; i++) {
      if (this.rates[i].base === 'BTC' && this.rates[i].quote === this.userCurrency.code) {
        this.calcBTC24H(this.rates[i].daily_history, this.userCurrency)
        this.BTCSpot = CurrencyFormatter.format(this.rates[i].last, this.userCurrency)
        break
      }
    }
    if (this.rates[0].daily_history.length < 20) {
      this.BTC24H = 'N/A'
    }
    // this.calcTrend()
  },
  calcLTC: function () {
    for (var cc in this.ECB) {
      if (cc === this.userCurrency.code && this.userCurrency.code !== 'USD') {
        this.ECBcx = this.ECB[cc]
        for (let i = 0; i < this.rates.length; i++) {
          if (this.rates[i].base === 'LTC' && this.rates[i].quote === 'EUR') {
            this.calcLTC24H(this.rates[i].daily_history, this.userCurrency, this.ECBcx)
            this.LTCSpot = CurrencyFormatter.format(this.rates[i].last * this.ECBcx, this.userCurrency)
            break
          }
        }
      }
    }
    for (let i = 0; i < this.rates.length; i++) {
      if (this.rates[i].base === 'LTC' && this.rates[i].quote === this.userCurrency.code) {
        this.calcLTC24H(this.rates[i].daily_history, this.userCurrency)
        this.LTCSpot = CurrencyFormatter.format(this.rates[i].last, this.userCurrency)
      }
    }
    if (this.rates[0].daily_history.length < 20) {
      this.LTC24H = 'N/A'
    }
  },
  calcBTC24H: function (history, currency, cx = 1) {
    let sum = 0
    let h = JSON.parse(history.split(','))
    for (let i = 0; i < h.length; i++) {
      sum += h[i]
    }
    this.BTC24H = CurrencyFormatter.format(sum / h.length * cx, {code: this.userCurrency.code})
  },
  calcLTC24H: function (history, currency, cx = 1) {
    let sum = 0
    let h = JSON.parse(history.split(','))
    for (let i = 0; i < h.length; i++) {
      sum += h[i]
    }
    this.LTC24H = CurrencyFormatter.format(sum / h.length * cx, {code: this.userCurrency.code})
  },
  calcTrend: function () {
    let rates = this.rates
    for (let i = 0; i < rates.length; i++) {
      if (rates[i].base === 'BTC' && rates[i].quote === 'USD') {
        this.BTCDTrend = this.calcHistory(JSON.parse(rates[i].daily_history.split(',')))
        this.BTCHTrend = this.calcHistory(JSON.parse(rates[i].hour_history.split(',')))
      }
    }
    for (let i = 0; i < rates.length; i++) {
      if (rates[i].base === 'LTC' && rates[i].quote === 'USD') {
        this.LTCDTrend = this.calcHistory(JSON.parse(rates[i].daily_history.split(',')))
        this.LTCHTrend = this.calcHistory(JSON.parse(rates[i].hour_history.split(',')))
      }
    }
  },
  calcHistory: function (history) {
    // http://codes-sources.commentcamarche.net/source/39643-courbes-tendance-regression-lineaire
    let sumX = 0 // somme des X
    let sumY = 0 // somme des Y
    let sumX2 = 0 // somme des X²
    // let sumY2 = 0 // somme des y²
    let sumXY = 0 // somme des x*y
    for (let j = 0; j < history.length; j++) {
      sumX += j
      sumY += history[j]
      sumX2 += j * j
      sumXY += j * history[j]
    }
    let n = history.length
    let vMoyX = sumX / n // moyenne X
    let vMoyY = sumY / n // moyenne Y
    let vCovariance = sumXY / n - vMoyX * vMoyY
    let vVarianceX = sumX2 / n - vMoyX * vMoyX
    let trend = vCovariance / vVarianceX
    if (isNaN(trend)) {
      return null
    }
    return Math.round(trend * 100) / 100
  }
}
