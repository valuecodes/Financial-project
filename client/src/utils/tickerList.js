import { TickerData } from "./tickerData";
import { getApiSymbol, calculateLatestPrice } from "./calculations/inputCalculations";
import { TickerSlim } from "./tickerSlim";

export function TickerList(tickers){
    this.tickers = tickers?tickers.map(ticker => new TickerSlim(ticker)):[]  
    this.updateMessages = []
    this.getTickerRatios = (ticker) => handleGetTickerRatios(this,ticker)
    this.getLatestPrice = (ticker) => handleGetLatestPrice(this,ticker)
    this.sortBy = (sortOrder) => handleSortBy(this,sortOrder)
    this.updatePrices = () => handleUpdatePrices(this)

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
        return tickerFound.latestPrice
    }else{
        return null
    }
}

function handleSortBy(tickerList,sortOrder){

    function compareLatestPrice(a,b){
        if(a.latestPrice){
            return -1
        }else{
            return 1
        }
    }

    if(sortOrder){
        switch(sortOrder){
            case 'ticker':
            case 'sector':
                return tickerList.tickers.sort((a,b) => a[sortOrder].localeCompare(b[sortOrder]))
            case 'latestPrice':            
            case 'priceUpdated':      
                return tickerList.tickers.sort((a,b) =>compareLatestPrice(a,b))
            default:return tickerList.tickers
        }
    }else{
        return tickerList.tickers
    }
}

function handleUpdatePrices(tickerList){
    console.log(tickerList)
}
