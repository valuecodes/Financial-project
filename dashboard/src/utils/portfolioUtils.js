function calculatePortfolioTotal(portfolio){
    const tickers = portfolio.tickers
    const tickerTotals = portfolio.tickers.map(ticker => calculateTickerTotal(ticker))
    return tickerTotals.reduce((a,c) => a+c,0)
}

function calculateTickerTotal(ticker){
    return ticker.transactions.reduce((a,c)=> a+(c.count*c.price),0)
}

function calculateTickerShareCount(ticker){
    console.log(ticker)
    return  ticker.transactions.reduce((a,c) => a+c.count,0)
}

export {
    calculatePortfolioTotal,
    calculateTickerTotal,
    calculateTickerShareCount
}