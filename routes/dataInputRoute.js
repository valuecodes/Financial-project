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


router.get('/updateList', async (req,res) =>{
    let tickers=await Ticker.find()
})


module.exports = router