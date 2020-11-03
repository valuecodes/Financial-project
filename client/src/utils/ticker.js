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

    this.init = () => handleInit(this)
    this.setMovingAverages = () => handleSetMovingAverages(this)
    this.setFinancialRatios = () => handleSetFinancialRatios(this)
    this.calculateAnalytics = () => handleCalculateAnalytics(this)
}

function handleInit(ticker){
    ticker.setMovingAverages()
    ticker.setFinancialRatios()
    ticker.calculateAnalytics()
    return ticker
}

function handleSetFinancialRatios(ticker){
    let priceData = ticker.priceData
    let currentYear = new Date().getFullYear()
    for(var i=0;i<priceData.length;i++){
        let price = priceData[i]
        let income = ticker.incomeStatement.
            find(item => new Date(item.date).getFullYear()<=new Date(price.date).getFullYear())
        let balance = ticker.balanceSheet
            .find(item => new Date(item.date).getFullYear()<=new Date(price.date).getFullYear())
        let cashflow = ticker.cashFlow
            .find(item => new Date(item.date).getFullYear()<=new Date(price.date).getFullYear())
        let shareCount = 0

        if(income){
            price.pe = price.close/income.eps
            shareCount = income.netIncome / income.eps
            let rps = income.revenue/shareCount
            price.ps = price.close/rps
        }

        if(balance){
            price.pb = price.close/balance.bookValuePerShare 
        }
        if(income&&balance){
            shareCount = income.netIncome / income.eps
            let marketCap = shareCount*price.close
            let debt = balance.totalDebt?balance.totalDebt:balance.longTermDebt
            let ev = marketCap+debt-balance.cash
            let ebit = income.operatingIncome
            price.evEbit = ev/ebit
        }
        if(cashflow&&income){
            shareCount = income.netIncome / income.eps            
            let fcfPerShare = (cashflow.operatingCashFlow+cashflow.capEx)/shareCount
            price.pfcf = price.close/ fcfPerShare
        }
        let yearDivs = ticker.dividendData.filter(item => new Date(item.date).getFullYear()===new Date(price.date).getFullYear())
        if(yearDivs.length===0){
            yearDivs = ticker.dividendData.filter(item => new Date(item.date).getFullYear()===new Date(price.date).getFullYear()+1)
        }
        if(currentYear===new Date(price.date).getFullYear()){
            let pastYear = new Date(new Date(price.date).setFullYear(new Date().getFullYear() - 1));
            yearDivs = ticker.dividendData.filter(item => 
                new Date(item.date).getTime()<new Date(price.date).getTime()&&
                new Date(item.date).getTime()>pastYear.getTime()
            )
        }
        let totalDiv = yearDivs.reduce((a,b)=>a+b.dividend,0)
        price.divYield = (totalDiv/price.close)*100
        price.dateShort = price.date.substring(0, 7)
    }

    return ticker
}

