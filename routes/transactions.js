const router = require('express').Router()
const Transaction = require('../models/Transaction')
const Account = require('../models/Account')
const User = require('../models/User')
const Bank = require('../models/Bank')
const jose = require('node-jose')
const {verifyToken, refreshListOfBanksFromCentralBank} = require("../middlewares");
const fs = require("fs");
const base64url = require("base64url")
const axios = require("axios")

function creditAccount(accountFrom, amount) {
    accountFrom.balance -= amount
    accountFrom.save()
}

router.post('/', verifyToken, async function (req, res) {
    try {
        let statusDetail
        const accountFrom = await Account.findOne({number: req.body.accountFrom})

        if (!accountFrom || accountFrom.userId.toString() !== req.userId.toString()) {
            return res.status(404).send({error: 'User not found'})
        }
        if (req.body.amount >= accountFrom.balance) {
            return res.status(402).send({error: "Insufficient funds"})
        }

        if (!req.body.explanation) {
            return res.status(400).json({error: 'Invalid explanation'})
        }

        const bankToPrefix = req.body.accountTo.slice(0, 3)
        let bankTo = await Bank.findOne({bankPrefix: bankToPrefix})

        if (!bankTo) {
            const result = await refreshListOfBanksFromCentralBank()

            if (typeof result.error !== 'undefined') {
                statusDetail = result.error
            } else {
                bankTo = await Bank.findOne({bankPrefix: bankToPrefix})
                if (!bankTo) {
                    return res.status(400).json({error: 'Invalid accountTo'})
                }
            }
        } else {
            console.log('Bank was cached')
        }

        await Transaction.create({
            userId: req.userId,
            amount: req.body.amount,
            currency: accountFrom.currency,
            accountFrom: req.body.accountFrom,
            accountTo: req.body.accountTo,
            explanation: req.body.explanation,
            status: 'Pending',
            statusDetail: statusDetail,
            receiverName: req.body.receiverName,
            senderName: (await User.findOne({userId: req.userId})).name
        })

        creditAccount(accountFrom, req.body.amount)
        return res.status(201).end()

    } catch(e) {
        if (/.*Cast to Number failed for value .*amount/.test(e.message)
        || /Transactions validation failed: amount:.*/.test(e.message)) {
            return res.status(400).send({error: "Invalid amount"})
        }
        if (/Transactions validation failed: .*/.test(e.message)) {
            return res.status(400).send()
        }
        return res.status(500).end()
    }
})

router.get('/jwks', async function (req, res) {
    const keystore = jose.JWK.createKeyStore()
    await keystore.add(fs.readFileSync('./private.key').toString(), 'pem')
    return res.send(keystore.toJSON())
})

router.post('/b2b', async function (req, res) {
    try {
        const components = req.body.jwt.split('.')
        const payload = JSON.parse(base64url.decode(components[1]))
        const accountTo = await Account.findOne({number: payload.accountTo})
        const accountFromBankPrefix = payload.accountFrom.substring(0, 3)
        const accountFromBank = await Bank.findOne({bankPrefix: accountFromBankPrefix})

        if (!accountTo) {
            return res.status(404).send({error: 'Account not found'})
        }

        if (!accountFromBank) {
            const result = await refreshListOfBanksFromCentralBank();
            if (typeof result.error !== 'undefined') {
                return res.status(502).send({error: "There was an error communication with Central Bank" + result.error});
            }
            const accountFromBank = await Bank.findOne({bankPrefix: accountFromBankPrefix})

            if (!accountFromBank) {
                return res.status(404).send({error: 'Bank ' + accountFromBankPrefix + ' was not found in Central Bank'})
            }
        }

        if (accountTo.currency !== payload.currency) {
            const rate = await getRates(payload.currency, accountTo.currency)
            payload.amount = parseInt((parseInt(payload.amount) * parseFloat(rate)).toFixed(0))
        }

        const accountToUser = await User.findOne({_id: accountTo.userId})
        accountTo.balance += payload.amount
        accountTo.save();

        await Transaction.create({
            accountFrom: payload.accountFrom,
            accountTo: payload.accountTo,
            amount: payload.amount,
            currency: payload.currency,
            createdAt: payload.createdAt,
            explanation: payload.explanation,
            senderName: payload.senderName,
            receiverName: accountToUser.name,
            status: 'Completed',
            statusDetail: ''
        })
        res.send({receiverName: accountToUser.name})

    } catch (e) {
        return res.status(500).send({error: e.message})
    }
})

async function getRates(from, to) {
    const response = await axios.get('https://api.exchangerate.host/latest?base=' + from)
    for (const rate in response.data.rates) {
        if (rate === to) {
            return response.data.rates[rate]
        }
    }
}

module.exports = router