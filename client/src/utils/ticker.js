import { formatValue, getNumberOfWeek, roundToTwoDecimal, camelCaseToString } from "./utils";
import { 
    calculatePriceChart, 
    calculateEventChart, 
    calculateRatioFinacialChart, 
    calculateFinancialChart, 
    calculateForecastChartComponents, 
    calculateRatioCharts 
} from "./chart";
import { 
    priceChartOptions, 
    MACDDataOptions, 
    eventChartOptions, 
    financialChartOptions, 
    calculateForecastChartOptions, 
    calculateForecastFinancialsOptions 
} from "./chartOptions";
import { handleGetClosestPriceFromDate } from "./tickerData";
import { tickerInit, calculateFilterByDate, handleGetPriceRatio, handleGetYearlyFinancialRatio, addMovingAverages, addAnalytics, addValueStatements, getTrailing12MonthsFinancials, getRollingFinancialNum, addPriceRatios, addForecastInputs } from "./calculations/tickerCalculations";

export function Ticker(data,quarterData,portfolioTicker){
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
    this.quarterData = quarterData?quarterData.quarterData:[]
    this.analytics = {
        forecastOutputs:{
            priceReturn:0,
            divReturn:0,
            totalReturn:0,
            endingPrice:0,
            forecastedDividends:0
        },
        forecastInputs:{},
        yearlyData:{},
        financialInputs:{}
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
        priceChart:{},
        ratioChart:{},
        financialChart:{}
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
        epsChart:{},
        epsOptions:{
            responsive:true,
            maintainAspectRatio: false
        },
        evChart:{},
        evOptions:{
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
    this.getPriceRatio = (ratioName,options) => handleGetPriceRatio(this,ratioName,options)
    this.getYearlyFinancialRatio = (ratioName,options) => handleGetYearlyFinancialRatio(this,ratioName,options)

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
    this.trailing12MonthsFinancials = (date) => getTrailing12MonthsFinancials(this,date)
    this.rollingFinancialNum = (financialName,date) => getRollingFinancialNum(this,financialName,date) 

    this.init = () => handleInit(this)
}

function handleInit(ticker){
    addValueStatements(ticker)  
    addMovingAverages(ticker)
    addPriceRatios(ticker)
    addAnalytics(ticker)   
    addForecastInputs(ticker)   
    return ticker
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
    let ratioCharts = calculateRatioCharts(ticker,options)
    ticker.ratiosChart = ratioCharts
    return ticker
}

function handleUpdateFinancialChart(ticker,options){
    let selectedStatement = options.selected
    let fullFinancialData = ticker.getTickerData(selectedStatement)
    let financialChartData = calculateFinancialChart(ticker,options)
    ticker.financialChart.data = financialChartData
    ticker.financialChart.options = financialChartOptions(options)
    ticker.financialChart.fullFinancialData = fullFinancialData.length>0?fullFinancialData:null
    return ticker
}

function handleUpdateForecastChart(ticker){

    let {forecastChart, financialCharts,  dcfTable} = calculateForecastChartComponents(ticker)
    const { financialChart, epsChart, freeCashFlowChart,evChart } = financialCharts

    ticker.forecastSection={
        ...ticker.forecastSection,
        forecastChart,
        financialChart,
        evChart,
        epsChart,
        freeCashFlowChart,
        forecastOptions: calculateForecastChartOptions(forecastChart,ticker),
        financialOptions: calculateForecastFinancialsOptions(financialChart),
        epsOptions:calculateForecastFinancialsOptions(financialChart),
        freeCashFlowOptions: calculateForecastFinancialsOptions(financialChart),
        evOptions: calculateForecastFinancialsOptions(financialChart),
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
