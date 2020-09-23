const express = require('express')
const router = express.Router()
const { getExhangeRates, updateExhangeRates } = require('../controllers/exhangeRates')

router
    .route('/')
    .get(getExhangeRates)

router
    .route('/update')
    .get(updateExhangeRates)

module.exports = router