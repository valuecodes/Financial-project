import { roundToTwoDecimal } from "./utils";

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
    this.getRatio = (ratio) => calculateGetRatio(this,ratio)
    this.yearDivs = () => calculateYearDivs(this)
    this.tickerRatios = () => calculateTickerRatios(this)
}

function calculateGetRatio(tickerData,ratio){
    const { priceData, incomeStatement, balanceSheet, dividendData } = tickerData
    let value = null
    switch(ratio){
        case 'pe':
            if(priceData[0]&&incomeStatement[0]){
                value=priceData[0].close/incomeStatement[0].eps
            }
            break
        case 'pb':
            if(priceData[0]&&balanceSheet[0]){
                value=priceData[0].close/balanceSheet[0].tangibleBookValuePerShare
            }
            break
        case 'divYield':
            if(priceData[0]&&dividendData[0]){
                let yearDivs = tickerData.yearDivs().reduce((a,c) => a+c.dividend,0)
                value=yearDivs/priceData[0].close*100
            }
            break
        case 'payoutRatio':
            if(priceData[0]&&dividendData[0]){
                let yearDivs = tickerData.yearDivs().reduce((a,c) => a+c.dividend,0)
                value=yearDivs/incomeStatement[0].eps*100
            }
            break
        case 'marketCap':
            if(priceData[0]&&incomeStatement[0]){
                value=priceData[0].close*incomeStatement[0].sharesOutstanding
            }
            break
        case 'currentRatio':
            if(balanceSheet[0]){
                value = balanceSheet[0].currentAssets/balanceSheet[0].currentLiabilities
            }
            break
        case 'operatingMargin':
            if(incomeStatement[0]){
                value = incomeStatement[0].operatingIncome/incomeStatement[0].revenue*100
            }
            break
        case 'profitMargin':
            if(incomeStatement[0]){
                value = incomeStatement[0].netIncome/incomeStatement[0].revenue*100
            }
            break
        case 'profitGrowth5Years':
            if(incomeStatement[0]){
                let length = incomeStatement.length;
                if(length<5){
                   value = (((incomeStatement[0].netIncome/incomeStatement[length-1].netIncome)**(1/length))-1)*100
                }else{
                    value = (((incomeStatement[0].netIncome/incomeStatement[4].netIncome)**(1/5))-1)*100
                } 
            }
            break
        case 'revenueGrowth5Years':
            if(incomeStatement[0]){
                let length = incomeStatement.length;
                if(length<5){
                value = (((incomeStatement[0].revenue/incomeStatement[length-1].revenue)**(1/length))-1)*100
                }else{
                    value = (((incomeStatement[0].revenue/incomeStatement[4].revenue)**(1/5))-1)*100
                } 
            }
            break
        case 'peg':
            if(priceData[0]&&incomeStatement[0]){
                value = tickerData.getRatio('pe')/tickerData.getRatio('profitGrowth5Years')
            }
            break
        case 'roe':
            if(balanceSheet[0]&&incomeStatement[0]){
                value = (incomeStatement[0].netIncome/balanceSheet[0].totalEquity)*100
            }
            break
        case 'roa':
            if(balanceSheet[0]&&incomeStatement[0]){
                value = (incomeStatement[0].netIncome/(balanceSheet[0].totalAssets))*100
            }
            break
        default:return null
    }
    if(isNaN(value)||value===Infinity||value===-Infinity) value=null
    if(value) value = roundToTwoDecimal(value)
    return value
}

function calculateYearDivs(tickerData){
    const { dividendData } = tickerData
    if(dividendData[0]){
        let min = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        let max = new Date()
        return dividendData.filter(item => new Date(item.date)>min&&new Date(item.date)<max)
    }else{
        return []
    }
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