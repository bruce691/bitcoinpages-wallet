export class User {
  constructor (name, currency) {
    this._name = name
    this._currency = currency
  }

  get currency () {
    return this._currency
  }

  get name () {
    return this._name
  }
}
