import { TickerData } from "./tickerData";
import PortfolioTicker from "./portfolioTicker";

export function UserTicker(tickerData, portfolioTicker){
    this.profile = tickerData.profile?tickerData.profile:{
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
    this.incomeStatement = tickerData.incomeStatement?tickerData.incomeStatement:[]
    this.balanceSheet = tickerData.balanceSheet?tickerData.balanceSheet:[]
    this.cashFlow = tickerData.cashFlow?tickerData.cashFlow:[]
    this.insiderTrading = tickerData.insiderTrading?tickerData.insiderTrading:[]
    this.dividendData = tickerData.dividendData?tickerData.dividendData:[]
    this.priceData = tickerData.priceData?tickerData.priceData:[]
    this.ratios = tickerData.ratios?tickerData.ratios:{
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
    this.userTransactions = portfolioTicker?portfolioTicker.transactions:[]

    this.getCurrentPrice = () => handleGetCurrentPrice(this)
    this.getPurchasePrice = () => handleGetPurchasePrice(this)
}


function handleGetCurrentPrice(ticker){
    const { priceData, userTransactions } = ticker
    console.log(!priceData[0])
    if(!priceData[0]) return null
    let price = priceData[0].close
    
    return userTransactions.reduce((a,c)=> a+(c.count*price),0)
}  

function handleGetPurchasePrice(ticker){
    const { userTransactions } = ticker
    return userTransactions.reduce((a,c)=> a+(c.count*c.price),0)
}