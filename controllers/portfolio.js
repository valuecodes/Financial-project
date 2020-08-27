// const Ticker = require('../models/tickerModel')
const Portfolio = require('../models/portfolioModel')
const User = require('../models/userModel')

// @desc      Get all Tickers
// @route     GET /
// @ access   
exports.addTicker = async (req,res) => {
    const user = await User.findById(req.user._id)

    if(user){

        const portfolio = await Portfolio.findById(req.params.id)
        let newTicker = {
            ticker:req.body.ticker,
            quatity:0
        }
        portfolio.tickers.push(newTicker)
        await portfolio.save()
        return res.status(204).send({msg:'Ticker added succesfully'})

    }else{
        return res.status(401).send({msg: 'User not found'})
    }
    
}

// @desc      Create portfolio
// @route     POST /portfolio/create
// @ access  auth
exports.createPortfolio = async (req, res) => {

    const user = await User.findById(req.user._id)

    if(user){
        
        const portfolio = new Portfolio({
            name:req.body.name,
            userID:user._id,
            tickers:[]
        })

        const newPortfolio = await portfolio.save()
        res.status(201).send({message:'Portfolio created',data:newPortfolio})

    }else{
        return res.status(401).send({msg: 'User not found'})
    }
}

exports.listUserPortfolios = async (req, res) => {
    const userPortfolios = await Portfolio.find({userID:req.user._id})
    if(userPortfolios){
        res.status(201).send({data: userPortfolios})
    }else{
        return res.status(401).send({msg: 'Portfolios not found'})
    }
}