const mongoose = require('mongoose')

const insiderTradingSchema = new mongoose.Schema({
    date:{type:Date},
    instrument:{type:String},
    name:{type:String},
    position:{type:String},
    price:{type:Number},
    type:{type:String},
    volume:{type:Number}
})

const tickerSchema = new mongoose.Schema({
    name:{type: String, required: true},
    description:{type: String, required: true},
    sector:{type: String, required: true},
    industry:{type: String, required: true},
    subIndustry:{type: String, required:true},
    founded:{type:String, required: true},
    address:{type: String, required: true},
    phone:{type: String, required: true},
    website:{type: String, required: true},
    employees:{type: String, required: true},
    insiderTrading:[insiderTradingSchema]
})

const tickerModel = mongoose.model('Ticker', tickerSchema)

module.exports = tickerModel