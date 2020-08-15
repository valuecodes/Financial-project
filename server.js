const express = require('express')
const app = express()
const dotenv = require('dotenv').config()
const bodyParser = require('body-parser')
const connectDB = require('./config/db')

connectDB()

app.use(bodyParser.json())
const dataInputRoute=require('./routes/dataInputRoute')

app.use('/dataInput',dataInputRoute)

const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`Server started on ${PORT}`))



