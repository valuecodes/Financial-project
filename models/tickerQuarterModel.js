const mongoose = require('mongoose')

const quarterDataSchema = new mongoose.Schema({
    date:{type:Date, required:true},
    price:{type:Number},
    revenue:{type:Number},
    netIncome:{type:Number},
    eps:{type:Number},
    currentAssets:{type:Number},
    currentLiabilities:{type:Number},
    bookValuePerShare:{type:Number},
    operatingChashflow:{type:Number},
    investingCashFlow:{type:Number},
    financingCashflow:{type:Number},
    divYield:{type:Number},
    operatingMargin:{type:Number},
    profitMargin:{type:Number},
    roe:{type:Number},
    roa:{type:Number},
    payoutRatio:{type:Number},
    sharesOutstanding:{type:Number},
})

const tickerQuarterSchema = new mongoose.Schema({
    ticker:{type: String, required:true, unique:true},
    name:{type: String, required:true},
    quarterData:[quarterDataSchema],
})

const tickerQuarterModel = mongoose.model('TickerQuarter', tickerQuarterSchema)

module.exports = tickerQuarterModel