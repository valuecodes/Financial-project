const express = require('express')
const router = express.Router()
const { getTickers, getTickerData, getPortfolioTickerData } = require('../controllers/tickers')
const { isAuth } = require('../util')

router
    .route('/')
    .get(getTickers)

router
    .route('/:id')
    .get(getTickerData)

router
    .route('/portfolio/:id')
    .get(isAuth, getPortfolioTickerData)

module.exports = router