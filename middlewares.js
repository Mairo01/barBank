const mongoose = require('mongoose')
const Session = require('./models/Session')

exports.verifyToken = async (req, res, next) => {
    let authorizationHeader = req.header('Authorization')

    if (!authorizationHeader) {
        console.log(authorizationHeader)
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