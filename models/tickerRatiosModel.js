const mongoose = require('mongoose')

const monthlyPriceSchema = {
    date:{type:Date, required:true},
    close:{type:Number},
    _id : false  
}

const yearlyDataSchema = {
    date:{type:Date},
    revenue:{type:Number},
    netIncome:{type:Number},
    eps:{type:Number},
    currentAssets:{type:Number},
    currentLiabilities:{type:Number},
    bookValuePerShare:{type:Number},
    operatingCashFlow:{type:Number},
    investingCashFlow:{type:Number},
    financingCashFlow:{type:Number},
    operatingMargin:{type:Number},
    profitMargin:{type:Number},
    roe:{type:Number},
    roa:{type:Number},
    sharesOutstanding:{type:Number},
    price:{type:Number},
    dividends:{type:Number},
    _id : false 
}

const tickerRatiosSchema = new mongoose.Schema({
    ticker:{type:String,required:true, unique:true},
    monthlyPrice:[monthlyPriceSchema],
    yearlyData:[yearlyDataSchema]
})

const tickerRatiosModel = mongoose.model('TickerRatios',tickerRatiosSchema)

module.exports = tickerRatiosModel