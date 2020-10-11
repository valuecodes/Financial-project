const Ticker = require('../models/tickerModel')
const TickerSlim = require('../models/tickerSlimModel')
const Portfolio = require('../models/portfolioModel')
const TickerQuarter = require('../models/tickerQuarterModel')
const TickerRatios = require('../models/tickerRatiosModel')

// @desc      Get all Tickers
// @route     GET /
// @ access   
exports.getTickers = async (req,res) => {
    let all=await Ticker.find()
    let tickers=[];
    all.forEach(item => tickers.push([
        item.profile._id,
        item.profile.ticker,
        item.profile.name,
        item.priceData[0]?item.priceData[0].close:0,
        item.priceData[1]?item.priceData[1].close:0
    ]))
    res.send({data:tickers})
}

// @desc      Get all Tickers
// @route     GET /
// @ access   
exports.getTickersList = async (req,res) => {
    let list = await TickerSlim.find()
    res.send({data:list})
}

// @desc      Get Ticker data
// @route     GET /
// @ access   
exports.getTickerData = async (req, res) => {
    const tickerId = req.params.id
    const ticker = await Ticker.findOne({'profile.ticker':tickerId})
    if(ticker){
        const tickerQuarter = await TickerQuarter.findOne({ticker:ticker.profile.ticker})
        const tickerRatios = await TickerRatios.findOne({ticker:ticker.profile.ticker})
        return res.send({data: ticker, tickerQuarter, tickerRatios})
    }else{
        return res.status(401).send({msg: 'Ticker not found'})
    }
}

// @desc      Get Portfolio Ticker data
// @route     GET /
// @ access   Auth
exports.getPortfolioTickerData = async (req, res) => {
    
    const portfolioId = req.params.id
    const portfolio = await Portfolio.findById(portfolioId)

    if(portfolio){
        
        let tickers = portfolio.tickers.map(ticker => ticker.ticker)
        let portfolioTickers = await Ticker.find({'profile.ticker':{$in:tickers}})
         
        return res.send({tickerData:portfolioTickers,portfolio})
        
    }else{
        return res.status(401).send({msg: 'Portfolio not found'})
    }
}