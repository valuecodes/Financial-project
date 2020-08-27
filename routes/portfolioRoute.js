const express = require('express')
const router = express.Router()
const { addToPortfolio, createPortfolio } = require('../controllers/portfolio')
const { isAuth } = require('../util')

// router
//     .route('/:id')
//     .post(addToPortfolio)

router
    .route('/create')
    .post(isAuth,createPortfolio)

module.exports = router