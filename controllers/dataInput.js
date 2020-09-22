const Ticker = require('../models/tickerModel')
const TickerSlim = require('../models/tickerSlimModel')

// @desc      Get ticker by id
// @route     GET /:id
// @ access   Auth Admin
exports.updateTicker = async ( req, res, next ) => {
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
        next()
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
        req.body._id=saved._id
        next()
        res.send({message:'Ticker created',data:saved})  
    }
}

exports.updateTickerList = async ( req,res ) => {
    console.log('Updating ticker list...')
    let id = req.body._id
    const tickerSlim = await TickerSlim.findOne({tickerId:id})
    if(tickerSlim){
        tickerSlim.price = calculatePrice(req.body) 
        await tickerSlim.save()
    }else{
        let newTicker = new TickerSlim({
            tickerId:id,
            ticker:req.body.profile.ticker,
            name:req.body.profile.name,
            price:calculatePrice(req.body),
            sector:req.body.profile.sector,
            industry:req.body.profile.industry,
            subIndustry:req.body.profile.subIndustry,
            country:req.body.profile.country,
        })
        await newTicker.save()
    }
}

function calculatePrice(data){
    return [
        {date:data.priceData[0].date,close:data.priceData[0].close},
        {date:data.priceData[1].date,close:data.priceData[1].close},
    ]
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

// @desc      Delete Ticker
// @route     DELETE /:id
// @ access   Auth Admin
exports.deleteTicker = async ( req,res ) => {
    const tickerId = req.params.id
    const ticker = await Ticker.findById(tickerId)
    if(ticker){
        await ticker.remove()
        console.log('Ticker removed succesfully')
        const tickerSlim = await TickerSlim.findOne({tickerId:tickerId})
        if(tickerSlim){
            await tickerSlim.remove()
            console.log('TickerSlim removed succesfully')
        } 
        return res.send({message:'Ticker deleted'})
    }else{
        return res.status(404).send({message: 'Ticker not found'})
    }
    console.log(ticker)
}