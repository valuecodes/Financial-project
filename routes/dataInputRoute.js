const express = require('express')
const router = express.Router()
const Ticker = require('../models/tickerModel')
const { isAuth, isAdmin } = require('../util')
const { getTicker, updateTicker, updateTickerList, getTickerList } = require('../controllers/dataInput')

router
    .route('/')
    .get(isAuth, isAdmin, getTickerList)
    .post(isAuth, isAdmin ,updateTickerList,updateTicker)

router
    .route('/:id')
    .get(isAuth, isAdmin,getTicker)

module.exports = router