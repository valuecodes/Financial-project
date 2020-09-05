function calculatePortfolioTotal(portfolio){
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
    let tickerFound = tickerData.filter(item => item.profile.ticker === ticker.ticker)
   
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

export function calculateTickerPriceData(ticker,selectedPortfolio,options){
    let currentTicker = selectedPortfolio.tickers.find(item => item.ticker===ticker.profile.ticker)
    let myDivs = calculateDividendTransactions(selectedPortfolio,[ticker])

    const { 
        data, 
        labels 
    } = calculateChartPrices(ticker,options)

    let { 
        points, 
        pointColors, 
        tooltipLabels, 
        tooltipFooters 
    } = calculateChartEvents(data,ticker,currentTicker,labels,options,myDivs)

    return { data, labels, points, pointColors, tooltipLabels, tooltipFooters }
}

function calculateChartPrices(ticker,options){
    let priceData = ticker.priceData
    
    if(new Date(priceData[0].date)>new Date(priceData[1].date)){
        priceData = ticker.priceData.reverse()
    }
    
    priceData = priceData.filter(item => new Date(item.date)>options.time.timeStart)
    const labels =  priceData.map(item => item.date.split('T')[0])
    const data = priceData.map(item => item.close)
    return { data, labels }
}

function calculateChartEvents(data,ticker,currentTicker,labels,options,myDivs){
    const  { events, time } = options 

    let trades = currentTicker.transactions.filter(item => new Date(item.date)>time.timeStart)
    let insider = ticker.insiderTrading.reverse().filter(item => new Date(item.date)>time.timeStart)
    let dividends = ticker.dividendData.reverse().filter(item => new Date(item.date)>time.timeStart)
    let userDivs = myDivs.reverse().filter(item => new Date(item.date)>time.timeStart)

    let points=data.map(item => 0)
    let pointColors = data.map(item => 0)
    let tooltipLabels = data.map(item => [])

    if(events.dividends){
        dividends.forEach(item =>{
            let divDate = new Date(item.date)
            let index = labels.findIndex(elem => Math.abs(new Date(elem)-divDate)<604800000)
            points[index]=5
            pointColors[index]='gray'
            tooltipLabels[index].push('Dividend '+item.dividend)
        })
    }

    if(events.userDividends){
        userDivs.forEach(item =>{
            let userDivDate = new Date(item.date)
            let index = labels.findIndex(elem => Math.abs(new Date(elem)-userDivDate)<604800000)
            points[index]=10
            pointColors[index]='lightgreen'
            tooltipLabels[index].push('Dividend '+item.payment)
        })
    }
    
    if(events.insiderTrades){
        insider.forEach(item => {
            let insiderDate = new Date(item.date)
            let index = labels.findIndex(elem => Math.abs(new Date(elem)-insiderDate)<604800000)
            points[index]=5
            pointColors[index]=getInsiderTradeType(item.type)
            tooltipLabels[index].push(item.type+` ${item.name} (${item.position})   ${item.volume}pcs ${item.price}$` )
        })        
    }

    if(events.userTrades){
        trades.forEach(item => {
            let insiderDate = new Date(item.date)
            let index = labels.findIndex(elem => Math.abs(new Date(elem)-insiderDate)<604800000)
            points[index]=10
            pointColors[index]=item.type==='buy'?'green':'red'
            tooltipLabels[index].push(item.type+` ${item.count}pcs ${item.price}$` )
        })        
    }

    return { points, pointColors, tooltipLabels}
}

function getInsiderTradeType(type){
    switch(type) {
        case 'Buy':
          return 'green'
          break;
        case 'Sell':
          return 'red'
          break;
        default:
            return 'yellow'
      }
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

export function calculatePortfolioChart(tickerData,portfolio,options){

    const { time } = options
    
    let tickers = portfolio.tickers.map(item => item)
  
    
    tickers.forEach(item =>
        item.priceData = 
        tickerData.find(elem => elem.profile.ticker===item.ticker)
        .priceData
        .filter(item => new Date(item.date)>time.timeStart)
    )
    
    let dates={}
    
    tickers.forEach(item =>    
        item.priceData.forEach(price =>{
            let divDate=price.date.split('T')[0]
            item.transactions.forEach(transaction=>{
                if(new Date(transaction.date)<new Date(price.date)){
                    let week = getNumberOfWeek(price.date)
                    let year = new Date(price.date).getFullYear()
                    let key =year+'/'+week
                    if(dates[key]){
                        dates[key]+=transaction.count*price.close
                    }else{
                        dates[key]=transaction.count*price.close
                    }                    
                }
            })
        }
        )
    )
    let labels = Object.keys(dates).reverse()
    let data = Object.values(dates).reverse()
    labels = labels.map(label => label.split('T')[0])
    return { labels, data }
}

function getNumberOfWeek(dt) {
    dt = new Date(dt)
    var tdt = new Date(dt.valueOf());
    var dayn = (dt.getDay() + 6) % 7;
    tdt.setDate(tdt.getDate() - dayn + 3);
    var firstThursday = tdt.valueOf();
    tdt.setMonth(0, 1);
    if (tdt.getDay() !== 4) 
      {
     tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
       }
    return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}

export function calculateTickerCurrentValue(ticker,tickerData){
    let found = tickerData.find(item => item.profile.ticker===ticker.ticker)
    if(found){
        let price = found.priceData[0].close
        let count = calculateTickerShareCount(ticker)
        return Number((price*count).toFixed(2))
    }
    return 0
}