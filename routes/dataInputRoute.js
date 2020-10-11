const express = require('express')
const router = express.Router()
const Ticker = require('../models/tickerModel')
const { isAuth, isAdmin } = require('../util')
const { 
    getTicker, 
    updateTicker, 
    updateTickerQuarter,
    updateTickerRatios,
    updateTickerList, 
    getTickerList,
    deleteTicker,
    updateTickerApiRatios,
    getPriceDataFromApi,
    getFinancialsDataFromApi
} = require('../controllers/dataInput')

router
    .route('/')
    .get(isAuth, isAdmin, getTickerList)
    .post(isAuth, isAdmin ,updateTicker, updateTickerQuarter,updateTickerRatios ,updateTickerList)

router
    .route('/:id')
    .get(isAuth, isAdmin,getTicker)
    .delete(isAuth,isAdmin,deleteTicker)

router  
    .route('/ratios/:id')
    .get(isAuth,isAdmin,updateTickerApiRatios)

router  
    .route('/price/:id')
    .get(isAuth,isAdmin,getPriceDataFromApi)

router  
    .route('/financials/:id')
    .get(isAuth,isAdmin,getFinancialsDataFromApi)

module.exports = router