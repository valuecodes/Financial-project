import { roundToTwoDecimal } from "./utils";
import axios from "axios";
import { TickerData } from "./tickerData";
import { getApiSymbol, calculateLatestPrice } from "./calculations/inputCalculations";

export function TickerSlim(ticker){
    this.id = ticker.tickerId
    this.ticker = ticker.ticker
    this.name = ticker.name
    this.ratios = ticker.ratios
    this.latestPrice = ticker.latestPrice
    this.sector = ticker.sector
    this.industry = ticker.industry
    this.tickerId = ticker.tickerId
    this.selected = false
    this.updatedThisSession = false
    // this.latestPrice = ticker.price[0].close
    // this.secondPrice = ticker.price[1].close
    this.percentageChange = () => {
        return roundToTwoDecimal(((this.latestPrice-this.secondPrice)/this.latestPrice)*100)
    }
    this.percentageChangeColor = () => {
        let percentageChange = this.percentageChange()
        return percentageChange>=0?'rgba(61, 212, 101,1)':'rgba(212, 61, 61,1)'
    }
    this.updateTickerPrice = (userInfo) => handleUpdateTickerPrice(this,userInfo)
}


async function handleUpdateTickerPrice(tickerSlim,userInfo){

    const { ticker } = tickerSlim
    let fullTickerData = await axios.get('/api/tickers/'+ticker)
    let tickerData = new TickerData(fullTickerData.data.data)
    

    let apiSymbol = getApiSymbol(tickerData.profile.country,ticker)

    const apiData = await axios.get('/dataInput/price/'+apiSymbol,{
        headers:{
            Authorization: 'Bearer'+userInfo.token
        }
    })

    let apiPriceData = apiData.data.data
    let updatedTickerData = tickerData.updatePriceFromApi(apiPriceData)

    tickerSlim.latestPrice = calculateLatestPrice(tickerData)   
    tickerSlim.updatedThisSession = true
    tickerData.addTickerSlimData(tickerSlim)
    
    return { updatedTickerData }
}