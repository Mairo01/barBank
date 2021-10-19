const mongoose = require('mongoose')

let validateUrl = url => {
    return /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm.test(url)
}

module.exports = mongoose.model('Bank', mongoose.Schema({
    name: {type: String, required: true},
    transactionUrl: {type: String, required: true, validate: validateUrl},
    bankPrefix: {type: String, required: true},
    owners: {type: String, required: true},
    jwksUrl: {type: String, required: true, validate: validateUrl}
}, {
    toJSON: {
        transform: (docIn, docOut) => {
            docOut.id = docOut._id
            delete docOut._id
            delete docOut.__v
        }
    }
}))