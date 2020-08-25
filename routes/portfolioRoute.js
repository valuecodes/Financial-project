const express = require('express')
const router = express.Router()
const { addToPortfolio } = require('../controllers/portfolio')

router
    .route('/:id')
    .post(addToPortfolio)

module.exports = router