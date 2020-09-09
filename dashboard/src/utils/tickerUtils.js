import { roundToTwoDecimal, formatCurrency, formatValue, getNumberOfWeek } from "./utils";

export function TickerData(ticker,tickerData){
    this.ticker=ticker.ticker
    this.name=ticker.name
    this.transactions=ticker.transactions
    this.tickerData=tickerData.find(item => item.profile.ticker===ticker.ticker)
    this.totalCount = (format) => calculateTotalCount(this.transactions,format)
    this.averageCost = (format) => calculateAverageCost(this.transactions,format)
    this.purchasePrice = (format) => calculatePurchasePrice(this.transactions,format)
    this.currentPrice = (format) => calculateCurrentPrice(this.transactions,this.tickerData,format)
    this.priceChange = (format) => calculatePriceChange(this.transactions,this.tickerData,format)
    this.priceChangePercentage = (format) => calculatePriceChangePercentage(this.transactions,this.tickerData,format)
    this.priceChartData = (options) => calculatePriceChart(this.transactions,this.tickerData,options)
    this.returnChartData = (options) => calculateReturnChart(this.transactions,this.tickerData,options) 
}

function calculateTotalCount(transactions,format){
    let value = transactions.reduce((a,c)=> a+(c.count),0)
    return formatValue(value,format)
}

function calculatePurchasePrice(transactions,format){
    let value = transactions.reduce((a,c)=> a+(c.count*c.price),0)
    return formatValue(value,format)
}

function calculateAverageCost(transactions,format){
    let value = (calculatePurchasePrice(transactions)/calculateTotalCount(transactions))
    return formatValue(value,format)
}

function calculateCurrentPrice(transactions,tickerData,format){
    let price = tickerData.priceData[0].close
    let value = transactions.reduce((a,c)=> a+(c.count*price),0)
    return formatValue(value,format)
}

function calculatePriceChange(transactions,tickerData,format){
    let value = calculateCurrentPrice(transactions,tickerData)-calculatePurchasePrice(transactions)
    return formatValue(value,format)
}

function calculatePriceChangePercentage(transactions,tickerData,format){
    let value = ((calculateCurrentPrice(transactions,tickerData)-calculatePurchasePrice(transactions))/calculatePurchasePrice(transactions))*100
    return formatValue(value,format)
}

function calculatePriceChart(transactions,tickerData,options){
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

function calculateReturnChart(transactions,tickerData,options){
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