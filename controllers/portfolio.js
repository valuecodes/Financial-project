const Portfolio = require('../models/portfolioModel')
const User = require('../models/userModel')

// @desc      Get all Tickers
// @route     POST /:id
// @ access   
exports.addTicker = async (req,res) => {

    const portfolio = await Portfolio.findById(req.params.id)
    let newTicker = {
        ticker: req.body.ticker[1],
        name: req.body.ticker[2],
        quatity:0
    }
    portfolio.tickers.push(newTicker)
    await portfolio.save()
    return res.status(204).send({msg:'Ticker added succesfully'})
    
}

// @desc      Create portfolio
// @route     POST /create
// @ access  auth
exports.createPortfolio = async (req, res) => {
    
    const portfolio = new Portfolio({
        name:req.body.name,
        userId:req.user._id,
        tickers:[]
    })
    
    const newPortfolio = await portfolio.save()
    res.status(201).send({message:'Portfolio created',data:newPortfolio})

}

// @desc      Update portfolio
// @route     PUT /:id
// @ access   auth
exports.updatePortfolio = async (req, res) => {
    
    const portfolioId = req.params.id
    const portfolio = await Portfolio.findById(portfolioId)

    if(portfolio){
        portfolio.name = req.body.portfolio
        await portfolio.save()
        return res.send({message: 'Portfolio saved'})
    }else{
        return res.status(401).send({msg: 'Portfolio not found'})
    }
}

// @desc      Delete ticker
// @route     DELETE /:id/&:ticker
// @ access   auth
exports.deleteTicker = async (req, res) => {
    const portfolioId = req.params.id
    const portfolio = await Portfolio.findById(portfolioId)

    if(portfolio){
        const tickerId = req.params.ticker
        let tickerIndex = portfolio.tickers.findIndex(item => item._id==tickerId)
        portfolio.tickers.splice(tickerIndex,1)   
        await portfolio.save()
        return res.send({message: 'Ticker deleted'})
    }else{
        return res.status(401).send({msg: 'Portfolio not found'})
    }
}



// @desc      Delete portfolio
// @route     DELETE /:id
// @ access  auth
exports.deletePortfolio = async (req, res) => {

    const portfolioId = req.params.id
    const portfolio = Portfolio.findById(portfolioId)

    if(portfolio){
        await portfolio.remove()
        return res.send({message: 'Portfolio deleted'})
    }else{
        return res.status(401).send({msg: 'Portfolio not found'})
    }
}

// @desc      Add transaction to portfolio
// @route     POST /:id/addTransaction
// @ access  auth
exports.addTransaction = async (req, res) => {

    const portfolioId = req.params.id
    const portfolio = await Portfolio.findById(portfolioId)

    if(portfolio){
        const tickerId = req.params.ticker
        let index= portfolio.tickers.findIndex(item => item._id==tickerId)
        let factor = req.body.transaction.type==='buy'?1:-1
        const newTransaction = {
            count: req.body.transaction.count*factor,
            price: req.body.transaction.price,
            date: req.body.transaction.date,
            type: req.body.transaction.type
        }    
        portfolio.tickers[index].transactions.push(newTransaction)
        portfolio.tickers[index].transactions.sort((a,b)=>b.date-a.date)
        await portfolio.save()
        return res.send({message: 'Transaction added'})
    }else{
        return res.status(401).send({msg: 'Portfolio not found'})
    }
}

// @desc      Delete transaction
// @route     DELETE /:id/&:ticker/&:transaction
// @ access   auth
exports.deleteTransaction = async (req, res) => {
    
    const portfolioId = req.params.id
    const portfolio = await Portfolio.findById(portfolioId)
    
    if(portfolio){

        const tickerId = req.params.ticker
        let tickerIndex = portfolio.tickers.findIndex(item => item._id==tickerId)

        const transactionId = req.params.transaction
        let transactionIndex = portfolio.tickers[tickerIndex].transactions.findIndex(item => item._id == transactionId)
        portfolio.tickers[tickerIndex].transactions.splice(transactionIndex,1)

        await portfolio.save()
        return res.send({message: 'Transaction deleted'})
    }else{
        return res.status(401).send({msg: 'Portfolio not found'})
    }
}

// @desc      Update transaction
// @route     PUT /:id/&:ticker/&:transaction
// @ access   auth
exports.updateTransaction = async (req, res) => {
    const portfolioId = req.params.id
    const portfolio = await Portfolio.findById(portfolioId)
    if(portfolio){
        const tickerId = req.params.ticker
        let tickerIndex = portfolio.tickers.findIndex(item => item._id==tickerId)
        const transactionId = req.params.transaction
        let transactionIndex = portfolio.tickers[tickerIndex].transactions.findIndex(item => item._id == transactionId)
        portfolio.tickers[tickerIndex].transactions[transactionIndex]=req.body.transaction
        await portfolio.save()
        return res.send({message: 'Transaction saved'})
    }else{
        return res.status(401).send({msg: 'Portfolio not found'})
    }
}


exports.listUserPortfolios = async (req, res) => {

    const userId = req.user._id
    const userPortfolios = await Portfolio.find({userId: userId})

    if(userPortfolios){
        res.status(201).send({data: userPortfolios})
    }else{
        return res.status(401).send({msg: 'Portfolios not found'})
    }
}