import { formatValue } from "./utils";
import { Ticker } from "./ticker";

export function Portfolio(tickerData,portfolio){
    this.name = portfolio.name
    this.userTickers = portfolio.tickers
    this._id = portfolio._id
    this.portfolio = portfolio
    this.tickerData = tickerData
    this.purchasePrice = (format) => calculatePurchasePrice(portfolio,format);
    this.currentValue = (format) => calculateCurrentValue(portfolio,tickerData,format)
    this.priceChange = (format) => calculatePriceChange(portfolio,tickerData,format)
    this.priceChangePercentage = (format) => calculatePriceChangePercentage(portfolio,tickerData,format)
    this.portofolioUserDividends = (options) => calculatePortfolioUserDividends(this,options)
    this.priceChart = (options) => calculateChart(tickerData,portfolio,options)
    this.returnChart = (options) => calculateReturnChart(tickerData,portfolio,options)
    this.dividendComponents = (options) => calculateDividendComponents(this,options)
}

export function calculatePurchasePrice(portfolio,format){
    let tickerTotals = portfolio.tickers.map(ticker => calculateTickerTotal(ticker))
    let value = tickerTotals.reduce((a,c) => a+c,0)
    return formatValue(value,format)
}

export function calculateCurrentValue(portfolio,tickerData,format){
    let tickerTotals = portfolio.tickers.map(ticker => calculateTickerCurrent(ticker,tickerData))
    let value = tickerTotals.reduce((a,c) => a+c,0)
    return formatValue(value,format)
}

export function calculatePriceChange(portfolio,tickerData,format){
    let value = calculateCurrentValue(portfolio,tickerData)-calculatePurchasePrice(portfolio)
    return formatValue(value,format)
}

export function calculatePriceChangePercentage(portfolio,tickerData,format){
    let value = ((calculateCurrentValue(portfolio,tickerData)-calculatePurchasePrice(portfolio))/calculatePurchasePrice(portfolio))*100
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

export function calculateChart(tickerData,portfolio,options){
    // return calculateReturnChart(tickerData,portfolio,options)
    return calculatePriceChart(tickerData,portfolio,options)
    // if(options.type==='price'){
    //     return calculatePriceChart(tickerData,portfolio,options)
    // }else if(options.type==='return'){
    //     return calculateReturnChart(tickerData,portfolio,options)        
    // }else{
    //     return { }
    // }
    
}

function calculatePriceChart(tickerData,portfolio,options){

    let tickers = portfolio.tickers.map(item => item)
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
    let min = userDividends[0].date.getFullYear()
    let max = userDividends[userDividends.length-1].date.getFullYear()

    let data=[]    
    let count=0  

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









function calculateTickerCurrent(ticker,tickerData){

    let price = tickerData.find(item => item.profile.ticker===ticker.ticker).priceData[0].close
    return ticker.transactions.reduce((a,c)=> a+(c.count*price),0)
}  

function calculateTickerTotal(ticker){
    return ticker.transactions.reduce((a,c)=> a+(c.count*c.price),0)
}



export {
    calculateTickerTotal,
}

