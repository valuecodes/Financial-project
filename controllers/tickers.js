const Ticker = require('../models/tickerModel')
const Portfolio = require('../models/portfolioModel')

// @desc      Get all Tickers
// @route     GET /
// @ access   
exports.getTickers = async (req,res) => {
    let all=await Ticker.find()
    let tickers=[];
    all.forEach(item => tickers.push([
        item._id,
        item.ticker,
        item.name
    ]))
    res.send({data:tickers})
}

// @desc      Get Ticker data
// @route     GET /
// @ access   
exports.getTickerData = async (req, res) => {
    const tickerId = req.params.id
    const ticker = await Ticker.findOne({ticker:tickerId})
    if(ticker){
        return res.send({data:ticker})
    }else{
        return res.status(401).send({msg: 'Ticker not found'})
    }
}

// @desc      Get Portfolio Ticker data
// @route     GET /
// @ access   Auth
exports.getPortfolioTickerData = async (req, res) => {
    console.log(req.params)
    const portfolioId = req.params.id
    const portfolio = await Portfolio.findById(portfolioId)

    if(portfolio){
        
        let tickers = portfolio.tickers.map(ticker => ticker.ticker)
        let portfolioTickers = await Ticker.find({'ticker':{$in:tickers}})
        return res.send({data:portfolioTickers})
        
    }else{
        return res.status(401).send({msg: 'Portfolio not found'})
    }
}