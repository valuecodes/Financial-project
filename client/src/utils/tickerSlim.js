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
    this.country = ticker.country
    this.tickerId = ticker.tickerId
    this.selected = false
    this.updatedThisSession = false
    this.percentageChangeColor = () => handlePercentageChangeColor(this)
    this.updateTickerPrice = (userInfo,exhangeRate) => handleUpdateTickerPrice(this,userInfo,exhangeRate)
}

function handlePercentageChangeColor(tickerSlim){
    let percentageChange = tickerSlim.latestPrice.percentageChange
    return percentageChange>=0?'rgba(61, 212, 101,1)':'rgba(212, 61, 61,1)'
}


async function handleUpdateTickerPrice(tickerSlim,userInfo,exhangeRate){

    const { ticker } = tickerSlim
    let fullTickerData = await axios.get('/api/tickers/'+ticker)
    
    const { data, tickerQuarter, tickerRatios} = fullTickerData.data
    let tickerData = new TickerData(data, tickerQuarter, tickerRatios,exhangeRate)
    tickerData.addTickerSlimData(tickerSlim)
    
    let apiSymbol = getApiSymbol(tickerData.profile.country,ticker)

    const apiData = await axios.get('/dataInput/price/'+apiSymbol,{
        headers:{
            Authorization: 'Bearer'+userInfo.token
        }
    })
    
    let apiPriceData = apiData.data.data
    let updatedTickerData = tickerData.updatePriceFromApi(apiPriceData)
    tickerSlim.latestPrice = calculateLatestPrice(tickerData)   

    const currency = updatedTickerData.profile.financialDataCurrency
    if(currency === 'USD'&&ticker!=='BRK'){
        const ratioData = await axios.get('/dataInput/ratios/'+ticker,{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        updatedTickerData.updateRatiosFromApi(ratioData.data.data)
    }else{
        updatedTickerData.ratios = updatedTickerData.tickerRatios()
    }
    
    tickerSlim.ratios = updatedTickerData.ratios
    tickerSlim.updatedThisSession = true

    tickerData.addTickerSlimData(tickerSlim)
    tickerData.updateMonthlyYearly()
    return { updatedTickerData }
}