const router = require('express').Router()
const Transaction = require('../models/Transaction')
const Account = require('../models/Account')
const User = require('../models/User')
const Bank = require('../models/Bank')
const {verifyToken, refreshListOfBanksFromCentralBank} = require("../middlewares");

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

router.post('/b2b', async (req, res) => {
    return res.send({receiverName: "John Smith", error: "Issue communicating"})
})

module.exports = router