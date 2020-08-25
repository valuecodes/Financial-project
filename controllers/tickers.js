const Ticker = require('../models/tickerModel')

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