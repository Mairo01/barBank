const bcrypt = require('bcrypt')
const router = require('express').Router()
const Session = require('../models/Session')
const User = require('../models/User')
const {verifyToken} = require('../middlewares')


router.post('/', async function(req, res) {
    try {
        const user = await User.findOne({"username": req.body.username})

        if (!user
            || typeof req.body.password === 'undefined'
            || !await bcrypt.compare(req.body.password, user.password) ) {
            return res.status(401).send('Invalid credentials')
        }

        const session = await new Session({"userId": user.id}).save()

        return res.status(201).send({token: session.id});

    } catch(e) {
        if (/E11000.*username.* dup key.*/.test(e.message)) {
            return res.status(400).send({error: "Username already exists"})
        }
        return res.status(500).send({error: e.message})
    }
})

router.delete('/', verifyToken, async function (req, res) {
    try {
        const session = await Session.findOne({_id: req.sessionId})
        await Session.deleteOne({_id: session._id})

        return res.status(204).end()

    } catch(e) {
        return res.status(500).send({error: e.message})
    }
})

module.exports = router
