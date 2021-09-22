const bcrypt = require('bcrypt')
const router = require('express').Router()
const User = require('../models/User')
const Account = require('../models/Account')

router.post('/', async function(req, res) {
    if (req.body.password === undefined || req.body.password.length < 9) {
        return res.status(400).send({error: "invalid password"})
    }

    req.body.password = await bcrypt.hash(req.body.password, 10)

    try {
        // Store user, account into DB
        const user = await new User(req.body).save()
        const account = await new Account({userId: user.id}).save()
    } catch (e) {
        if (/E11000.*username.* dup key.*/.test(e.message)) {
            return res.status(409).send({error: "Username already exists"})
        }
        if (/User validation failed: .*: Path `.*` is required/.test(e.message)) {
            return res.status(400).send({error: e.message})
        }
        return res.status(500).send({error: e.message})
    }
    return res.status(201).send('')
})

module.exports = router
