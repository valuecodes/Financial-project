import { roundToTwoDecimal, camelCaseToString } from "../utils";
import { handleGetClosestPriceFromDate } from "../tickerData";

export function tickerInit(ticker){
    addMovingAverages(ticker)
    addFinancialRatios(ticker)
    addAnalytics(ticker)
    return ticker
}

function addFinancialRatios(ticker){
    let priceData = ticker.priceData
    let currentYear = new Date().getFullYear()
    let numberOfDivs = null
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
            if(numberOfDivs!==null&&yearDivs.length<numberOfDivs&&yearDivs[0]){
                yearDivs.push(yearDivs[0])
            }
            numberOfDivs = yearDivs.length     
        }
        let totalDiv = yearDivs.reduce((a,b)=>a+b.dividend,0)
        price.divYield = (totalDiv/price.close)*100
        price.dateShort = price.date.substring(0, 7)
    }

    return ticker
}

function addAnalytics(ticker){

    let dividendData = ticker.dividendData
        .reverse() 
    let divData = [...dividendData]

    let peData = ticker.getPriceRatio('pe').ratioArray
    
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
            roe: yearData.netIncome/balanceData.totalEquity,
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

function addMovingAverages(ticker){
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

export function calculateFilterByDate(ticker,key,options={}){
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

export function handleGetYearlyFinancialRatio(ticker,ratioName='',options){
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

export function handleGetPriceRatio(ticker,ratioName='',options){
    const priceData = ticker.filterByDate('priceData',options)
    let priceRatio = priceData.filter(item => item[ratioName]).reverse()
    let ratioArray = priceRatio.map(item => item[ratioName])
    let dateArray = priceRatio.map(item => item.dateShort)
    let priceArray = priceRatio.map(item => item.close)
    return { ratioArray, dateArray, priceArray, name:camelCaseToString(ratioName) }
}