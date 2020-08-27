const express = require('express')
const router = express.Router()
const { addTicker, createPortfolio, listUserPortfolios } = require('../controllers/portfolio')
const { isAuth } = require('../util')

router
    .route('/:id')
    .put(isAuth,addTicker)

router
    .route('/userPortfolios')
    .get(isAuth,listUserPortfolios)

router
    .route('/create')
    .post(isAuth,createPortfolio)

module.exports = router