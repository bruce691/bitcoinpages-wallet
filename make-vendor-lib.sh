#! /bin/sh
./node_modules/browserify/bin/cmd.js  -r bip39 -s bip39  > ./src/vendor/bip39.js
./node_modules/browserify/bin/cmd.js -r bitcoinjs-lib -s bitcoin  > ./src/vendor/bitcoinjs-lib.js
