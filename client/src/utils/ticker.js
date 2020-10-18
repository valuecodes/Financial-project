import { formatValue, getNumberOfWeek, roundToTwoDecimal } from "./utils";
import { TickerData } from "./tickerData";
import { calculatePriceChart, calculateEventChart, calculateRatioFinacialChart, calculateRatioChart, calculateRatioPriceChart, calculateRatioChartComponents, calculateFinancialChartComponents, calculateFinancialChart } from "./chart";
import { priceChartOptions, MACDDataOptions, eventChartOptions, financialChartOptions } from "./chartOptions";

export function Ticker(data,portfolioTicker){
    this.profile = data?data.profile:{
        ticker:'',
        name:'',
        description:'',
        sector:'',
        stockExhange: '',
        industry:'',
        subIndustry:'',
        founded:'',
        address:'',
        website:'',
        employees:'',
        country:'',
        tickerCurrency:'',
        financialDataCurrency:'',
    }
    this.incomeStatement = data?data.incomeStatement:[]
    this.balanceSheet = data?data.balanceSheet:[]
    this.cashFlow = data?data.cashFlow:[]
    this.insiderTrading = data?data.insiderTrading:[]
    this.dividendData = data?data.dividendData:[]
    this.priceData = data?data.priceData:[]
    this.transactions = portfolioTicker?portfolioTicker.transactions:[]
    
    this.priceChart={
        chart:null,
        data:{},
        options:{
            responsive:true,
            maintainAspectRatio: false,            
        },        
        MACDData:{},
        MACDDataOptions:{
            responsive:true,
            maintainAspectRatio: false,  
        },
    }

    this.eventChart={
        data:{},
        options:{
            responsive:true,
            maintainAspectRatio: false,   
        }
    }

    this.ratiosChart={
        priceChartData:{},
        ratioChartData:{},
        financialChartData:{}
    }

    this.financialChart={
        data:{},
        options:{
            responsive:true,
            maintainAspectRatio: false,   
        },
        fullFinancialData:null
    }

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
    this.filterFinancialRatio = (statement, ratio, options) => calculateFilterFinancialRatio(this, statement, ratio, options)
    this.getTickerData = (key) => calculateGetTickerData(this,key)
    this.updatePriceChart = (options,chart) => handleUpdatePriceChart(this,options,chart)
    this.updateEventChart = (options) => handleUpdateEventChart(this,options)
    this.updateRatiosChart = (options) => handleUpdateRatiosChart(this,options)
    this.updateFinancialChart = (options) => handleUpdateFinancialChart(this,options)

    this.userPriceChart = (options) => calculateUserPriceChart(this,options)
    this.userReturnChart = (options) => calculateUserReturnChart(this,options) 

    this.init = () => handleInit(this)
    this.setMovingAverages = () => handleSetMovingAverages(this)
}

function handleInit(ticker){
    ticker.setMovingAverages()
}

function handleSetMovingAverages(ticker){
    const { priceData } = ticker
    
    priceData.forEach((item,index) =>{
        let total12=0
        let total26=0
        let total50=0
        let total200=0
        for(let i=index;i<index+2;i++){
            if(!priceData[i]){
                total12=null
                break
            }
            total12+=priceData[i].close
        }
        for(let i=index;i<index+4;i++){
            if(!priceData[i]){
                total26=null
                break
            }
            total26+=priceData[i].close
        }
        for(let i=index;i<index+7;i++){
            if(!priceData[i]){
                total50=null
                break
            }
            total50+=priceData[i].close
        }
        for(let i=index;i<index+29;i++){
            if(!priceData[i]){
                total200=null
                break
            }
            total200+=priceData[i].close
        }

        if(total200===null) total50=null

        item.MA12 = total12?total12/2:item.close
        item.MA26 = total26?total26/4:item.close
        item.MA50 = total50?total50/7.14:item.close
        item.MA200 = total200?total200/28.57:item.close
    })
}

function calculateLatestPrice(ticker,format){
    if(!ticker.priceData[0]) return 0
    return formatValue(ticker.priceData[0].close,format)
}

function calculateTotalCount(ticker,format){
    let value = ticker.transactions?ticker.transactions.reduce((a,c)=> a+(c.count),0):0
    return formatValue(value,format)
}

