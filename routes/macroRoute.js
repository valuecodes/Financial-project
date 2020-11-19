const express = require('express')
const router = express.Router()

const { isAuth, isAdmin } = require('../util')
const { 
    getMacroData,
    saveMacroData,
    deleteMacroData
} = require('../controllers/macro')

router
    .route('/')
    .get(getMacroData)
    .post(isAuth,isAdmin,saveMacroData)

router
    .route('/:id')
    .delete(isAuth,isAdmin,deleteMacroData)

module.exports = router