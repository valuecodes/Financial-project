const mongoose = require('mongoose')

const tickerSchema = new mongoose.Schema({
    name:{type:String, required:true},
    quantity:{type:Number, required:true}
})

const portfolioSchema = new mongoose.Schema({
    name:{type:String, required:true},
    tickers:[tickerSchema]
})

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true},
    password:{type:String, required:true},
    isAdmin:{type:Boolean, required:true, default:false},
    portfolios:[portfolioSchema]
})

const userModel = mongoose.model('User',userSchema)

module.exports = userModel