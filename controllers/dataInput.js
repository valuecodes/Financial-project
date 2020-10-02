const axios = require('axios')

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
        res.send({message:`${saved.profile.ticker} saved succesfully!`,data:saved})   
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

// @desc      Update ticker ratios from alphavantage api
// @route     GET /ratios:id
// @ access   Auth Admin
exports.updateTickerRatios = async ( req, res ) => {
    let ticker = req.params.id
    let data = await axios.get(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${process.env.ALPHA_KEY}`)
    if(data.data.Symbol){
        res.send({message:'Ticker updated', data:data.data})
    }else{
        return res.status(404).send({message: 'Ticker not found'})
    }
}

// @desc      Get price data from api
// @route     GET /ratios
// @ access   Auth Admin
exports.getPriceDataFromApi = async (req,res) => {
    const ticker = req.params.id
    console.log(ticker)
    if(!ticker){
        return res.status(404).send({message: 'Ticker not found'})
    }

    let data = null

    data = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=${ticker}&apikey=${process.env.ALPHA_KEY}`)
    
    if(data.data["Weekly Adjusted Time Series"]){
        return res.send({data:data.data})
    }

    data = await axios.get(`http://api.marketstack.com/v1/eod?access_key=${process.env.MARKET_STACK_API_KEY}&symbols=${ticker}`)

    if(data.data){
        return res.send({data:data.data})        
    }else{
        return res.status(404).send({message: 'Ticker not found'})   
    }
}

// @desc      Get Financial data from api
// @route     GET /financials/:id
// @ access   Auth Admin
exports.getFinancialsDataFromApi = async (req,res) => {

    const ticker = req.params.id
    if(!ticker){
        return res.status(404).send({message: 'Ticker not found'})
    }

    let incomeData = await axios.get(`https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${ticker}&apikey=${process.env.ALPHA_KEY}`)

    if(incomeData.data.annualReports){

        let balanceSheet = await axios.get(`https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=${ticker}&apikey=${process.env.ALPHA_KEY}`)

        let cashFlow = await axios.get(`https://www.alphavantage.co/query?function=CASH_FLOW&symbol=${ticker}&apikey=${process.env.ALPHA_KEY}`)

        let profile = await axios.get(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${process.env.ALPHA_KEY}`)
        
        return res.send({
            incomeStatement:incomeData.data,
            balanceSheet:balanceSheet.data,
            cashFlow:cashFlow.data,
            profile:profile.data
        })
    }

    return res.status(404).send({message: 'Ticker not found'})   

}

exports.updateTickerList = async ( req,res ) => {
    console.log('Updating ticker list...')
    let id = req.body._id
    const tickerSlim = await TickerSlim.findOne({tickerId:id})
    if(tickerSlim){
        tickerSlim.price = calculatePrice(req.body)
        tickerSlim.ratios = req.body.ratios
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
            ratios:req.body.ratios
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
}