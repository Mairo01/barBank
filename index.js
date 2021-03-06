const express = require('express');
const app = express()
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express')
const yamljs = require('yamljs')
const {processTransactions} = require('./middlewares')
const swaggerDocument = yamljs.load('docs/swagger.yaml')
require('dotenv').config()

// Serve API documentation on /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use(express.json())

app.use('/transactions', require('./routes/transactions'))
app.use('/sessions', require('./routes/sessions'))
app.use('/users', require('./routes/users'))

mongoose.connect(process.env.MONGODB_URI, {}, function() {
    console.log("Connected to mongo")
})

processTransactions()
app.listen(process.env.PORT, function() {
    console.log(`Port ${process.env.PORT}`)
})