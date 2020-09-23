const ExhangeRate = require('../models/exhangeRates')
const axios = require('axios')

// @desc      Get Exhange rates
// @route     GET /
// @ access   auth
exports.getExhangeRates = async (req,res) => {
    const exhangeRate = await ExhangeRate.findOne()
    
    if(exhangeRate){
        const json = JSON.parse(JSON.stringify(exhangeRate));
        json.rates = JSON.parse(exhangeRate.rates)
        res.send({data:json})
    }else{
        res.status(401).send({msg: 'Exhange rate not found'})
    }
} 

// @desc      Get Exhange rates
// @route     GET /
// @ access   auth admin
exports.updateExhangeRates = async (req, res) => {

    const exhangeRate = await ExhangeRate.findOne()
    const rate = await axios.get(`http://data.fixer.io/api/latest?access_key=${process.env.FIXER_API_KEY}`)
    const { data } = rate
    
    if(exhangeRate){
        exhangeRate.rates=JSON.stringify(data.rates)
        await exhangeRate.save()
        console.log('Updated exhange rate')
        res.send({message:'Update successfulle'})  
    }else{
        let newRate = new ExhangeRate({
            base:data.base,
            timestamp:data.timestamp,
            date:data.date,
            rates:data.rates
        })
        await newRate.save()
        console.log('Creted new exhange rate')
        res.send({message:'Update successfulle'})        
    }

    
}