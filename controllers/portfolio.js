// const Ticker = require('../models/tickerModel')
const User = require('../models/userModel')

// @desc      Get all Tickers
// @route     GET /
// @ access   
exports.addToPortfolio = async (req,res) => {
    const id = req.params.id
    console.log(req.params,'test')
    // let all=await Ticker.find()
    // let tickers=[];
    // all.forEach(item => tickers.push([
    //     item._id,
    //     item.ticker,
    //     item.name
    // ]))
    // res.send({data:tickers})
}

// @desc      Create portfolio
// @route     POST /portfolio/create
// @ access  auth
exports.createPortfolio = async (req, res) => {
    console.log(req.body.name,req.user,'testsasds')
    let user = await User.findById(req.user._id)
    console.log(user)
    if(user){
        let newPortfolio = {
            name:req.body.name,
            tickers:[]
        }
        user.portfolios.push(newPortfolio)
        await user.save()
        res.status(201).send({message:'Portfolio created',data:newPortfolio})
    }else{
        return res.status(401).send({msg: 'User not found'})
    }
}