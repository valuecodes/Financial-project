const mongoose = require('mongoose')

const userSchema = new monggose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true},
    password:{type:String, required:true},
    isAdmin:{type:Boolean, required:true, default:false}
})

const userModel = mongoose.model('User',userSchema)

module.exports = userModel