function calculatePortfolioTotal(portfolio){
    const tickers = portfolio.tickers
    const tickerTotals = portfolio.tickers.map(ticker => calculateTickerTotal(ticker))
    return tickerTotals.reduce((a,c) => a+c,0)
}

function calculateTickerTotal(ticker){
    return ticker.transactions.reduce((a,c)=> a+(c.count*c.price),0)
}

function calculateTickerShareCount(ticker){
    return  ticker.transactions.reduce((a,c) => a+c.count,0)
}

function calculateDividendTransactions(portfolio,tickerData){
    let dividendTransactions = portfolio.tickers.map(ticker => getDividendActions(ticker,tickerData))
    return dividendTransactions.flat(2).sort((a,b) => new Date(b.date)- new Date(a.date) )
}

function getDividendActions(ticker, tickerData){

    let transactions = ticker.transactions
    let dividendData = tickerData.filter(item => item.ticker === ticker.ticker)[0].dividendData

    let dividends = transactions.map(item => {
        let divs=dividendData.filter(div => new Date(div.date)>new Date(item.date))
        if(divs.length>0){
            // console.log(divs,item,ticker.ticker)
            let res= divs.map(div=>{
                return {
                    ticker:ticker.ticker,
                    date:div.date,
                    dividend:div.dividend,
                    shareCount:item.count,
                    payment:div.dividend*item.count
                }
            })
            return res
        }
    }).filter(Boolean)
    return dividends
}

function transactionsToMonths(transactions){
    let currentMonth=new Date().getMonth();
    let start = new Date(transactions[transactions.length-1].date).getFullYear()
    let end = new Date(transactions[0].date).getFullYear()
    let labels=[]
    let values=[]
    let months=[]
    for(var i=start;i<=end;i++){
        for(var a=1;a<=12;a++){
            if(i===end&&a>currentMonth+1){
                break;
            }
            labels.push(a+'/'+i)
            let value=0
            let month={
                month:a+'/'+i,
                transactions:[]
            }
            transactions.forEach(item =>{ 
                let itemDate=new Date(item.date)
                if(itemDate.getFullYear()===i&&itemDate.getMonth()===a){
                    value+=item.payment
                    month.transactions.push(item)
                }
            })
            values.push(value)
            months.push(month)
        }
    }
    return {labels,values,months}
}

export {
    calculatePortfolioTotal,
    calculateTickerTotal,
    calculateTickerShareCount,
    calculateDividendTransactions,
    transactionsToMonths
}