function handleCalculateAnalytics(ticker){

    let dividendData = ticker.dividendData
        .reverse() 
    let divData = [...dividendData]

    let peData = ticker.getPriceRatio('pe').ratioArray
    console.log(ticker.getPriceRatio('pe'))
    const { incomeStatement, balanceSheet, cashFlow } = ticker

    let latestEps = incomeStatement[0]
    let firstFullFinancialYear = new Date(incomeStatement[incomeStatement.length-1].date).getFullYear()
    let lastFullFinancialYear = new Date(incomeStatement[0].date).getFullYear()
    let shareCount = 0
    
    if(latestEps){
        lastFullFinancialYear = new Date(latestEps.date).getFullYear()
        shareCount = latestEps.sharesOutstanding
    }

    let yearlyData={}

    for(let i = firstFullFinancialYear;i<=lastFullFinancialYear;i++){

        let year = i
        let yearlyDivs = ticker.dividendData
            .filter(item => new Date(item.date).getFullYear()===year)
            .reduce((a,c) => a+c.dividend,0)

        let yearData = incomeStatement.find(item => new Date(item.date).getFullYear()===year)
        let balanceData = balanceSheet.find(item => new Date(item.date).getFullYear()===year)
        let cashflowData = cashFlow.find(item => new Date(item.date).getFullYear()===year)||{}    

        let price = handleGetClosestPriceFromDate(ticker,new Date(year,11))
        let shareCount = yearData.netIncome / yearData.eps
        let marketCap = shareCount*price
        let cash = balanceData.cash
        let debt = balanceData.totalDebt?balanceData.totalDebt:balanceData.longTermDebt
        let ev = marketCap+balanceData.cash
        let ebit = yearData.operatingIncome
        let evEbit = ev/ebit
        let revenuePerShare = yearData.revenue/shareCount

        yearlyData[year]={
            // div:0,
            ...yearData,
            ...balanceData,
            ...cashflowData,
            div:yearlyDivs,
            payoutRatio: yearlyDivs?yearlyDivs/yearData.eps:null,
            netIncome: yearData.netIncome,
            netProfitMargin: yearData.netIncome/yearData.revenue,
            ebitMargin:ebit/yearData.revenue,
            debtToEbit:debt/ebit,
            currentRatio:balanceData.currentAssets/balanceData.currentLiabilities,
            shareCount,
            marketCap,
            debt,
            cash,
            ev,
            price,
            ebit,
            evEbit,   
            revenuePerShare,               
            freeCashFlow: cashflowData.operatingCashFlow+cashflowData.capEx,freeCashFlowPerShare: (cashflowData.operatingCashFlow+cashflowData.capEx)/shareCount,  
            date:year+'-11'
        }
    }

    let financialInputs= {
        freeCashFlow:{},
        netProfitMargin:{},
        ebitMargin:{},
        eps:{},
        revenue:{},
        netIncome:{},
        grossProfit:{},
        payoutRatio:{},
        div:{},
        debt:{},
        debtToEbit:{},
        ebit:{},
        evEbit:{},
        cash:{}
    }

    Object.keys(yearlyData).forEach((item,index) =>{
        Object.keys(financialInputs).forEach(name =>{
            let value = yearlyData[item][name]
            if(value){
                let nextYear = yearlyData[Number(item)+1]            
                let growth = 0
                if(nextYear){
                    growth = (yearlyData[Number(item)+1][name] / value)-1
                }
                let count = financialInputs[name].count||0
                let total = financialInputs[name].total||0
                let growthTotal = financialInputs[name].growthTotal||0
                count++
                total+=value
                growthTotal+=growth
                let average = total/count
                let averageGrowth = growthTotal/(count-1)
                financialInputs[name]={
                    latest: value,
                    date: yearlyData[item].date,
                    count:count,
                    total:total,
                    average: average,
                    growthTotal:growthTotal,
                    averageGrowth:averageGrowth
                }
            }else{
                financialInputs[name]={
                    latest: 0,
                    date: yearlyData[item].date,
                    average: 0,
                }
            }
        })
    })

    let latestPE = peData[peData.length-1]
    let averagePE = peData.reduce((a,c)=> a+c,0)/peData.length
    let peDiscount = averagePE/latestPE    
    let startingPrice = roundToTwoDecimal(ticker.priceData[0].close)

    financialInputs={
        ...financialInputs,
        price:{
            latest:startingPrice
        },
        pe:{
            latest:latestPE,
            average:averagePE,
            discount:peDiscount
        },        
        lastFullFinancialYear,
        firstFullFinancialYear,
        startingFinancialYear:lastFullFinancialYear,
    }
    
    let averageGrowth = 
        (financialInputs.eps.averageGrowth+
        financialInputs.revenue.averageGrowth+
        financialInputs.netIncome.averageGrowth)/3
    
    if(averageGrowth>0.3) averageGrowth=0.3

    let forecastInputs={
        startingPrice:startingPrice,
        endingPE:averagePE,
        futureGrowthRate:averageGrowth,
        endingProfitability:financialInputs.netProfitMargin.average,
        endingPayoutRatio:financialInputs.payoutRatio.latest,
        shareCount,
        dcfDiscountRate:0.1,
        perpetuityGrowth:0.03,
        startingFreeCashFlow:financialInputs.freeCashFlow.average,
        forecastStartingDate:new Date().toISOString().split('T')[0]
    }

    ticker.analytics={
        ...ticker.analytics,
        financialInputs,
        forecastInputs,
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

function handleGetYearlyFinancialRatio(ticker,ratioName='',options){
    const { yearlyData } = ticker.analytics
    let timeStart = options?options.time.timeStart:2000
    let years = Object.keys(yearlyData).filter(year => new Date(year)>timeStart)
    let dateArray=[]
    let ratioArray=[]
    let priceArray=[]
    years.forEach(year=>{
        dateArray.push(year)
        ratioArray.push(yearlyData[year][ratioName])
        priceArray.push(yearlyData[year].price)
    })
    return { ratioArray, dateArray, priceArray , name:camelCaseToString(ratioName) }
}

function handleGetPriceRatio(ticker,ratioName='',options){
    const priceData = ticker.filterByDate('priceData',options)
    let priceRatio = priceData.filter(item => item[ratioName]).reverse()
    let ratioArray = priceRatio.map(item => item[ratioName])
    let dateArray = priceRatio.map(item => item.dateShort)
    let priceArray = priceRatio.map(item => item.close)
    return { ratioArray, dateArray, priceArray, name:camelCaseToString(ratioName) }
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
