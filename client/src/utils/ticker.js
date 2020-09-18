import { formatValue, getNumberOfWeek, roundToTwoDecimal } from "./utils";

export function Ticker(portfolioTicker,tickerData){    
    this.ticker=tickerData.profile.ticker
    this.name=tickerData.profile.name
    this.transactions=portfolioTicker?portfolioTicker.transactions:[]
    this.tickerData=tickerData
    this.latestPrice = (format) => calculateLatestPrice(this,format)
    this.totalCount = (format) => calculateTotalCount(this,format)
    this.averageCost = (format) => calculateAverageCost(this,format)
    this.purchasePrice = (format) => calculatePurchasePrice(this,format)
    this.currentPrice = (format) => calculateCurrentPrice(this,format)
    this.priceChange = (format) => calculatePriceChange(this,format)
    this.marketCap = () => calculateMarketCap(this)
    this.priceChangePercentage = (format) => calculatePriceChangePercentage(this,format)
    this.getMyDivs = (options) => calculateMyDivs(this,options)
    this.filterByDate = (key,options) => calculateFilterByDate(this,key,options)
    this.filterFinancialRatio = (statement, ratio, options) => calculateFilterFinancialRatio(this,statement, ratio, options)
    this.getTickerData = (key) => calculateGetTickerData(this,key)
    this.priceChart = (options) => calculatePriceChart(this,options)
    this.eventChart = (options) => calculateEventChart(this,options)
    this.ratioChart = (options) => calculateRatioChart(this,options)
    this.financialChart = (options) => calculateFinancialChart(this,options)
    this.userPriceChart = (options) => calculateUserPriceChart(this.transactions,this.tickerData,options)
    this.userReturnChart = (options) => calculateUserReturnChart(this.transactions,this.tickerData,options) 
}

function calculateLatestPrice(ticker,format){
    return formatValue(ticker.tickerData.priceData[0].close,format)
}

function calculateTotalCount(ticker,format){
    let value = ticker.transactions.reduce((a,c)=> a+(c.count),0)
    return formatValue(value,format)
}

function calculatePurchasePrice(ticker,format){
    let value = ticker.transactions.reduce((a,c)=> a+(c.count*c.price),0)
    return formatValue(value,format)
}

function calculateAverageCost(ticker,format){
    let value = (calculatePurchasePrice(ticker)/calculateTotalCount(ticker))
    return formatValue(value,format)
}

export function calculateCurrentPrice(ticker,format){
    let price = ticker.tickerData.priceData[0].close
    let value = ticker.transactions.reduce((a,c)=> a+(c.count*price),0)
    return formatValue(value,format)
}

function calculatePriceChange(ticker,format){
    let value = calculateCurrentPrice(ticker)-calculatePurchasePrice(ticker)
    return formatValue(value,format)
}

function calculateMarketCap(ticker){
    console.log(ticker)
    let marketCap = ticker.tickerData.incomeStatement[0].sharesOutstanding*ticker.tickerData.priceData[0].close
    if(marketCap){
       return roundToTwoDecimal(marketCap) 
    }else{
        return 0
    }
    
}

function calculatePriceChangePercentage(ticker,format){
    let value = ((calculateCurrentPrice(ticker)-calculatePurchasePrice(ticker))/calculatePurchasePrice(ticker))*100
    return formatValue(value,format)
}