function calculatePurchasePrice(ticker,format){
    let value = ticker.transactions?ticker.transactions.reduce((a,c)=> a+(c.count*c.price),0):0
    return formatValue(value,format)
}

function calculateAverageCost(ticker,format){
    let value = (calculatePurchasePrice(ticker)/calculateTotalCount(ticker))
    return formatValue(value,format)
}

export function calculateCurrentPrice(ticker,format){
    let price = ticker.priceData[0]?ticker.priceData[0].close:0
    let value = ticker.transactions?ticker.transactions.reduce((a,c)=> a+(c.count*price),0):0
    return formatValue(value,format)
}

function calculatePriceChange(ticker,format){
    let value = calculateCurrentPrice(ticker)-calculatePurchasePrice(ticker)
    return formatValue(value,format)
}

function calculateMarketCap(ticker){
    let marketCap =ticker.incomeStatement[0]?ticker.incomeStatement[0].sharesOutstanding*ticker.priceData[0].close:null
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

    const { transactions, dividendData } = ticker
    if(!transactions) return []

    let dividends = transactions.map(item => {
        let divs=dividendData.filter(div => new Date(div.date)>new Date(item.date))
        if(divs.length>0){
            let res= divs.map(div=>{
                return {
                    ticker:ticker.profile.ticker,
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
        return ticker[key].filter(item => new Date(item.date).getFullYear()>time.timeStart.getFullYear())
    }else{
        let data = ticker[key].filter(item => new Date(item.date)>time.timeStart) 
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
    return ticker[statement]
        .filter(item => new Date(item.date)>time.timeStart)
}

function calculateGetTickerData(ticker, key){

    let data = ticker[key]

    if(data.length>1){
        if(new Date(data[0].date)<new Date(data[1].date)){
            data = data.reverse()
        }
    }
    return data

}

function handleUpdatePriceChart(ticker,options,chart){
    const { MACDData, datasets, labels } = calculatePriceChart(ticker,options)
    ticker.priceChart.data = { datasets, labels }
    ticker.priceChart.options = priceChartOptions(ticker,options,chart) 
    ticker.priceChart.MACDData= { datasets:MACDData, labels }
    ticker.priceChart.MACDDataOptions = MACDDataOptions()
    return ticker
}

function handleUpdateEventChart(ticker,options) {
    ticker.eventChart.data = calculateEventChart(ticker,options)
    ticker.eventChart.options = eventChartOptions()
    return ticker
}

function handleUpdateRatiosChart(ticker,options){
    let ratioChartComponents = calculateRatioChartComponents(ticker,options)
    let ratioChart = calculateRatioChart(ratioChartComponents,options)
    let priceChart = calculateRatioPriceChart(ratioChart,ratioChartComponents,options)
    let financialChart = calculateRatioFinacialChart(ratioChartComponents,options)
    ticker.ratiosChart.priceChartData = priceChart
    ticker.ratiosChart.ratioChartData = ratioChart
    ticker.ratiosChart.financialChartData = financialChart
    return ticker
}

function handleUpdateFinancialChart(ticker,options){
    let financialChartComponents = calculateFinancialChartComponents(ticker,options)  
    let financialChartData = calculateFinancialChart(financialChartComponents,options)
    ticker.financialChart.data = financialChartData
    ticker.financialChart.options = financialChartOptions(options)
    ticker.financialChart.fullFinancialData = financialChartComponents.fullFinancialData.length>0?financialChartComponents.fullFinancialData:null
    return ticker
}

function calculateUserPriceChart(ticker,options){
    const { time } = options
    let priceData = ticker.priceData.filter(item => new Date(item.date)>time.timeStart) 
    let divData = ticker.dividendData.filter(item => new Date(item.date)>time.timeStart)  
    
    let data=[];
    if(!ticker.transactions) return data

    ticker.transactions.forEach(transaction =>{
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

function calculateUserReturnChart(ticker,options){
    const { time } = options
    let priceData = ticker.priceData.filter(item => new Date(item.date)>time.timeStart) 
    let divData = ticker.dividendData.filter(item => new Date(item.date)>time.timeStart)  
    let data=[];
    
    if(!ticker.transactions) return data

    ticker.transactions.forEach(transaction =>{
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
