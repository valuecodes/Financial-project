const User = require('../models/userModel')
const { getToken, isAuth, isAdmin } = require('../util')

// @desc      User Signin
// @route     POST /
// @ access   
exports.userSignin = async (req,res) => {
    console.log(req.body.email)
    const signinUser = await User.findOne({
        email: req.body.email,
        password: req.body.password
    })
    if(signinUser){
        res.send({
            _id: signinUser.id,
            name: signinUser.name,
            email: signinUser.email,
            password: signinUser.password,
            isAdmin: signinUser.isAdmin,
            token: getToken(signinUser),
            portfolios:[]
        })
    }else{
        res.status(401).send({msg:'Invalid Email or password.'})
    }
}

// @desc      Register
// @route     POST /register
// @ access   Public
exports.userRegister = async (req, res)=>{
    try{
        const user= new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            isAdmin: false,
            portfolios:[]
        })
        const newUser = await user.save()
        if(newUser){
            res.send({
                _id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                isAdmin: newUser.isAdmin,
                token: getToken(newUser),
                portfolios:[]
            })
        }
        
    } catch(err){
        res.status(401).send({msg: 'Invalid user data'})
    }
}

exports.createAdmin = async (req, res) => {
    try{
        const user = new User({
            name:'Juha',
            email:'juhakangas5@gmail.com',
            password: 1234,
            isAdmin: true,
            portfolios:[]
        })
        const newUser = await user.save()
        console.log(newUser)
        res.send(newUser)
    } catch(err){
        res.send({msg:err.message})
    }
}