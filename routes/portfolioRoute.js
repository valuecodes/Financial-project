const express = require('express')
const router = express.Router()
const { 
    listUserPortfolios,
    createPortfolio,
    updatePortfolio,
    deletePortfolio, 
    addTicker, 
    deleteTicker,
    addTransaction,
    updateTransaction,
    deleteTransaction
} = require('../controllers/portfolio')
const { isAuth } = require('../util')

router
    .route('/')
    .post(isAuth,createPortfolio)

router
    .route('/userPortfolios')
    .get(isAuth,listUserPortfolios)

router
    .route('/:id')
    .post(isAuth,addTicker)
    .put(isAuth,updatePortfolio)
    .delete(isAuth,deletePortfolio)

router
    .route('/:id/&:ticker')
    .delete(isAuth, deleteTicker)
    .post(isAuth,addTransaction)

router
    .route('/:id/&:ticker/&:transaction')
    .delete(isAuth,deleteTransaction)
    .put(isAuth,updateTransaction)

module.exports = router