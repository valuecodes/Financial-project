import Portfolio from "./portfolio";
import { TickerRatio } from "./tickerRatio";
import { roundToTwoDecimal, toPercentage } from "./utils";
import { Chart } from 'react-chartjs-2'
import * as ChartGeo from 'chartjs-chart-geo'
import worldMap from 'world-atlas/countries-50m.json'

export default function PortfolioData(portfolio,tickerRatios=[],tickerListData){
    this.portfolio = new Portfolio(portfolio)
    this.tickerRatios = tickerRatios.map(ticker => new TickerRatio(ticker))
    this.tickerListData = tickerListData
    this.portfolioTickers = []
    this.priceChart = {
        charts:['price','win/loss','dividends'],
        selected:'price'
    }
    this.tickerList={
        headers:[],
        tbody:[],
    }
    this.priceChartData = {}
    this.priceChartOptions = {
        responsive:true,
        maintainAspectRatio: false,
    }
    this.init = () => handleInit(this)

    this.createPortfolioTickers = () => handleCreatePortfolioTickers(this)
    this.createDougnutChart = () => handleCreateDoughnutChart(this)
    this.createGeoChart = () => handleCreateGeoChart(this)
    this.updatePriceChart = () => handleUpdatePriceChart(this)
    this.updatePortfolioList = () => handleUpdatePortfolioList(this)
}

function handleInit(portfolioData){
    portfolioData.createPortfolioTickers()
    portfolioData.createDougnutChart()
    portfolioData.createGeoChart()
    portfolioData.updatePortfolioList()
    portfolioData.updatePriceChart()
}

function handleCreateDoughnutChart(portfolioData){
    console.log(portfolioData)
}

function handleCreateGeoChart(portfolioData){

    let total = portfolioData.portfolioTickers.reduce((a,c)=> a+c.marketPrice,0)
    let countryTotals={}

    portfolioData.portfolioTickers.forEach(item =>{
        let country = item.country
        if(countryTotals[country]){
            countryTotals[country]+=item.marketPrice
        }else{
            countryTotals[country]=item.marketPrice
        }
    })
    
    let data = worldMap
    let countries = ChartGeo.topojson.feature(data, data.objects.countries).features;
    countries = countries.filter(item => item.properties.name!=='Antarctica')

    function getCountryValue(d){
        let country = d.properties.name
        if(country ==='United States of America') country = 'United States'
        if(countryTotals[country]){
            return countryTotals[country]
        }
        return 0
    }

    new Chart(document.getElementById("geo").getContext("2d"), {
        type: 'choropleth',
        data: {
        labels: countries.map((d) => d.properties.name),
        datasets: [{
            label: 'Countries',
            data: countries.map((d) => ({feature: d, value: getCountryValue(d)})),
        }]
        },
        options: {
            responsive:true,
            maintainAspectRatio: false,
            showOutline: false,
            showGraticule: false,
            plugins: {
                datalabels: {
                    display: false,
                },
            },
            legend: {
                display: false
            },
            scale: {
                projection: 'mercator'
            },
            geo: {
                colorScale: {
                    display: false,
                },
            },
        }
    });            
}

function handleCreatePortfolioTickers(portfolioData){
    let portfolioTickers = []
    portfolioData.tickerRatios.forEach(tickerRatio =>{
        let combinedTicker = {
            ...tickerRatio,
            ...portfolioData.portfolio.tickers
                .find(item => item.ticker===tickerRatio.ticker),
            ...portfolioData.tickerListData
                .find(item => item.ticker===tickerRatio.ticker)
        }
        portfolioTickers.push(combinedTicker)
    })
    
    portfolioTickers.forEach(ticker =>{
        let { transactions=[] } = ticker
        let { close } = ticker.monthlyPrice[0]
        ticker.purchasePrice = roundToTwoDecimal(transactions.reduce((a,c)=>a+c.total,0))
        ticker.shareCount = transactions.reduce((a,c)=>a+c.count,0)
        ticker.averagePrice = roundToTwoDecimal(ticker.purchasePrice / ticker.shareCount)
        ticker.marketPrice = roundToTwoDecimal(ticker.shareCount*close)
        ticker.sharePrice = close
        ticker.change = roundToTwoDecimal(ticker.marketPrice-ticker.purchasePrice)
    })

    portfolioData.portfolioTickers = portfolioTickers
}

function handleUpdatePriceChart(portfolioData){

    const selected = portfolioData.priceChart.selected    
    const { portfolio, tickerRatios } = portfolioData
    const { transactions } = portfolio
    let dates = {}

    transactions.forEach(transaction => {
        let tickerRatio = tickerRatios.find(item => item.ticker === transaction.ticker)
        let transactionDate = new Date(transaction.date).getTime()
        if(!tickerRatio) return        
        tickerRatio.monthlyPrice.forEach(price =>{
            let priceDate = new Date(price.date).getTime()
            let dateId = price.date.split('T')[0]
            if(priceDate>transactionDate){

                let amount = 0

                switch(selected){
                    case 'price':
                        amount = transaction.count*price.close
                        break
                    case 'win/loss':
                        amount = transaction.count*price.close-transaction.total
                        break
                    default: amount = 0
                }

                if(dates[dateId]){
                    dates[dateId] += amount
                }else{
                    dates[dateId] = amount
                }
            }
        })
    });

    let data = Object.values(dates).reverse()
    let labels = Object.keys(dates).reverse()

    let gradient = calculateChartGradient(data)

    portfolioData.priceChartData = {
        datasets: [{
            label: 'Portfolio Price',
            backgroundColor:gradient,
            borderColor:'black',
            pointRadius:0,
            data: data
        }],
        labels: labels      
    }

    portfolioData.priceChartOptions = getChartOptions()

    return portfolioData
}

function handleUpdatePortfolioList(portfolioData){

    let headers = ['ticker','name','averagePrice','sharePrice','shareCount','purchasePrice','marketPrice','change','percantageChange']
    let tbody = portfolioData.portfolioTickers.map(ticker => {return{
        ticker:ticker.ticker,
        name:ticker.name,
        averagePrice:ticker.averagePrice,
        sharePrice:ticker.sharePrice,
        shareCount:ticker.shareCount,
        purchasePrice:ticker.purchasePrice,
        marketPrice:ticker.marketPrice,
        change:(ticker.change>=0?'+':'')+ticker.change,
        percantageChange:toPercentage((ticker.marketPrice/ticker.purchasePrice))
    }})

    portfolioData.tickerList.headers = headers
    portfolioData.tickerList.tbody = tbody
}

function getChartOptions(){
    return{
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: false,
            },
        },
        tooltips: {
            mode: "index",
            intersect: false,
          },
    }
}

function calculateChartGradient(data){

    var ctx = document.getElementById('canvas').getContext("2d")
    let height=Number(document.getElementById('canvas').style.height.substring(0, document.getElementById('canvas').style.height.length - 2))
    var gradient = ctx.createLinearGradient(0, 0, 0, height*0.92)
    let max = Math.max(...data)
    let min = Math.min(...data)
    let percentage=0
    let red=0

    if(min<0){
        percentage= 1- Math.abs(min)/(max+Math.abs(min))
        red=1            
        gradient.addColorStop(0, 'lightgreen')
        gradient.addColorStop(percentage, 'white')
        gradient.addColorStop(red, 'salmon')
    }else{
        percentage=1
        red=1
        gradient.addColorStop(0, 'lightgreen')
        gradient.addColorStop(percentage, 'white')
    }
    return gradient

}