import { TickerSlim } from "./tickerSlim";

export function TickerList(tickers){
    this.tickers = tickers?tickers.map(ticker => new TickerSlim(ticker)):[]  
    this.updateMessages = []
    this.getTickerRatios = (ticker) => handleGetTickerRatios(this,ticker)
    this.getLatestPrice = (ticker) => handleGetLatestPrice(this,ticker)
    this.sortBy = (sortOrder) => handleSortBy(this,sortOrder)
    this.getTickerSlim = (ticker) => handleGetTickerSlim(this,ticker) 
}

function handleGetTickerRatios(tickerList,ticker){
    let tickerFound = tickerList.tickers.find(item => item.ticker === ticker)
    if(tickerFound){
        return tickerFound.ratios
    }else{
        return {}
    }
}

function handleGetLatestPrice(tickerList,ticker){
    let tickerFound = tickerList.tickers.find(item => item.ticker === ticker)
    if(!tickerFound){
        return null
    }
    if(tickerFound.latestPrice){
        return tickerFound.latestPrice.close
    }else{
        return null
    }
}

function handleSortBy(tickerList,sortOrder){

    function compareLatestPrice(a,b){
        return new Date(b.latestPrice.date).getTime() -new Date(a.latestPrice.date).getTime()
    }

    if(sortOrder){
        switch(sortOrder){
            case 'ticker':
            case 'sector':
                return tickerList.tickers.sort((a,b) => a[sortOrder].localeCompare(b[sortOrder]))
            case 'latestPrice':            
            case 'ratios':      
                return tickerList.tickers.sort((a,b) =>compareLatestPrice(a,b))
            default:return tickerList.tickers
        }
    }else{
        return tickerList.tickers
    }
}

function handleGetTickerSlim(tickerList,ticker){
    return tickerList.tickers.find(item => item.ticker===ticker)
}
