const mongoose = require('mongoose')

const tickerSchema = new mongoose.Schema({
    ticker:{type:String, required:true},
    quantity:{type:Number, required:true, default:0}
})

const portfolioSchema = new mongoose.Schema({
    name:{type:String, required:true},
    userID:{type:String, required:true},
    tickers:[tickerSchema]
})

const portfolioModel = mongoose.model('Portfolio',portfolioSchema)

module.exports = portfolioModel