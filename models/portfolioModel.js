const mongoose = require('mongoose')

const transactionScheme = new mongoose.Schema({
    count:{type:Number,required: true},
    price:{type:Number, required: true},
    date:{type:Date, required: true},
    type:{type:String,required: true}
})

const tickerSchema = new mongoose.Schema({
    ticker:{type:String, required:true},
    name:{type:String, required:true},
    transactions:[transactionScheme]
})

const portfolioSchema = new mongoose.Schema({
    name:{type:String, required:true},
    userId:{type:mongoose.Schema.Types.ObjectId, ref: 'User', required:true},
    tickers:[tickerSchema]
})

const portfolioModel = mongoose.model('Portfolio',portfolioSchema)

module.exports = portfolioModel