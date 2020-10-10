import { formatValue, totalByKey } from "./utils";
import { Ticker } from "./ticker";

export function Portfolio(portfolioData){
    this.name = portfolioData.portfolio.name
    this.userTickers = portfolioData.portfolio.tickers
    this._id = portfolioData.portfolio._id
    this.portfolio = portfolioData.portfolio
    this.tickerData = portfolioData.tickerData
    this.purchasePrice = (format) => calculatePurchasePrice(this,format);
    this.currentValue = (format) => calculateCurrentValue(this,format)
    this.priceChange = (format) => calculatePriceChange(this,format)
    this.priceChangePercentage = (format) => calculatePriceChangePercentage(this,format)
    this.portofolioUserDividends = (options) => calculatePortfolioUserDividends(this,options)
    this.portfolioStats = () => calculatePortfolioStats(this)
    this.priceChart = (options) => calculateChart(this,options)
    this.returnChart = (options) => calculateReturnChart(this,options)
    this.dividendComponents = (options) => calculateDividendComponents(this,options)
    this.statComponents = () => calculateStatComponents(this)
}

export function calculatePurchasePrice(portfolio,format){
    const { userTickers } = portfolio
    let tickerTotals = userTickers.map(ticker => calculateTickerTotal(ticker))
    let value = tickerTotals.reduce((a,c) => a+c,0)
    return formatValue(value,format)
}

export function calculateCurrentValue(portfolio,format){
    const { userTickers } =portfolio
    let tickerTotals = userTickers.map(ticker => calculateTickerCurrent(ticker,portfolio))
    let value = tickerTotals.reduce((a,c) => a+c,0)
    return formatValue(value,format)
}

export function calculatePriceChange(portfolio,format){

    let value = calculateCurrentValue(portfolio)-calculatePurchasePrice(portfolio)
    return formatValue(value,format)
}

export function calculatePriceChangePercentage(portfolio,format){
    let value = ((calculateCurrentValue(portfolio)-calculatePurchasePrice(portfolio))/calculatePurchasePrice(portfolio))*100
    return formatValue(value,format)
}

function calculatePortfolioUserDividends(portfolio,options){
    const { userTickers, tickerData } = portfolio
    let userDividends=[]
    userTickers.forEach(userTicker =>{
        let currentTickerData = tickerData.find(item => item.profile.ticker===userTicker.ticker)
        let ticker = new Ticker(userTicker,currentTickerData)
        let myDivs = ticker.getMyDivs(options)
        userDividends.push(...myDivs)
    })
    userDividends = userDividends.sort((a,b) => a.date.getTime()-b.date.getTime())

    return userDividends
}

function calculatePortfolioStats(portfolio){
    const { userTickers, tickerData } = portfolio

    let tickers = []
    userTickers.forEach(portfolioTicker => {
        let data = searchTickerData(portfolioTicker.ticker,tickerData)
        let ticker = new Ticker(portfolioTicker,data)
        tickers.push({
            ticker:ticker.ticker,
            name:ticker.name,
            shareCount:ticker.totalCount(),
            currentValue: ticker.currentPrice(),
            marketCap:ticker.marketCap(),
            percentageChange:ticker.priceChangePercentage(),
            sector:ticker.tickerData.profile.sector,
            industry:ticker.tickerData.profile.industry,
            subIndustry:ticker.tickerData.profile.subIndustry,
            employees:Number(ticker.tickerData.profile.employees)
        })
    })

    return tickers
}

export function calculateChart(portfolio,options){
    // return calculateReturnChart(tickerData,portfolio,options)
    return calculatePriceChart(portfolio,options)
    // if(options.type==='price'){
    //     return calculatePriceChart(tickerData,portfolio,options)
    // }else if(options.type==='return'){
    //     return calculateReturnChart(tickerData,portfolio,options)        
    // }else{
    //     return { }
    // }
    
}

