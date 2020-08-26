const express = require('express')
const router = express.Router()
const { userSignin, createAdmin, userRegister } = require('../controllers/user')

router  
    .route('/signin')
    .post(userSignin)

router
    .route('/register')
    .post(userRegister)

router  
    .route('/createadmin')
    .get(createAdmin)

module.exports = router