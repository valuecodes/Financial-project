const express = require('express')
const router = express.Router()
const Ticker = require('../models/tickerModel')
const { isAuth, isAdmin } = require('../util')
const { getTicker, updateTicker, updateTickerList, getTickerList,deleteTicker } = require('../controllers/dataInput')

router
    .route('/')
    .get(isAuth, isAdmin, getTickerList)
    .post(isAuth, isAdmin ,updateTicker,updateTickerList)

router
    .route('/:id')
    .get(isAuth, isAdmin,getTicker)
    .delete(isAuth,isAdmin,deleteTicker)

module.exports = router