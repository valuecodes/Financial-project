export default function Portfolio(portfolio){
    this.name = portfolio.name
    this.tickers = portfolio.tickers
    this.userId = portfolio.userId
    this._id = portfolio._id 
    this.getTicker = (ticker) => handleGetTicker(this,ticker)
}

function handleGetTicker(portfolio,ticker){
    console.log(portfolio,ticker)
    return portfolio.tickers.find(item => item.ticker===ticker)
}