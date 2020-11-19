const express = require('express')
const app = express()
const dotenv = require('dotenv').config()
const bodyParser = require('body-parser')
const connectDB = require('./config/db')

connectDB()
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

const dataInputRoute=require('./routes/dataInputRoute')
const tickerRoute = require('./routes/tickerRoute')
const portfolioRoute = require('./routes/portfolioRoute')
const userRoute = require('./routes/userRoute')
const exhangeRatesRoute = require('./routes/exhangeRatesRoute')
const macroRoute = require('./routes/macroRoute')

app.use('/dataInput',dataInputRoute)
app.use('/api/tickers',tickerRoute)
app.use('/api/portfolio',portfolioRoute)
app.use('/api/users', userRoute)
app.use('/api/exhangeRates',exhangeRatesRoute)
app.use('/api/macro',macroRoute)

const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`Server started on ${PORT}`))



