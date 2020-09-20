const mongoose = require('mongoose')

const priceSchema = {
    date:{type:Date, required:true},
    close:{type:Number},
    _id : false  
}

const tickerSlimSchema = new mongoose.Schema({
    tickerId:{type:mongoose.Schema.Types.ObjectId, ref: 'Ticker', required:true},
    ticker:{type:String,required:true},
    name:{type:String,required:true},
    price:[priceSchema],
    sector:{type:String},
    industry:{type:String},
    subIndustry:{type:String},
    country:{type: String},
})

const tickerSlimModel = mongoose.model('TickerSlim',tickerSlimSchema)

module.exports = tickerSlimModel