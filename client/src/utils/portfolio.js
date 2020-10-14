import { roundFinancialNumber } from "./utils";

export default function Portfolio(portfolio={}){
    this.name = portfolio.name
    this.tickers = portfolio.tickers||[]
    this.userId = portfolio.userId
    this._id = portfolio._id
    this.transactions = portfolio.transactions ? 
    portfolio.tickers.map(item => 
        item.transactions.map(transaction =>{
            transaction.ticker = item.ticker
            transaction.total = transaction.count*transaction.price
            return{ ...transaction }
        })
    ).flat(1)
    :[]
    this.getTicker = (ticker) => handleGetTicker(this,ticker)
    this.getPurchasePrice = () => handleGetPurchasePrice(this)
}

function handleGetTicker(portfolio,ticker){
    return portfolio.tickers.find(item => item.ticker===ticker)
}

function handleGetPurchasePrice(portfolio){
    return roundFinancialNumber(portfolio.transactions.reduce((a,c) => a+c.total,0))
}