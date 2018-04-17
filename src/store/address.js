export class Address {
  constructor (xPub, path, address, name) {
    this._xPub = xPub
    // m / purpose' / coin_type' / account' / change / address_index
    // m/44'/60'/0'/0
    this._path = path.split('/')
    this._address = address
    this._name = name
    this._free = true
    this._change = path.split('/')[3] === 1
  }

  get address () {
    return this._address
  }

  get name () {
    return this._name
  }

  set free (state) {
    this._free = state
  }

  get free () {
    return this._free
  }

  get path () {
    return this._path.join('/')
  }

  index () {
    return this._path[4]
  }
}
