const express = require('express')
const router = express.Router()
const Ticker = require('../models/tickerModel')

router.post('/',async (req, res) =>{
    const ticker = await Ticker.findOne({ticker:req.body.ticker})
    console.log(ticker.insiderTrading)
    if(ticker){
        ticker.ticker=req.body.ticker,
        ticker.name=req.body.name,
        ticker.description=req.body.description,
        ticker.sector=req.body.sector,
        ticker.industry=req.body.industry,
        ticker.subIndustry=req.body.subIndustry,
        ticker.founded=req.body.founded,
        ticker.address=req.body.address,
        ticker.phone=req.body.phone,
        ticker.website=req.body.website,
        ticker.employees=req.body.employees,
        ticker.incomeStatement=req.body.incomeStatement,
        ticker.balanceSheet=req.body.balanceSheet,
        ticker.cashFlow=req.body.cashFlow,
        ticker.priceData=req.body.priceData,
        ticker.dividendData=req.body.dividendData,
        ticker.insiderTrading=req.body.insiderTrading
        console.log('ticker saved',ticker)
        await ticker.save()
        res.send({message:'Ticker saved'})   
    }else{
        let newTicker = new Ticker({
            ticker:req.body.ticker,
            name:req.body.name,
            description:req.body.description,
            sector:req.body.sector,
            industry:req.body.industry,
            subIndustry:req.body.subIndustry,
            founded:req.body.founded,
            address:req.body.address,
            phone:req.body.phone,
            website:req.body.website,
            employees:req.body.employees,
            incomeStatement:req.body.incomeStatement,
            balanceSheet:req.body.balanceSheet,
            cashFlow:req.body.cashFlow,
            priceData:req.body.priceData,
            dividendData: req.body.dividendData,
            insiderTrading:req.body.insiderTrading
        })

        console.log('ticker created')

        await newTicker.save()
        res.send({message:'Ticker created'})        
    }

})

router.get('/', async (req,res) => {
    console.log('test')
    let all=await Ticker.find()
    let tickers=[];
    all.forEach(item => tickers.push({
        id:item._id,
        ticker:item.ticker,
        name:item.name
    }))
    console.log(tickers)
    res.send({data:tickers})
})

router.get('/:id', async (req,res) => {
    const ticker = await Ticker.findById(req.params.id)
    res.send({data:ticker})
})

router.post('/saveTickers', async (req,res) =>{
    // console.log(req.body)
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