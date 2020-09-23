const mongoose = require('mongoose')

const exhangeRateSchema = new mongoose.Schema({
    base:{type:String,required:true},
    timestamp:{type:Number,required:true},
    date:{type:String,required:true},
    rates:{type:String}
})

const exhangeRateModel = mongoose.model('ExhangeRate',exhangeRateSchema)

module.exports = exhangeRateModel