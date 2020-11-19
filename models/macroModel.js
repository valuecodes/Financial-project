const mongoose = require('mongoose')

const macroDataSchema = new mongoose.Schema({
    date:{type:Date, required:true},
    value:{type:Number},
    _id : false 
})

const macroSchema = new mongoose.Schema({
    name:{type:String,required:true},
    frequence:{type:String,required:true},
    data:[]
})

const macroModel = mongoose.model('Macro',macroSchema)

module.exports = macroModel