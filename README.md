# barBank


## Install
```sh
npm install && cd ./client && npm install & cd ..
```

## Requirements
MongoDB

Files required in main directory to run server: .env and private.key

Content of private.key from https://cryptotools.net/rsagen

## Starting
To run server and front-end:
```sh
npm run dev
```
To run only front-end:
```sh
npm run client
```
To run only server:
```sh
npm run server
```

## To make a transaction without connecting to the central bank:
Install nock (HTTP server mocking and expectations library for Node.js):

```sh
npm install nock
```

Into refreshListOfBanksFromCentralBank function, line 41:
```js
nock(process.env.CENTRAL_BANK_URL)
    .get('/')
    .reply(200,
        [
            {
                "name": "otherBank",
                "transactionUrl": "https://otherBank.com/transactions/b2b",
                "bankPrefix": "typ",
                "owners": "otherBank",
                "jwksUrl": "https://otherBank.com/transactions/jwks"
            },
            {
                "name": "barBank",
                "transactionUrl": "https://barBank.com/transactions/b2b",
                "bankPrefix": "thr",
                "owners": "barBank",
                "jwksUrl": "https://barBank.com/transactions/jwks"
            }
        ]
    )

```

Into sendRequest function, line 119:
```js
nock(url)
    .post('')
    .reply(200, {"receiverName": "Jack"})
```
