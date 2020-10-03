const mongoose = require('mongoose')

const priceSchema = {
    date:{type:Date, required:true},
    close:{type:Number},
    _id : false  
}

const ratioSchema = {
    date:{type:Date},
    pe:{type:Number},
    pb:{type:Number},
    divYield:{type:Number},
    payoutRatio:{type:Number},
    marketCap:{type:Number},
    currentRatio:{type:Number},
    operatingMargin:{type:Number},
    profitMargin:{type:Number},
    profitGrowth5Years:{type:Number},
    revenueGrowth5Years:{type:Number},
    peg:{type:Number},
    roe:{type:Number},
    roa:{type:Number},
    _id : false 
}

const latestPriceSchema = {
    date:{type:Date, required:true},
    close:{type:Number},
    change:{type:Number},
    percentageChange:{type:Number},
    _id : false  
}

const tickerSlimSchema = new mongoose.Schema({
    tickerId:{type:mongoose.Schema.Types.ObjectId, ref: 'Ticker', required:true},
    ticker:{type:String,required:true, unique:true},
    name:{type:String,required:true},
    price:[priceSchema],
    latestPrice:latestPriceSchema,
    sector:{type:String},
    industry:{type:String},
    subIndustry:{type:String},
    country:{type: String},
    ratios:ratioSchema
},{
    timestamps:true
})

const tickerSlimModel = mongoose.model('TickerSlim',tickerSlimSchema)

module.exports = tickerSlimModel