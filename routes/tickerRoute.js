const express = require('express')
const router = express.Router()
const { getTickers } = require('../controllers/tickers')

router
    .route('/')
    .get(getTickers)

module.exports = router