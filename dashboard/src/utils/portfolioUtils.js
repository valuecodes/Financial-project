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
    let tickerFound = tickerData.filter(item => item.ticker === ticker.ticker)
   
    if(tickerFound.length===0){
        return []
    }
    
    let dividendData = tickerFound[0].dividendData

    let dividends = transactions.map(item => {
        let divs=dividendData.filter(div => new Date(div.date)>new Date(item.date))
        if(divs.length>0){
            let res= divs.map(div=>{
                return {
                    ticker:ticker.ticker,
                    date:div.date,
                    dividend:div.dividend,
                    shareCount:item.count,
                    payment:div.dividend*item.count,
                    transactionId:div._id
                }
            })
            return res
        }
    }).filter(Boolean)
    
    if(dividends.length>1){
        dividends = dividends.flat(2)
        let mergedDivs = {}
        dividends.forEach(div => {
            if(mergedDivs[div.date]){
                mergedDivs[div.date].shareCount+=div.shareCount
                mergedDivs[div.date].payment=mergedDivs[div.date].dividend*mergedDivs[div.date].shareCount
            }else{
                mergedDivs[div.date] = div
            }
        })
        let updatedDivs=[]
        for(let key in mergedDivs){
            updatedDivs.push(mergedDivs[key])
        }
        dividends = updatedDivs
    }
    
    return dividends
}

function transactionsToMonths(transactions,time){
    let currentMonth=new Date().getMonth();
    let currentYear=new Date().getFullYear();
    let start = new Date(transactions[transactions.length-1].date).getFullYear()
    let end = new Date(transactions[0].date).getFullYear()
    
    if(time.start){
        start = time.start.getFullYear()
        end = time.end.getFullYear()
    }

    let labels=[]
    let values=[]
    let months=[]
    for(var i=start;i<=end;i++){
        for(var a=1;a<=12;a++){
            if(i===currentYear&&a>currentMonth+1){
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

function getAllDividends(tickerData, transactions){
    let dividends = tickerData.map(ticker => {
        let div=ticker.dividendData
        div.forEach(item => {
            item.ticker=ticker.ticker
            let transaction = transactions.find(tra => tra.transactionId==item._id)
            if(transaction){
                item.transaction=transaction
            }else{
                item.transaction=null
            }
        })
        return div
    })
    return dividends.flat(1).sort((a,b) => new Date(b.date)- new Date(a.date) )
}

function filterDividends(dividendList,time,selectedTicker){
    let selectedDivs = filterBetweenDates(dividendList,time)
    if(selectedTicker._id){
        selectedDivs = selectedDivs.filter(div => div.ticker===selectedTicker.ticker)
    }
    return selectedDivs
}

function getMonthNum(item){
    return new Date(item.date).getMonth()
}

export {
    calculatePortfolioTotal,
    calculateTickerTotal,
    calculateTickerShareCount,
    calculateDividendTransactions,
    transactionsToMonths,
    getAllDividends,
    filterDividends,
    getMonthNum
}

function filterBetweenDates(list,time){
    
    return list.filter(item => {
        return new Date(item.date)>new Date(time.start)&&new Date(item.date)<new Date(time.end)
    })
}

// Price Data
export function calculateTickerPriceData(ticker,time,selectedPortfolio){

    let priceData = ticker.priceData
    
    if(new Date(priceData[0].date)>new Date(priceData[1].date)){
        priceData = ticker.priceData.reverse()
    }
    
    let insider = ticker.insiderTrading.reverse().filter(item => new Date(item.date)>time.start)
    priceData = priceData.filter(item => new Date(item.date)>time.start)

    const labels =  priceData.map(item => item.date.split('T')[0])
    
    // let {points,pointColors, tooltipLabels, tooltipFooters} = setInsiderTrades(priceData,insider,labels)

    let currentTicker = selectedPortfolio.tickers.find(item => item.ticker===ticker.ticker)

    let {points,pointColors, tooltipLabels, tooltipFooters} = setPortfolioTrades(priceData,currentTicker,labels,time)

    const data = priceData.map(item => item.close)

    return { data, labels, points, pointColors, tooltipLabels, tooltipFooters }
}

function setPortfolioTrades(priceData,currentTicker,labels,time){

    let trades = currentTicker.transactions.filter(item => new Date(item.date)>time.start)

    let points=priceData.map(item => 0)
    let pointColors = priceData.map(item => 0)
    let tooltipLabels = priceData.map(item => [])
    // let tooltipFooters = priceData.map(item => [])

    trades.forEach(item => {
        let insiderDate = new Date(item.date)
        let index = labels.findIndex(elem => Math.abs(new Date(elem)-insiderDate)<604800000)
        points[index]=5
        pointColors[index]=item.type==='buy'?'green':'red'
        tooltipLabels[index].push(item.type+` ${item.count}pcs ${item.price}$` )
    })

    return { points, pointColors, tooltipLabels}
}

function setInsiderTrades(priceData,insider,labels){

    let points=priceData.map(item => 0)
    let pointColors = priceData.map(item => 0)
    let tooltipLabels = priceData.map(item => [])
    let tooltipFooters = priceData.map(item => [])

    insider.forEach(item => {
        let insiderDate = new Date(item.date)
        let index = labels.findIndex(elem => Math.abs(new Date(elem)-insiderDate)<604800000)
        points[index]=5
        pointColors[index]=item.type==='Buy'?'green':'red'
        tooltipLabels[index].push(item.type+` ${item.name} (${item.position})   ${item.volume}pcs ${item.price}$` )
        tooltipFooters[index].push(item)
    })

    return { points, pointColors, tooltipLabels,tooltipFooters}

}