const express = require('express')
const router = express.Router()
const Ticker = require('../models/tickerModel')

router.post('/',async (req, res) =>{

    console.log(req.body)
    console.log('')
    let newTicker= new Ticker({
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
        insiderTrading:req.body.insiderData
    })

    console.log(newTicker)

    await newTicker.save()
    res.send({message:'Hello from server'})
})

module.exports = router