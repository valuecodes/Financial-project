import { roundFinancialNumber } from "./utils";

export function TickerRatio(data){
    this.ticker = data.ticker
    this.yearlyData = data.yearlyData
    this.monthlyPrice = data.monthlyPrice

    this.getYearlyRatio = (ratioName) => handleGetYearlyRatio(this,ratioName)

    this.getScatterChart = (y,x) => handleGetScatterChart(this,y,x)
}

function handleGetYearlyRatio(tickerRatio,ratioName){

    let ratio = []

    tickerRatio.yearlyData.forEach(year => {
        
        const {
            eps,
            currentAssets,
            currentLiabilities,
            bookValuePerShare,
            operatingMargin,
            profitMargin,
            roe,
            roa,
            sharesOutstanding,
            price,
            dividends
        } = year

        let value = null

        switch(ratioName){
            case 'pe':
                value = price/eps
                break
            case 'pb':
                    value = price/bookValuePerShare
                break
            case 'divYield':
                    value = (dividends/price)*100
                break
            case 'payoutRatio':
                    value = (dividends/eps)*100
                break
            case 'marketCap':
                    value = price*sharesOutstanding
                break
            case 'currentRatio':
                    value = currentAssets/currentLiabilities
                break
            case 'operatingMargin':
                    value = operatingMargin
                break
            case 'profitMargin':
                    value = profitMargin
                break
            case 'roe':
                    value = roe
                break
            case 'roa':
                    value = roa
                break
            default: value = null
        }        

        ratio.push({
            year: new Date(year.date).getFullYear(),
            value: roundFinancialNumber(value)
        })
    });

    return ratio
}

function handleGetScatterChart(tickerRatio,y,x){
    
    let yRatios = tickerRatio.getYearlyRatio(y)
    let xRatios = tickerRatio.getYearlyRatio(x)

    let data = yRatios.map(ratio =>{
        return{
            y: ratio.value,
            x: xRatios.find(item => item.year === ratio.year).value,
            yName: ratio.year,
            xName: ratio.year,
            ticker: tickerRatio.ticker
        }
    })

    return {
        label: 'Line Dataset'+tickerRatio.ticker,
        data: data,
        type: 'line',
        fill: false,
    }
}