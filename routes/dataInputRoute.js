const express = require('express')
const router = express.Router()
const Ticker = require('../models/tickerModel')

router.post('/',async (req, res) =>{
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
})

router.get('/', async (req,res) => {
    let all=await Ticker.find()
    let tickers=[];
    all.forEach(item => tickers.push({
        id:item._id,
        ticker:item.profile.ticker,
        name:item.profile.name
    }))
    res.send({data:tickers})
})

router.get('/:id', async (req,res) => {
    const ticker = await Ticker.findById(req.params.id)
    res.send({data:ticker})
})

router.post('/saveTickers', async (req,res) =>{

    let tickers=[]
    
    for(var i=0;i<req.body.length;i++){
        tickers.push(
            new Ticker({
                ticker:req.body[i].ticker,
                name:req.body[i].name,
                description:req.body[i].description,
                sector:req.body[i].sector,
                industry:req.body[i].industry,
                subIndustry:req.body[i].subIndustry,
                stockExhange:req.body[i].stockExhange,
                country:req.body[i].country,
                currency:req.body[i].currency,
                founded:req.body[i].founded,
                address:req.body[i].address,
                phone:req.body[i].phone,
                website:req.body[i].website,
                employees:req.body[i].employees,
                incomeStatement:req.body[i].incomeStatement,
                balanceSheet:req.body[i].balanceSheet,
                cashFlow:req.body[i].cashFlow,
                priceData:req.body[i].priceData,
                dividendData: req.body[i].dividendData,
                insiderTrading:req.body[i].insiderTrading
            })
        )
    }
    console.log(await Ticker.collection.insertMany(tickers))
    // console.log(await tickers.save())
})

module.exports = router