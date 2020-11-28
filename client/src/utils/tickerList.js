import { TickerSlim } from "./tickerSlim";
import { getApiSymbol } from "./calculations/inputCalculations";
import axios from 'axios'

export function TickerList(tickers){
    this.tickers = tickers?tickers.map(ticker => new TickerSlim(ticker)):[]  
    this.sortOrder = 'ticker'
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

    let ascending = true

    if(sortOrder===tickerList.sortOrder){
        ascending = false
    }

    tickerList.sortOrder = sortOrder
    
    function compareLatestPrice(a,b){
        return new Date(b.latestPrice.date).getTime() -new Date(a.latestPrice.date).getTime()
    }
    if(sortOrder){
        switch(sortOrder){
            case 'ticker':
            case 'sector':
                return tickerList.tickers.sort((a,b) =>
                    ascending?
                    a[sortOrder].localeCompare(b[sortOrder]):
                    b[sortOrder].localeCompare(a[sortOrder])
                )
            case 'latestPrice':            
            case 'ratios':      
                return tickerList.tickers.sort((a,b) =>
                    ascending?
                    compareLatestPrice(a,b):
                    compareLatestPrice(b,a)
                )
            default:return tickerList.tickers
        }
    }else{
        return tickerList.tickers
    }
}

function handleGetTickerSlim(tickerList,ticker){
    return tickerList.tickers.find(item => item.ticker===ticker)
}
