const mongoose = require('mongoose')

module.exports = mongoose.model('Transactions', mongoose.Schema({
    createdAt: {type: Date, required: true, default: Date.now},
    accountFrom: {type: String, required: true, minlength: 4},
    accountTo: {type: String, required: true, minlength: 4},
    amount: {type: Number, required: true, min: 0.01},
    explanation: {type: String, required: true, minlength: 3},
    currency: {type: String, required: true, default: 'USD', minlength: 2},
    senderName: {type: String},
    receiverName: {type: String},
    status: {type: String},
    statusDetail: {type: String}
}, {
    toJSON: {
        transform: (docIn, docOut) => {
            docOut.id = docOut._id
            delete docOut._id
            delete docOut.__v
        }
    }
}))