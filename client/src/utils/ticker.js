import { formatValue, getNumberOfWeek, roundToTwoDecimal } from "./utils";
import { calculatePriceChart, calculateEventChart, calculateRatioFinacialChart, calculateRatioChart, calculateRatioPriceChart, calculateRatioChartComponents, calculateFinancialChartComponents, calculateFinancialChart, calculateForecastChartComponents } from "./chart";
import { priceChartOptions, MACDDataOptions, eventChartOptions, financialChartOptions, calculateForecastChartOptions, calculateForecastFinancialsOptions } from "./chartOptions";

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
    this.analytics = {
        price:{
            ending:0,
            latest:0,
            starting:0,
            futurePE:0
        },
        annualReturn:{
            price:0,
            div:0,
            total:0
        },
        financials:{},
        yearlyData:{}
    }
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
        oscillatorData:{},
        oscillatorDataOptions:{
            responsive:true,
            maintainAspectRatio: false,  
            plugins: {
                datalabels: {
                    display: false,
                }
            },
            annotation: {
                drawTime: 'beforeDatasetsDraw',
                annotations:[
                {
                    type: 'box',
                    xScaleID: 'x-axis-0',
                    yScaleID: 'y-axis-0',
                    xMin: 0,
                    xMax: 10000,
                    yMin: -55,
                    yMax: 60,
                    backgroundColor: 'rgba(227, 227, 227, 1)',
                    borderWidth: 1                    
                },
            ]
            },
            legend: {
                display: false,
                  labels: {
                    display: false
                  }
            },
            scales: {            
                yAxes: [{  
                    ticks: {
                        maxTicksLimit:6,
                        maxRotation: 0,
                        minRotation: 0,
                    },
                }],
                xAxes: [{  
                    ticks: {
                        maxTicksLimit:8,
                        maxRotation: 0,
                        minRotation: 0,
                    },
                }],
            }
        }
    }

    this.eventChart={
        data:{},
        options:{
            responsive:true,
            maintainAspectRatio: false,   
        },
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

    this.forecastSection={
        forecastChart:{},
        forecastOptions:{
            responsive:true,
            maintainAspectRatio: false
        },
        financialChart:{},
        financialOptions:{
            responsive:true,
            maintainAspectRatio: false
        },
        freeCashFlowChart:{},
        freeCashFlowOptions:{
            responsive:true,
            maintainAspectRatio: false
        },
        dcfTable:{
            years:[],
            FCF:[],
            DF:[],
            DFvalue:1,
            DFCF:[],
        }
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
    this.updateForecastChart = () => handleUpdateForecastChart(this)

    this.userPriceChart = (options) => calculateUserPriceChart(this,options)
    this.userReturnChart = (options) => calculateUserReturnChart(this,options) 

    this.init = () => handleInit(this)
    this.setMovingAverages = () => handleSetMovingAverages(this)
    this.calculateAnalytics = () => handleCalculateAnalytics(this)
}

function handleInit(ticker){
    ticker.setMovingAverages()
    ticker.calculateAnalytics()
    return ticker
}

function handleCalculateAnalytics(ticker){

    let dividendData = ticker.dividendData
    .reverse() 
    let divData = [...dividendData]

    const { data:peData, financialData:epsData, ratios } = calculateRatioChartComponents(ticker,{selected:'pe'})
    const cashFlow = ticker.cashFlow

    let latestPE = peData[peData.length-1]
    let averagePE = peData.reduce((a,c)=> a+c,0)/peData.length
    let peDiscount = averagePE/latestPE
    let epsGrowth=0
    let epsTotal = 0
    for(var i=0;i<epsData.length-1;i++){
        epsTotal+=(epsData[i+1]/epsData[i]) - 1
    }
    let epsGrowthRate = epsTotal/(epsData.length-1)

    let latestEps = ratios[ratios.length-1]
    let lastFullFinancialYear=new Date().getFullYear()
    let firstFullFinancialYear = new Date(ratios[0].date).getFullYear()
    let shareCount =0
    if(latestEps){
        lastFullFinancialYear=new Date(latestEps.date).getFullYear()
        shareCount = latestEps.sharesOutstanding
    }

    let yearlyData={}
    divData.forEach(item =>{
        let year = new Date(item.date).getFullYear()
        if(year<=lastFullFinancialYear){
            if(yearlyData[year]){
                yearlyData[year].div+=item.dividend
            }else{
                let yearData = ratios.find(item => new Date(item.date).getFullYear()===year)
                let cashflowData = cashFlow.find(item => new Date(item.date).getFullYear()===year)
                let freeCashFlow = null
                if(cashflowData){ 
                    freeCashFlow = cashflowData.operatingCashFlow+cashflowData.capEx
                }
                
                yearlyData[year]={
                    div:item.dividend,
                    ...yearData,
                    ...cashflowData,
                    freeCashFlow,
                    date:year+'-11'
                }
            }
        }
    })

    for(let i= firstFullFinancialYear;i<=lastFullFinancialYear;i++){
        let year = i
        if(!yearlyData[year]){
            let yearData = ratios.find(item => new Date(item.date).getFullYear()===year)
            let cashflowData = cashFlow.find(item => new Date(item.date).getFullYear()===year)     
            let freeCashFlow = null
            if(cashflowData){
                freeCashFlow = cashflowData.operatingCashFlow+cashflowData.capEx
            }  
               
            yearlyData[year]={
                div:0,
                ...yearData,
                ...cashflowData,      
                freeCashFlow,                          
                date:year+'-11'
            }
        }
    }

    let numberOfCashflowYears = 0
    let totalFreeCashFlow = 0
    let freeCashFlow = {}

    Object.keys(yearlyData).forEach(item =>{
        let freeCashFlowValue = yearlyData[item].freeCashFlow
        console.log(freeCashFlowValue)
        if(freeCashFlowValue){
            numberOfCashflowYears++
            totalFreeCashFlow+=freeCashFlowValue
            freeCashFlow = {
                latest: freeCashFlowValue.toFixed(),
                average:0,
                date: item.date
            }
        }
    })
    console.log(totalFreeCashFlow,numberOfCashflowYears)
    let averageFreeCashFlow = totalFreeCashFlow / numberOfCashflowYears
    freeCashFlow.average = averageFreeCashFlow
    let startingPrice = roundToTwoDecimal(ticker.priceData[0].close)

    let price={
        latest:startingPrice,
        starting:startingPrice,
        ending:0,
        latestPE:latestPE,
        averagePE:averagePE,
        futurePE:averagePE,
        peDiscount:peDiscount,
        forecastedDividends:0,
    }

    let annualReturn={
        price:0,
        div:0,
        total:0
    }

    let financials={
        latestEps,
        epsGrowthRate,
        freeCashFlow,
        futureEpsGrowthRate:epsGrowthRate,
        lastFullFinancialYear,
        firstFullFinancialYear,
        shareCount,
        dcfDiscountRate:0.1,
        perpetuityGrowth:0.03,
        startingFreeCashFlow:averageFreeCashFlow
    }

    ticker.analytics={
        price,
        annualReturn,
        financials,
        yearlyData
    }

}

function handleSetMovingAverages(ticker){
    const { priceData } = ticker

    priceData.forEach((item,index) =>{
        let total12=0
        let total26=0
        let total50=0
        let total200=0
        let high14Days=-Infinity
        let low14Days=Infinity

        for(let i=index;i<index+2;i++){
            if(!priceData[i]){
                total12=null
                break
            }
            total12+=priceData[i].close
        }

        for(let i=index;i<index+3;i++){
            if(!priceData[i]){
                break
            }
            if(high14Days<priceData[i].high){
                high14Days = priceData[i].high
            } 
            if(low14Days>priceData[i].low){
                low14Days = priceData[i].low
            }   
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
        
        item.oscillator =-100+ (((item.close - low14Days)/(high14Days-low14Days)) * 100)*2
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

function calculateFilterByDate(ticker,key,options={}){
    let { time } = options
    if(!time){
        time = {}
        time.timeStart = new Date(2000)
    }
    if(!ticker[key]) return[]
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
    if(key==='dividends'){
        data=ticker.incomeStatement
    }

    if(data.length>1){
        if(new Date(data[0].date)<new Date(data[1].date)){
            data = data.reverse()
        }
    }
    return data

}

function handleUpdatePriceChart(ticker,options,chart){
    const { datasets, labels, MACDData, oscillatorData } = calculatePriceChart(ticker,options)
    ticker.priceChart.data = { datasets, labels }
    ticker.priceChart.options = priceChartOptions(ticker,options,chart) 
    ticker.priceChart.MACDData= { datasets:MACDData, labels }
    ticker.priceChart.MACDDataOptions = MACDDataOptions()
    ticker.priceChart.oscillatorData = { datasets:oscillatorData, labels}
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

function handleUpdateForecastChart(ticker){
    let {forecastChart, financialChart, freeCashFlowChart, dcfTable} = calculateForecastChartComponents(ticker)
    ticker.forecastSection={
        forecastChart,
        financialChart,
        freeCashFlowChart,
        forecastOptions: calculateForecastChartOptions(forecastChart),
        financialOptions: calculateForecastFinancialsOptions(financialChart),
        freeCashFlowOptions: calculateForecastFinancialsOptions(financialChart),
        dcfTable
    }
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
