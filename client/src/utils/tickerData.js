import { roundToTwoDecimal, roundFinancialNumber, getYear } from "./utils";
import { func } from "prop-types";
import { tickerDataModel } from "./dataModels";

export function TickerData(data){
    this.profile = data.profile?data.profile:{
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
    this.incomeStatement = data.incomeStatement?data.incomeStatement:[]
    this.balanceSheet = data.balanceSheet?data.balanceSheet:[]
    this.cashFlow = data.cashFlow?data.cashFlow:[]
    this.insiderTrading = data.insiderTrading?data.insiderTrading:[]
    this.dividendData = data.dividendData?data.dividendData:[]
    this.priceData = data.priceData?data.priceData:[]
    this.ratios = data.ratios?data.ratios:{
        pe:null,
        pb:null,
        divYield:null,
        payoutRatio:null,
        marketCap:null,
        currentRatio:null,
        operatingMargin:null,
        profitMargin:null,
        profitGrowth5Years:null,
        revenueGrowth5Years:null,
        peg:null,
        roe:null,
        roa:null,
    }
    this._id=data._id?data._id:null
    this.valueStatements = null
    this.getValueStatements = () => calculateValueStatements(this)
    this.getRatio = (ratio) => calculateGetRatio(this,ratio)
    this.yearDivs = () => calculateYearDivs(this)
    this.financialKeysStatements = () => calculateFinancialKeysStatements(this)
    this.getFinancialNum = (key,year) => calculateGetFinancialNum(this,key,year)
    this.tickerRatios = () => calculateTickerRatios(this)
    this.update = () => calculateUpdate(this)
    this.updateFinancialValue = (value) => calculateUpdateFinancialValue(this,value)
}

function calculateGetRatio(tickerData,ratio){
    
    const { incomeStatement } = tickerData
    
    let stockPrice = tickerData.getFinancialNum('close')
    let yearDivs = tickerData.yearDivs()
    let eps =  tickerData.getFinancialNum('eps')
    let operatingIncome = tickerData.getFinancialNum('operatingIncome')
    let revenue = tickerData.getFinancialNum('revenue')
    let netIncome = tickerData.getFinancialNum('netIncome')
    let sharesOutstanding = tickerData.getFinancialNum('sharesOutstanding')
    let currentAssets = tickerData.getFinancialNum('currentAssets')
    let currentLiabilities = tickerData.getFinancialNum('currentLiabilities')
    let bookValuePerShare =  tickerData.getFinancialNum('bookValuePerShare')
    let totalEquity = tickerData.getFinancialNum('totalEquity')
    let totalAssets = tickerData.getFinancialNum('totalAssets')

    let value = null

    switch(ratio){
        case 'pe':
                value = stockPrice/eps
            break
        case 'pb':
                value = stockPrice/bookValuePerShare
            break
        case 'divYield':
                value = (yearDivs/stockPrice)*100
            break
        case 'payoutRatio':
                value = (yearDivs/eps)*100
            break
        case 'marketCap':
                value = stockPrice*sharesOutstanding
            break
        case 'currentRatio':
                value = currentAssets/currentLiabilities
            break
        case 'operatingMargin':
                value = (operatingIncome/revenue)*100
            break
        case 'profitMargin':
                value = (netIncome/revenue)*100
            break
        case 'profitGrowth5Years':
            if(incomeStatement[0]){
                let length = incomeStatement.length;
                if(length<5){
                    let startingNetIncome = incomeStatement[length-1].netIncome
                    value = (((netIncome/startingNetIncome)**(1/length))-1)*100
                }else{
                    let startingNetIncome = incomeStatement[4].netIncome                   
                    value = (((netIncome/startingNetIncome)**(1/5))-1)*100
                } 
            }
            break
        case 'revenueGrowth5Years':
            if(incomeStatement[0]){
                let length = incomeStatement.length;
                if(length<5){
                    let startingRevenue = incomeStatement[length-1].revenue
                    value = (((revenue/startingRevenue)**(1/length))-1)*100
                }else{
                    let startingRevenue = incomeStatement[4].revenue                  
                    value = (((revenue/startingRevenue)**(1/5))-1)*100
                } 
            }
            break
        case 'peg':
                let pe = tickerData.getRatio('pe')
                let growthRate = tickerData.getRatio('profitGrowth5Years')
                value = pe / growthRate
            break
        case 'roe':
                value = (netIncome/totalEquity)*100
            break
        case 'roa':
                value = (netIncome/totalAssets)*100
            break
        default:return null
    }
    return roundFinancialNumber(value)
}

function calculateYearDivs(tickerData){
    const { dividendData } = tickerData
    if(dividendData[0]){
        let min = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        let max = new Date()
        let divs = dividendData.filter(item => new Date(item.date)>min&&new Date(item.date)<max)
        return divs.reduce((a,c) => a+c.dividend,0)
    }else{
        return null
    }
}

function calculateValueStatements(tickerData){
    let keys = {}
    Object.keys(tickerDataModel).forEach(statement =>{
        Object.keys(tickerDataModel[statement]).forEach(value =>{
            keys[value] = statement
        })
    })
    tickerData.valueStatements = keys
}

function calculateFinancialKeysStatements(tickerData){
    let keys={}
    if(tickerData.priceData){
        Object.keys(tickerData.incomeStatement[0]).forEach(item => keys[item]='incomeStatement' )
    }
    if(tickerData.incomeStatement[0]){
        Object.keys(tickerData.incomeStatement[0]).forEach(item => keys[item]='incomeStatement' )
    }
    if(tickerData.balanceSheet[0]){
        Object.keys(tickerData.balanceSheet[0]).forEach(item => keys[item]='balanceSheet' )
    }
    if(tickerData.cashFlow[0]){
        Object.keys(tickerData.cashFlow[0]).forEach(item => keys[item]='cashFlow')
    }
    return keys
}

function calculateGetFinancialNum(tickerData,key,year=null){
    
    if(tickerData.valueStatements===null){
        tickerData.getValueStatements()
    }
    let keyStatements = tickerData.valueStatements
    let statement = keyStatements[key]

    if(statement){
        year = null
        let statementYear
        if(year){
            statementYear = tickerData[statement].find(item => item.date.split('-')[0]===year)            
        }else{
            statementYear = tickerData[statement].sort((a,b)=>new Date(b.date)-new Date(a.date))[0]
        }
        if(statementYear){
            return statementYear[key]  
        }
    }
    return null
}

function calculateTickerRatios(tickerData){
    return{
        pe: tickerData.getRatio('pe'),
        pb: tickerData.getRatio('pb'),
        divYield: tickerData.getRatio('divYield'),
        payoutRatio: tickerData.getRatio('payoutRatio'),
        marketCap: tickerData.getRatio('marketCap'),
        currentRatio: tickerData.getRatio('currentRatio'),
        profitMargin: tickerData.getRatio('profitMargin'),
        operatingMargin: tickerData.getRatio('operatingMargin'),
        profitGrowth5Years: tickerData.getRatio('profitGrowth5Years'),
        revenueGrowth5Years: tickerData.getRatio('revenueGrowth5Years'),
        peg: tickerData.getRatio('peg'),
        roe: tickerData.getRatio('roe'),
        roa: tickerData.getRatio('roa'),
    }
}

function calculateUpdate(tickerData){
    if(tickerData.balanceSheet[0]){
        if(!tickerData.balanceSheet[0].bookValuePerShare){
            tickerData.updateFinancialValue('bookValue')
        }
    }
    tickerData.ratios = tickerData.tickerRatios()
}

function calculateUpdateFinancialValue(tickerData,value){
    switch(value){
        case 'bookValue':
            tickerData.balanceSheet.forEach(item => {
                console.log(item)
                let year = getYear(item.date)
                let sharesOutstanding = tickerData.getFinancialNum('sharesOutstanding',year)
                let bookValuePerShare = item.totalEquity / sharesOutstanding
                item.bookValuePerShare = roundFinancialNumber(bookValuePerShare)
            });
            break
        default:
    }
}