function calculateMyDivs(ticker){

    const { transactions, tickerData } = ticker
    let dividendData = tickerData.dividendData

    let dividends = transactions.map(item => {
        let divs=dividendData.filter(div => new Date(div.date)>new Date(item.date))
        if(divs.length>0){
            let res= divs.map(div=>{
                return {
                    ticker:tickerData.profile.ticker,
                    date: new Date(div.date),
                    month:new Date(div.date).getMonth(),
                    year:new Date(div.date).getFullYear(),
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

    return dividends.flat(2)
}

function calculateFilterByDate(ticker,key,options){
    const { time } = options
    if(!time.timeStart) return []
    if(key==='dividendData'){
        return ticker.tickerData[key].filter(item => new Date(item.date).getFullYear()>time.timeStart.getFullYear())
    }else{
        let data = ticker.tickerData[key].filter(item => new Date(item.date)>time.timeStart) 
        if(data.length>1){
            if(new Date(data[0].date)<new Date(data[1].date)){
                data = data.reverse()
            }
        }
        return data
    }
    
}

function calculateFilterFinancialRatio(ticker,statement,key,options){
    const { time } = options
    return ticker.tickerData[statement]
        .filter(item => new Date(item.date)>time.timeStart)
}

function calculateGetTickerData(ticker, key){

    let data = ticker.tickerData[key]

    if(data.length>1){
        if(new Date(data[0].date)<new Date(data[1].date)){
            data = data.reverse()
        }
    }
    return data

}

function calculatePriceChart(ticker,options){
    
    let priceData = ticker.filterByDate('priceData',options)
    let dividends = ticker.filterByDate('dividendData',options)

    let data=[] 
    let labels = []
    let dataoff = []

    priceData.forEach(item =>{
        let divAmount = 0
        let closestDiv = dividends.find(div => (Math.abs(new Date(div.date)-new Date(item.date))<604800000)) 
        if(closestDiv){
            dividends=dividends.filter(item => item._id!==closestDiv._id)
            divAmount=closestDiv.dividend
        }
        data.unshift(item.close)
        dataoff.unshift(item.close)
        labels.unshift(item.date.substring(0, 7))
        dividends.unshift(divAmount)
    })    

    let total=0
    let cumulativeDividends = dividends.map((item,index) => (total+=item))
    total=0
    let cumulativeDividendsPrice = dividends.map((item,index) => ((total+=item)+data[index]))
    let percentageChangeWithDivs = cumulativeDividendsPrice.map(item => Number((((item-dataoff[0])/dataoff[0])*100).toFixed(2)))
    let percentageChange = dataoff.map(item => Number((((item-dataoff[0])/dataoff[0])*100).toFixed(2)))

    return { 
        data, 
        labels,
        cumulativeDividends,
        cumulativeDividendsPrice,
        percentageChange,
        percentageChangeWithDivs  
    }
}

function calculateEventChart(ticker,options){
    
    let priceData = ticker.filterByDate('priceData',options)
    
    let dividends = ticker.filterByDate('dividendData',options)
    
    let myDivs = ticker.getMyDivs(options)

    let data=[] 
    let labels = []
    let dataoff = []

    priceData.forEach(item =>{
        let divAmount = 0
        let closestDiv = dividends.find(div => (Math.abs(new Date(div.date)-new Date(item.date))<604800000)) 
        if(closestDiv){
            dividends=dividends.filter(item => item._id!==closestDiv._id)
            divAmount=closestDiv.dividend
        }
        data.unshift(item.close)
        dataoff.unshift(item.close)
        labels.unshift(item.date.substring(0, 7))
        dividends.unshift(divAmount)
    })    

    let total=0
    let cumulativeDividends = dividends.map((item,index) => (total+=item))
    total=0
    let cumulativeDividendsPrice = cumulativeDividends.map((item,index) => ((total+=item)+data[index]))
    let percentageChangeWithDivs = cumulativeDividendsPrice.map(item => Number((((item-dataoff[0])/dataoff[0])*100).toFixed(2)))
    let percentageChange = dataoff.map(item => Number((((item-dataoff[0])/dataoff[0])*100).toFixed(2)))

    const events = calculateChartEvents(data,labels,ticker,options,myDivs)

    return { 
        data, 
        labels,
        cumulativeDividends,
        cumulativeDividendsPrice,
        percentageChange,
        percentageChangeWithDivs,
        events
    }
}

function calculateRatioChart(ticker,options){

    const key = options.selected
    let priceData = ticker.filterByDate('priceData',options)
    
    let ratios = [];
    let ratioName=''

    switch(key){
        case 'pe':
            ratios = ticker.filterByDate('incomeStatement',options)
            
            ratioName='eps'
            break
        case 'pb':
            ratios = ticker.filterByDate('balanceSheet',options)
            
            ratioName='tangibleBookValuePerShare'
            break
        case 'dividendYield':
            ratios = ticker.filterByDate('dividendData',options)
            
            ratioName='dividend'
            break
        default: return ''
    }

    let data=[]
    let labels=[]
    let tickerPriceData=[]

    priceData.forEach(price =>{
        let ratio=ratios.find(item => new Date(item.date).getFullYear()<=new 
        Date(price.date).getFullYear())
        if(ratio){
            switch(key){
                case 'pe':
                case 'pb':
                    if(ratio[ratioName]){
                        data.unshift(Number((price.close/ratio[ratioName]).toFixed(1)) )                        
                    }
                    break
                case 'dividendYield':
                    let yearDivs = ratios.filter(item => new Date(item.date).getFullYear()===new Date(price.date).getFullYear())
                    let totalDiv = yearDivs.reduce((a,b)=>a+b.dividend,0)
                    data.unshift(Number(((totalDiv/price.close)*100).toFixed(1)))
                    break
                default: return ''
            }
            labels.unshift(price.date.substring(0, 7))
            tickerPriceData.unshift(price.close)
        }
    })
    
    if(ratios.length>1){
        if(new Date(ratios[0].date)>new Date(ratios[1].date)){
            ratios = ratios.reverse()
        }
    }

    let financialData = ratios.map(item => item[ratioName])
    let financialLabels = ratios.map(item => item.date.split('T')[0])

    return { data, labels, tickerPriceData, financialData, financialLabels }

}

function calculateFinancialChart(ticker,options){

    let selectedStatement = options.selected
    let financialData = ticker.filterByDate(selectedStatement,options)
    
    let data1=[]
    let data2=[]
    let data3=[]
    let data4=[]
    let labels=[]

    financialData.forEach(item =>{
        switch(selectedStatement){
            case 'incomeStatement':
                data1.unshift(item.revenue)
                data2.unshift(item.netIncome)
                break
            case 'balanceSheet':
                data1.unshift(item.currentAssets)
                data2.unshift(item.currentLiabilities)
                break
            case 'cashFlow':
                data1.unshift(item.operatingCashFlow)
                data2.unshift(item.investingCashFlow)
                data3.unshift(item.financingCashFlow)
                data4.unshift(item.operatingCashFlow+item.investingCashFlow+item.financingCashFlow)
                break
            default: return ''
        }
        labels.unshift(item.date.substring(0, 7))
    })

    let fullFinancialData = ticker.getTickerData(selectedStatement)

    return { data1, data2, data3, data4, labels, financialData, fullFinancialData }
}

function calculateUserPriceChart(transactions,tickerData,options){
    const { time } = options
    let priceData = tickerData.priceData.filter(item => new Date(item.date)>time.timeStart) 
    let divData = tickerData.dividendData.filter(item => new Date(item.date)>time.timeStart)  
    let data=[];
    transactions.forEach(transaction =>{
        priceData.forEach((price,index) =>{
            let week = getNumberOfWeek(new Date(price.date))
            if(week!==1&&index>0){
                let key = Number(week+'.'+new Date(price.date).getFullYear()+'1') 
                let divAmount=0     
                let closestDiv = divData.find(item => (Math.abs(new Date(item.date)-new Date(price.date))<604800000)) 
                if(closestDiv){
                    divData=divData.filter(item => item._id!==closestDiv._id)
                    divAmount=closestDiv.dividend*transaction.count
                }
                if(new Date(transaction.date)<new Date(price.date)){
                    data.push({
                        key,
                        date:new Date(price.date),
                        value:transaction.count*price.close,
                        dividend:divAmount
                    })
                }   
            }
        })
    })

    return data
}

function calculateUserReturnChart(transactions,tickerData,options){
    const { time } = options
    let priceData = tickerData.priceData.filter(item => new Date(item.date)>time.timeStart) 
    let divData = tickerData.dividendData.filter(item => new Date(item.date)>time.timeStart)  
    let data=[];
    transactions.forEach(transaction =>{
        priceData.forEach((price,index) =>{
            let week = getNumberOfWeek(new Date(price.date))
            if(week!==1&&index>0){
                let key = Number(week+'.'+new Date(price.date).getFullYear()+'1') 
                let divAmount=0     
                let closestDiv = divData.find(item => (Math.abs(new Date(item.date)-new Date(price.date))<604800000)) 
                if(closestDiv){
                    divData=divData.filter(item => item._id!==closestDiv._id)
                    divAmount=closestDiv.dividend*transaction.count
                }
                if(new Date(transaction.date)<new Date(price.date)){
                    data.push({
                        key,
                        date:new Date(price.date),
                        value:((transaction.count*price.close)-(transaction.count*transaction.price)),
                        dividend:divAmount
                    })
                }   
            }
        })
    })

    return data
}

function calculateChartEvents(data,labels,ticker,options,myDivs){

    const  { time } = options 
    const { transactions } = ticker

    let trades = transactions.filter(item => new Date(item.date)>time.timeStart)
    let insider = ticker.tickerData.insiderTrading.reverse().filter(item => new Date(item.date)>time.timeStart)
    let dividends = ticker.tickerData.dividendData.reverse().filter(item => new Date(item.date)>time.timeStart)
    let userDivs = myDivs.filter(item => new Date(item.date)>time.timeStart)

    let tradePoints = data.map(item => 0)
    let insiderPoints = data.map(item => 0)
    let insiderBuyPoints = data.map(item => 0)
    let insiderSellPoints = data.map(item => 0)
    let insiderOtherPoints = data.map(item => 0)
    let dividendPoints = data.map(item => 0)
    let userDivPoints = data.map(item => 0)
    let insiderPointColors = data.map(item => 0)
    let tradePointColors = data.map(item => 0)

    let insiderTooltipLabels = data.map(item => [])
    let insiderBuyLabels = data.map(item => [])
    let insiderSellLabels = data.map(item => [])
    let insiderOtherLabels = data.map(item => [])
    let tradeTooltipLabels = data.map(item => [])
    let userDivTooltipLabels = data.map(item => [])
    let divTooltipLabels = data.map(item => [])

    let tooltipLabels = data.map(item => [])


    dividends.forEach(item =>{
        let divDate = new Date(item.date)
        let index = labels.findIndex(elem => Math.abs(new Date(elem)-divDate)<1604800000)
        if(index>=0){
            divTooltipLabels[index].push('Dividend '+item.dividend)
            dividendPoints[index]=7            
        }
    })

    userDivs.forEach(item =>{
        let userDivDate = new Date(item.date)
        let index = labels.findIndex(elem => Math.abs(new Date(elem)-userDivDate)<1604800000)
        if(index>=0){
            userDivTooltipLabels[index].push('Dividend '+item.payment)
            userDivPoints[index]=7           
        }
    })


    insider.forEach(item => {
        let insiderDate = new Date(item.date)
        let index = labels.findIndex(elem => Math.abs(new Date(elem)-insiderDate)<1604800000)
        if(index>=0){
            insiderTooltipLabels[index].push(item.type+` ${item.name} (${item.position})   ${item.volume}pcs ${item.price}$` )
            insiderPointColors[index]=getInsiderTradeType(item.type)
            insiderPoints[index]=10             
            if(item.type==='buy'){
                insiderBuyPoints[index]=10 
                insiderBuyLabels[index].push(item.type+` ${item.name} (${item.position})   ${item.volume}pcs ${item.price}$` )
            }else if(item.type==='sell'){
                insiderSellPoints[index]=10 
                insiderSellLabels[index].push(item.type+` ${item.name} (${item.position})   ${item.volume}pcs ${item.price}$` )
            }else{
                insiderOtherPoints[index]=10 
                insiderOtherLabels[index].push(item.type+` ${item.name} (${item.position})   ${item.volume}pcs ${item.price}$` )
            }
        }
    })             

    trades.forEach(item => {
        let insiderDate = new Date(item.date)
        let index = labels.findIndex(elem => Math.abs(new Date(elem)-insiderDate)<1604800000)
        tradeTooltipLabels[index].push(item.type+` ${item.count}pcs ${item.price}$` )
        tradePoints[index]=10 
        tradePointColors[index] = item.type==='buy'?'rgba(0, 255, 128,0.9)':'rgba(255, 89, 0,0.9)'
    }) 

    return { 
        tooltipLabels,
        tradePoints,
        insiderPoints,
        dividendPoints,
        userDivPoints,
        insiderPointColors,
        insiderTooltipLabels,
        tradeTooltipLabels,
        userDivTooltipLabels,
        divTooltipLabels,
        insiderBuyPoints,
        insiderSellPoints,
        insiderOtherPoints,
        insiderBuyLabels,
        insiderSellLabels,
        insiderOtherLabels,
        tradePointColors
    }
}

function getInsiderTradeType(type){
    switch(type) {
        case 'Buy':
            return 'rgba(76, 212, 122,0.9)'
        case 'Sell':
            return 'rgba(255, 79, 79,0.9)'
        default: return 'yellow'
      }
}