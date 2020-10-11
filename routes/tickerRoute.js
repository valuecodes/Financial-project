const express = require('express')
const router = express.Router()
const { 
    getTickers, 
    getTickersList, 
    getTickerData, 
    getPortfolioTickerData,
    getRatiosList 
} = require('../controllers/tickers')
const { isAuth } = require('../util')

router
    .route('/')
    .get(getTickersList)

router
    .route('/ratios')
    .get(getRatiosList)

router
    .route('/:id')
    .get(getTickerData)

router
    .route('/portfolio/:id')
    .get(isAuth, getPortfolioTickerData)

module.exports = router