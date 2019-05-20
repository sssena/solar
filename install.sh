# npm dependencies
npm install

# fix bug
cp -rfp index.js node_modules/react-bootstrap-datetimerangepicker/lib/.

# npm install to dependencies
cd modules/crp-web3 && npm install
cd ../crp-dapp && npm install
npm audit fix

# compile dapp
cd build && node compile.js

# clear local db
rm -f /tmp/0x6f090f6cb125f77396d4b8f52fdabf7d5c1b53d4.json
