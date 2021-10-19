const mongoose = require('mongoose')
const fs = require("fs");
const jose = require('node-jose')
const fetch = require('node-fetch')
const Bank = require('./models/Bank')
const Account = require('./models/Account')
const Session = require('./models/Session')
const Transaction = require('./models/Transaction')

exports.verifyToken = async (req, res, next) => {
    let authorizationHeader = req.header('Authorization')

    if (!authorizationHeader) {
        return res.status(401).send({error: 'Missing authorization header'})
    }

    authorizationHeader = authorizationHeader.split(' ')

    if (!authorizationHeader[1]) {
        return res.status(400).send({error: 'Invalid Authorization header format'})
    }

    // Validate that the provided token conforms to MongoDB id format
    if (!mongoose.Types.ObjectId.isValid(authorizationHeader[1])) {
        return res.status(401).send({error: 'Invalid token'})
    }

    const session = await Session.findOne({_id: authorizationHeader[1]})

    if (!session) return res.status(401).send({error: 'Invalid token'})

    req.userId = session.userId
    req.sessionId = session.id

    return next()
}

exports.refreshListOfBanksFromCentralBank = async function refreshListOfBanksFromCentralBank() {
    try {
        let banks = await fetch(process.env.CENTRAL_BANK_URL, {
            headers: {'Api-key': process.env.CENTRAL_BANK_APIKEY}
        }).then(responseText => responseText.json())

        await Bank.deleteMany()

        const bulk = Bank.collection.initializeUnorderedBulkOp()

        banks.forEach(bank => {
            bulk.insert(bank)
        })

        await bulk.execute()

        return true

    } catch(e) {
        return {error: e.message}
    }
}

function isExpired(transaction) {
    const expireDate = new Date(transaction.createdAt.setDate(transaction.createdAt.getDate() + 3))
    return new Date > expireDate
}

function debitAccount(account, amount) {
    account.balance += amount
    account.save()
}

async function setStatus(transaction, status, statusDetail) {
    transaction.status = status
    transaction.statusDetail = statusDetail
    await transaction.save()
}

async function createSignedTransaction(input) {
    let privateKey
    try {
        privateKey = fs.readFileSync('private.key', 'utf8')
        const keystore = jose.JWK.createKeyStore()
        const key = await keystore.add(privateKey, 'pem')
        return await jose.JWS.createSign({format: 'compact'}, key).update(JSON.stringify(input), 'utf8').final()
    } catch(e) {
        throw Error('Error reading private key ' + e)
    }

}

async function sendRequestToBank(destinationBank, transactionAsJwt) {
    return await exports.sendPostRequest(destinationBank.transactionUrl, {jwt: transactionAsJwt})
}

exports.sendGetRequest = async(url) => {
    return await exports.sendRequest('get', url, null)
}

exports.sendPostRequest = async(url, data) => {
    return await exports.sendRequest('post', url, data)
}

exports.sendRequest = async (method, url, data) => {
    const options = {
        method,
        headers: {'Content-Type': 'application/json'}
    }
    if (data) {
        options.body = JSON.stringify(data)
    }
    try {
        const response = await fetch(url, options)
        const responseText = await response.text()

        return JSON.parse(responseText)
    } catch (e) {
        throw Error(JSON.stringify({
            exceptionMessage: e.message
        }))
    }
}
``
async function refund(transaction) {
    const accountFrom = await Account.findOne({number: transaction.accountFrom})
    accountFrom.balance += transaction.amount
    accountFrom.save()
}

exports.processTransactions = async function () {
    const pendingTransaction = await Transaction.find({status: 'Pending'})

    pendingTransaction.forEach(async transaction => {
        if (isExpired(transaction)) {
            await refund(transaction)
            return await setStatus(transaction, 'Failed', `Expired`)
        }
        await setStatus(transaction, 'In progress', '')

        const bankPrefix = transaction.accountTo.substring(0, 3)
        const localBankPrefix = process.env.BANK_PREFIX
        let destinationBank = await Bank.findOne({bankPrefix})

        if (!destinationBank) {
            const result = exports.refreshListOfBanksFromCentralBank()
            if (typeof result.error !== 'undefined') {
                return await setStatus(transaction, 'Pending', `Central bank failed: ${result.error}`)
            }
            destinationBank = await Bank.setTraceFunction(traceFunction).findOne({bankPrefix})

            if (!destinationBank) {
                await refund(transaction)
                return await setStatus(transaction, 'Failed', `Bank ${destinationBank} does not exist`)
            }
        }

        try {
            const response = await sendRequestToBank(destinationBank, await createSignedTransaction({
                accountFrom: transaction.accountFrom,
                accountTo: transaction.accountTo,
                amount: transaction.amount,
                currency: transaction.currency,
                explanation: transaction.explanation,
                senderName: transaction.senderName,
            }))

            if (typeof response.error !== 'undefined') throw Error(response.error)

            transaction.receiverName = response.receiverName

            if (destinationBank.bankPrefix === localBankPrefix) {
                const accountTo = await Account.findOne({"number": transaction.accountTo})
                if (!accountTo) throw new Error('AccountTo not found')
                debitAccount(accountTo, transaction.amount)
            }

            return await setStatus(transaction, 'Completed', '')

        } catch(e) {
            return await setStatus(transaction, 'Pending', e.message)
        }
    }, Error)
    setTimeout(exports.processTransactions, 1000)
}