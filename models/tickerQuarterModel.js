const mongoose = require('mongoose')

const quarterDataSchema = new mongoose.Schema({
    date:{type:Date, required:true},
    dateName:{type:String},
    revenue:{type:Number},
    netIncome:{type:Number},
    operatingIncome:{type:Number},
    eps:{type:Number},
    currentAssets:{type:Number},
    currentLiabilities:{type:Number},
    operatingCashFlow:{type:Number},
    investingCashFlow:{type:Number},
    financingCashFlow:{type:Number},
    totalEquity:{type:Number},
    totalDebt:{type:Number},
    totalAssets:{type:Number}, 
    sharesOutstanding:{type:Number}, 
})

const tickerQuarterSchema = new mongoose.Schema({
    ticker:{type: String, required:true, unique:true},
    name:{type: String, required:true},
    quarterData:[quarterDataSchema],
})

const tickerQuarterModel = mongoose.model('TickerQuarter', tickerQuarterSchema)

module.exports = tickerQuarterModel