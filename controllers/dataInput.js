const Ticker = require('../models/tickerModel')
const TickerSlim = require('../models/tickerSlimModel')

// @desc      Get ticker by id
// @route     GET /:id
// @ access   Auth Admin
exports.updateTicker = async ( req, res ) => {
    const ticker = await Ticker.findById(req.body._id)
    if(ticker){
        ticker.profile=req.body.profile,
        ticker.incomeStatement=req.body.incomeStatement,
        ticker.balanceSheet=req.body.balanceSheet,
        ticker.cashFlow=req.body.cashFlow,
        ticker.priceData=req.body.priceData,
        ticker.dividendData=req.body.dividendData,
        ticker.insiderTrading=req.body.insiderTrading
        let saved = await ticker.save()
        console.log('ticker saved')
        res.send({message:'Ticker saved',data:saved})   
    }else{
        let newTicker = new Ticker({
            profile:req.body.profile,
            incomeStatement:req.body.incomeStatement,
            balanceSheet:req.body.balanceSheet,
            cashFlow:req.body.cashFlow,
            priceData:req.body.priceData,
            dividendData: req.body.dividendData,
            insiderTrading:req.body.insiderTrading
        })
        console.log('ticker created')
        let saved = await newTicker.save()
        res.send({message:'Ticker created',data:saved})  
    }
}

exports.updateTickerList = async ( req,res,next ) => {
    console.log('Updating ticker list...')

    return next()
}

// @desc      Get ticker by id
// @route     GET /:id
// @ access   Auth Admin
exports.getTicker = async ( req, res ) => {
    const ticker = await Ticker.findById(req.params.id)
    res.send({data:ticker})
}

// @desc      Get ticker list
// @route     GET /
// @ access   Auth Admin
exports.getTickerList = async ( req, res ) => {
    let all=await Ticker.find()
    let tickers=[];
    all.forEach(item => tickers.push({
        id:item._id,
        ticker:item.profile.ticker,
        name:item.profile.name
    }))
    res.send({data:tickers})
}