function calculatePriceChart(portfolio,options){
    const { tickerData,userTickers } = portfolio
    let tickers = userTickers.map(item => item)
    let dates={}
    tickers.forEach(item =>{
        let currentTickerData = tickerData.find(data => data.profile.ticker === item.ticker)
        let ticker = new Ticker(item,currentTickerData)
        let data = ticker.userPriceChart(options)
        data.forEach(item =>{
            let key=item.key
            if(dates[key]){
                dates[key].price+=item.value
                dates[key].dividend+=item.dividend
            }else{
                dates[key]={
                   price:item.value,
                   dividend:item.dividend
                }
            }             
        })
    })  

    let array=[]
    for(let key in dates){
        array.push({
            date:key,
            value:dates[key].price,
            dividend:dates[key].dividend
        })
    }

    array.shift()
    let data = []
    let labels = []
    let dividends = []

    array.forEach(item =>{
        data.unshift(item.value)
        dividends.unshift(item.dividend)
        labels.unshift(item.date.slice(0, -1))
    })

    let total=0;
    let cumulativeDividends = dividends.map((item,index) => (total+=item))
    total=0;
    let cumulativeDividendsPrice = dividends.map((item,index) => ((total+=item)+data[index]))
    let percentageChangeWithDivs = cumulativeDividendsPrice.map(item => Number((((item-data[0])/data[0])*100).toFixed(2)))
    let percentageChange = data.map(item => Number((((item-data[0])/data[0])*100).toFixed(2)))

    return { 
        data, 
        labels,
        cumulativeDividends,
        cumulativeDividendsPrice, 
        percentageChange,
        percentageChangeWithDivs,
    }
}

export function calculateReturnChart(tickerData,portfolio,options){

    let tickers = portfolio.tickers.map(item => item)
    let dates={}
    tickers.forEach(item =>{
        let currentTickerData = tickerData.find(data => data.profile.ticker === item.ticker)
        let ticker = new Ticker(item,currentTickerData)
        let data = ticker.userReturnChart(options)
        data.forEach(item =>{
            let key=item.key
            if(dates[key]){
                dates[key].price+=item.value
                dates[key].dividend+=item.dividend
            }else{
                dates[key]={
                   price:item.value,
                   dividend:item.dividend
                }
            }             
        })
    })

    let array=[]
    for(let key in dates){
        array.push({
            date:key,
            value:dates[key].price,
            dividend:dates[key].dividend
        })
    }
    let offset=array[array.length-1].value
    array.shift()
    
    let data = []
    let labels = []
    let dividends = []
    let dataoff = []
    array.forEach(item =>{
        data.unshift(item.value-offset)
        dataoff.unshift(item.value)
        dividends.unshift(item.dividend)
        labels.unshift(item.date.slice(0, -1))
    })

    let total=0;
    let cumulativeDividends = dividends.map((item,index) => (total+=item))
    total=0;
    let cumulativeDividendsPrice = dividends.map((item,index) => ((total+=item)+data[index]))
    let cumulativeDividendsPriceOff = dividends.map((item,index) => ((total+=item)+dataoff[index]))
    let percentageChangeWithDivs = cumulativeDividendsPriceOff.map(item => Number((((item-dataoff[0])/dataoff[0])*100).toFixed(2)))
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

function calculateDividendComponents(portfolio){

    const userDividends = portfolio.portofolioUserDividends()
    let data=[]    
    let count=0      
    
    if(userDividends.length===0){
        return { data, userDividends }
    }

    let min = userDividends[0].date.getFullYear()
    let max = userDividends[userDividends.length-1].date.getFullYear()
    
    for(var i=min;i<=max;i++){
        for(var a=1;a<=12;a++){
            let divFound=true
            let divs=[];
           
            while(divFound){
                if(count===userDividends.length) break            
                if(userDividends[count].year===i&&userDividends[count].month===a){

                    divs.push(userDividends[count])
                    count++
                }else{
                    divFound=false
                }
            }
            data.push({
                date:new Date(i,a),
                divAmount:divs.reduce((a,c)=>a+(c.payment),0),
                dividends:divs,
                label:i+'/'+a,
            })

            if(count===userDividends.length) break
        }
    }

    return { data,userDividends }
}

function calculateStatComponents(portfolio){
    let stats = portfolio.portfolioStats()
    
    let sectors = totalByKey(stats,'sector','currentValue')
    let industries = totalByKey(stats,'industry','currentValue','sector')
    let subIndustries = totalByKey(stats,'subIndustry','currentValue','industry')
    let tickers = totalByKey(stats,'ticker','currentValue','industry')

    return {
        sectors,
        industries,
        subIndustries,
        tickers
    }
}

function searchTickerData(ticker,tickerData){
    return tickerData.find(item => item.profile.ticker===ticker)
}




function calculateTickerCurrent(ticker,portfolio){
    const { tickerData } = portfolio
    let price = tickerData.find(item => item.profile.ticker===ticker.ticker).priceData[0].close
    return ticker.transactions.reduce((a,c)=> a+(c.count*price),0)
}  

function calculateTickerTotal(ticker){
    return ticker.transactions.reduce((a,c)=> a+(c.count*c.price),0)
}



export {
    calculateTickerTotal,
}

