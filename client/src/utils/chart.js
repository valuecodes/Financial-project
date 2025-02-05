import { 
    getFinancialKeyName, 
    calculateChartBorderGradient, 
    monthlyDividends,
    getRatioName
} from "./chartUtils";
import { Chart } from 'react-chartjs-2'
import { randomColor, roundToTwoDecimal, camelCaseToString } from "./utils";
import { stochasticOscillatorGradient, oscillatorPriceGradient } from "./calculations/gradientCalculations";

Chart.defaults.global.datasets.bar.categoryPercentage = 0.95;


export function calculatePriceChart(ticker,options){
    
    const { selected } = options

    let priceData = ticker.filterByDate('priceData',options)
    let dividends = ticker.filterByDate('dividendData',options)

    let data=[] 
    let labels = []
    let dataoff = []
    let divs = []
    let MA50 = []
    let MA200 = []
    let MA12 = []
    let MA26 = []
    let MACD = []
    let goldenCross=[]
    let deathCross=[]
    let oscillator=[]

    priceData.forEach((item,index) =>{
        let divAmount = 0
        let closestDiv = dividends.find(div => (Math.abs(new Date(div.date)-new Date(item.date))<604800000)) 
        if(closestDiv){
            dividends=dividends.filter(item => item._id!==closestDiv._id)
            divAmount=closestDiv.dividend
        }
        data.unshift(item.close)
        dataoff.unshift(item.close)
        labels.unshift(item.date.substring(0, 7))
        divs.unshift(divAmount)
        MA50.unshift(item.MA50?item.MA50:null)
        MA200.unshift(item.MA200?item.MA200:null)
        MA12.unshift(item.MA12?item.MA12:null)
        MA26.unshift(item.MA26?item.MA26:null)
        MACD.unshift(item.MA26&&item.MA12? item.MA12-item.MA26:null )
        oscillator.unshift(item.oscillator)
        if(item.MA50&&item.MA200&&priceData[index+1]){
            if(item.MA50>item.MA200 && priceData[index+1].MA50<priceData[index+1].MA200){
                 goldenCross.unshift(5)
            }else{
                goldenCross.unshift(0)
            }

            if(item.MA50<item.MA200 && priceData[index+1].MA50>priceData[index+1].MA200){
                deathCross.unshift(5)
            }else{
                deathCross.unshift(0)
            }
           
        }else{
            goldenCross.unshift(0)
            deathCross.unshift(0)
        }
        
    })    
    
    let total=0
    let cumulativeDividends = divs.map((item,index) => (total+=item))
    total=0
    let cumulativeDividendsPrice = divs.map((item,index) => ((total+=item)+data[index]))
    let percentageChangeWithDivs = cumulativeDividendsPrice.map(item => Number((((item-dataoff[0])/dataoff[0])*100).toFixed(2)))
    let percentageChange = dataoff.map(item => Number((((item-dataoff[0])/dataoff[0])*100).toFixed(2)))

    let dataSets=[]

    if(selected==='movingAverages'||selected==='MACD'){
        dataSets.push({
            type:'line',
            label: selected==='movingAverages'?'Moving average 50':'Moving average 12',           
            pointRadius: selected==='movingAverages'?goldenCross:0,
            pointBackgroundColor:'yellow',
            pointBorderColor:'yellow',
            borderWidth:selected==='movingAverages'?3:2,
            borderColor:'blue',
            data:selected==='movingAverages'?MA50:MA12,
            percentageChange,
            pointHoverRadius:0,
            percentageChangeWithDivs,
            options,  
            fill:false,
        })
        dataSets.push({
            type:'line',
            label: selected==='movingAverages'?'Moving average 200':'Moving average 26',    
            pointRadius: selected==='movingAverages'?deathCross:0,
            pointBackgroundColor:'black',
            pointBorderColor:'black',      
            borderWidth:selected==='movingAverages'?3:2,
            borderColor:'red',
            pointHoverRadius:0,            
            data:selected==='movingAverages'?MA200:MA26,
            percentageChange,
            percentageChangeWithDivs,
            options,  
            fill:false,
        })        
    }

    let MACDData=[]

    if(selected==='MACD'){
        let bgColor = MACD.map(item => item>=0?'green':'red')
        MACDData.push({ 
            backgroundColor: bgColor,
            borderWidth:2,
            data: MACD,
            pointHoverRadius:0,            
            percentageChange,
            percentageChangeWithDivs,
            options,  
            fill:false,
        })     
    }

    let oscillatorData=[]
    let priceGradient=null
    if(selected==='stochasticOscillator'){
        priceGradient=oscillatorPriceGradient(ticker,oscillator)
        oscillatorData.push({ 
            pointRadius:0,       
            borderColor:'black',   
            pointHoverRadius:0,            
            backgroundColor:stochasticOscillatorGradient(),           
            borderWidth:1,
            data: oscillator,
            options,  
            fill:true
        })  
    }

    dataSets.push({
        label: 'Share Price',
        backgroundColor: 'rgba(133, 133, 133,0.8)',
        pointRadius:0,
        pointHitRadius:5,
        borderColor:priceGradient?priceGradient:'black',
        borderWidth: selected==='stochasticOscillator'?5:1,
        data: data,    
        percentageChange,
        percentageChangeWithDivs,
        options,
        oscillator,
        MACD
    })

    if(selected==='priceChart'){
        dataSets.push({
            label: 'Dividends',
            backgroundColor:'rgba(255, 234, 94,0.2)',            
            pointRadius:0,
            borderWidth:1,
            borderColor:'yellow',
            data:cumulativeDividends,
            percentageChange,
            percentageChangeWithDivs,
            options,
        })        
    }

    return {
        oscillatorData,
        MACDData,
        datasets:dataSets,
        labels: labels
    }
}

export function calculateEventChart(ticker,options){
    
    let priceData = ticker.filterByDate('priceData',options)
    
    let dividends = ticker.filterByDate('dividendData',options)
    
    let myDivs = ticker.getMyDivs(options)

    let data=[] 
    let labels = []
    let dataoff = []

    priceData.forEach(item =>{
        let divAmount = 0
        let closestDiv = dividends.find(div => (Math.abs(new Date(div.date)-new Date(item.date))<604800000)) 
        if(closestDiv){
            dividends=dividends.filter(item => item._id!==closestDiv._id)
            divAmount=closestDiv.dividend
        }
        data.unshift(item.close)
        dataoff.unshift(item.close)
        labels.unshift(item.date.substring(0, 7))
        dividends.unshift(divAmount)
    })    

    let total=0
    let cumulativeDividends = dividends.map((item,index) => (total+=item))
    total=0
    let cumulativeDividendsPrice = cumulativeDividends.map((item,index) => ((total+=item)+data[index]))
    let percentageChangeWithDivs = cumulativeDividendsPrice.map(item => Number((((item-dataoff[0])/dataoff[0])*100).toFixed(2)))
    let percentageChange = dataoff.map(item => Number((((item-dataoff[0])/dataoff[0])*100).toFixed(2)))

    const events = calculateChartEvents(data,labels,ticker,options,myDivs)

    const {        
        tradePoints,
        insiderPoints,
        dividendPoints,
        userDivPoints,
        insiderPointColors,
        insiderTooltipLabels,
        tradeTooltipLabels,
        userDivTooltipLabels,
        divTooltipLabels,
        tradePointColors
    }= events


    let dataSets=[]

    let pointBorderColor = 'rgba(64, 64, 64,0.8)'
    let pointBorderWidth = 7

    dataSets.push({
        label: 'Filter events',
        backgroundColor:'rgba(133, 133, 133,0)',
        pointRadius:0,
        pointHitRadius:0,
        hoverRadius:0,
        borderColor:'black',
        data: data,    
        percentageChange,
        percentageChangeWithDivs,
        borderWidth:0.01,
        options,
    })

    dataSets.push({
        label: 'User trades',
        fill:false,        
        pointBackgroundColor:tradePointColors,
        pointRadius:tradePoints,
        hitRadius:tradePoints,
        pointBorderColor,
        pointBorderWidth:2,
        hoverRadius:tradePoints,     
        borderWidth:0.01,
        borderColor:'rgba(0, 255, 128,0.8)',
        data: data,    
        tooltipLabels:tradeTooltipLabels,
    })    

    dataSets.push({
        label: 'Insider Trades',
        fill:false,
        pointBackgroundColor:insiderPointColors,
        borderColor:'rgba(76, 212, 122,0.8)',
        pointRadius:insiderPoints,
        pointBorderColor,
        pointBorderWidth,
        hitRadius:insiderPoints,
        hoverRadius:insiderPoints,    
        borderWidth:0.01,
        data: data,    
        tooltipLabels:insiderTooltipLabels,
    })    

    dataSets.push({
        label: 'User Dividends',
        fill:false,
        pointBackgroundColor:'yellow',
        borderColor:'rgba(247, 243, 104,1)',
        pointRadius:userDivPoints,
        pointBorderWidth:2, 
        hitRadius:userDivPoints,
        hoverRadius:userDivPoints,    
        borderWidth:0.01,
        pointBorderColor,
        data: data,    
        tooltipLabels:userDivTooltipLabels, 
    })

    dataSets.push({
        label: 'All Dividends',
        fill:false,
        pointBackgroundColor:'rgba(255, 123, 0,0.1)',
        pointRadius:dividendPoints,
        hitRadius:dividendPoints,
        hoverRadius:dividendPoints, 
        pointBorderColor,
        pointBorderWidth:2, 
        borderWidth:0.01,
        borderColor:'rgba(255, 123, 0,0.1)',
        data: data, 
        tooltipLabels:divTooltipLabels, 
        hidden: true,
    })
    
    dataSets.push({
        label: 'Price chart',
        backgroundColor:'rgba(133, 133, 133,0.5)', 
        borderColor:'black',
        borderWidth:2,
        pointRadius:0,
        data: data,  
    })
    
    return {
        datasets:dataSets,
        labels: labels
    }

}

function calculateChartEvents(data,labels,ticker,options,myDivs){

    const  { time } = options 
    const { transactions } = ticker

    let trades = transactions.filter(item => new Date(item.date)>time.timeStart)
    let insider = ticker.insiderTrading.reverse().filter(item => new Date(item.date)>time.timeStart)
    let dividends = ticker.dividendData.reverse().filter(item => new Date(item.date)>time.timeStart)
    let userDivs = myDivs.filter(item => new Date(item.date)>time.timeStart)

    let tradePoints = data.map(item => 0)
    let insiderPoints = data.map(item => 0)
    let insiderBuyPoints = data.map(item => 0)
    let insiderSellPoints = data.map(item => 0)
    let insiderOtherPoints = data.map(item => 0)
    let dividendPoints = data.map(item => 0)
    let userDivPoints = data.map(item => 0)
    let insiderPointColors = data.map(item => 0)
    let tradePointColors = data.map(item => 0)

    let insiderTooltipLabels = data.map(item => [])
    let insiderBuyLabels = data.map(item => [])
    let insiderSellLabels = data.map(item => [])
    let insiderOtherLabels = data.map(item => [])
    let tradeTooltipLabels = data.map(item => [])
    let userDivTooltipLabels = data.map(item => [])
    let divTooltipLabels = data.map(item => [])

    let tooltipLabels = data.map(item => [])


    dividends.forEach(item =>{
        let divDate = new Date(item.date)
        let index = labels.findIndex(elem => Math.abs(new Date(elem)-divDate)<1604800000)
        if(index>=0){
            divTooltipLabels[index].push('Dividend '+item.dividend)
            dividendPoints[index]=7            
        }
    })

    userDivs.forEach(item =>{
        let userDivDate = new Date(item.date)
        let index = labels.findIndex(elem => Math.abs(new Date(elem)-userDivDate)<1604800000)
        if(index>=0){
            userDivTooltipLabels[index].push('Dividend '+item.payment)
            userDivPoints[index]=7           
        }
    })


    insider.forEach(item => {
        let insiderDate = new Date(item.date)
        let index = labels.findIndex(elem => Math.abs(new Date(elem)-insiderDate)<1604800000)
        if(index>=0){
            insiderTooltipLabels[index].push(item.type+` ${item.name} (${item.position})   ${item.volume}pcs ${item.price}$` )
            insiderPointColors[index]=getInsiderTradeType(item.type)
            insiderPoints[index]=10             
            if(item.type==='buy'){
                insiderBuyPoints[index]=10 
                insiderBuyLabels[index].push(item.type+` ${item.name} (${item.position})   ${item.volume}pcs ${item.price}$` )
            }else if(item.type==='sell'){
                insiderSellPoints[index]=10 
                insiderSellLabels[index].push(item.type+` ${item.name} (${item.position})   ${item.volume}pcs ${item.price}$` )
            }else{
                insiderOtherPoints[index]=10 
                insiderOtherLabels[index].push(item.type+` ${item.name} (${item.position})   ${item.volume}pcs ${item.price}$` )
            }
        }
    })             

    trades.forEach(item => {
        let insiderDate = new Date(item.date)
        let index = labels.findIndex(elem => Math.abs(new Date(elem)-insiderDate)<1604800000)
        if(tradeTooltipLabels[index]){
            tradeTooltipLabels[index].push(item.type+` ${item.count}pcs ${item.price}$` )
            tradePoints[index]=10 
            tradePointColors[index] = item.type==='buy'?'rgba(0, 255, 128,0.9)':'rgba(255, 89, 0,0.9)'            
        }
    }) 

    return { 
        tooltipLabels,
        tradePoints,
        insiderPoints,
        dividendPoints,
        userDivPoints,
        insiderPointColors,
        insiderTooltipLabels,
        tradeTooltipLabels,
        userDivTooltipLabels,
        divTooltipLabels,
        insiderBuyPoints,
        insiderSellPoints,
        insiderOtherPoints,
        insiderBuyLabels,
        insiderSellLabels,
        insiderOtherLabels,
        tradePointColors
    }
}

function getInsiderTradeType(type){
    switch(type) {
        case 'Buy':
            return 'rgba(76, 212, 122,0.9)'
        case 'Sell':
            return 'rgba(255, 79, 79,0.9)'
        default: return 'yellow'
      }
}

export function calculateFinancialChart(ticker,options){

    const { selected } = options

    let financialSections={
        incomeStatement:[
            {type:'bar',ratio:'revenue',color:'rgba(70, 125, 189,0.8)'},
            {type:'bar',ratio:'netIncome',color:'rgba(97, 194, 115,0.8)'},
            {type:'line',ratio:'netProfitMargin',format:'%',dataLabels:true,yAxisID:'y-axis-2'},
        ],
        balanceSheet:[
            {type:'bar',ratio:'currentAssets',color:'rgba(97, 194, 115,0.8)'},
            {type:'bar',ratio:'currentLiabilities',color:'rgba(194, 128, 128,0.8)'},
            {type:'line',ratio:'currentRatio',format:'',dataLabels:true,yAxisID:'y-axis-2'},
        ],
        cashFlow:[
            {type:'bar',ratio:'operatingCashFlow',color:'rgba(70, 125, 189,0.8)'},
            {type:'bar',ratio:'investingCashFlow',color:'rgba(252, 236, 3,0.6)'},
            {type:'bar',ratio:'financingCashFlow',color:'rgba(194, 128, 128,0.8)'},
            {type:'line',ratio:'freeCashFlow',format:'',fill:true,color:'rgba(143, 143, 143,0.3)'},
        ],
        dividends:[
            {type:'bar',ratio:'eps',color:'rgba(70, 125, 189,0.8)'},
            {type:'bar',ratio:'div',color:'rgba(194, 128, 128,0.8)'},
            {type:'line',ratio:'payoutRatio',format:'%',dataLabels:true,yAxisID:'y-axis-2'},            
        ]
    }

    let chartData=[]

    financialSections[selected].forEach(chart=>{
        let ratioData = ticker.getYearlyFinancialRatio(chart.ratio)
        chartData.push({...ratioData,...chart})
    })

    let datasets = [] 
    let labels = chartData[0].dateArray

    chartData.forEach(chart =>{
        datasets.push({    
            type:chart.type, 
            fill:chart.color?true:false,   
            label: chart.name,
            backgroundColor: chart.ratioArray.map(i => chart.color),
            yAxisID: chart.yAxisID||'y-axis-1',
            pointRadius:0,
            pointHitRadius:5,
            borderColor:'black',
            data: chart.format==='%'?chart.ratioArray.map(i=>i*100):chart.ratioArray,   
            categoryPercentage:0.5,
            borderColor:'dimgray',
            datalabels:chart.dataLabels?lineDataLabels(chart.format):{}
        })
    })

    return {datasets,labels}    
}

function lineDataLabels(format){
    return{
        display: true,
        backgroundColor:'dimgray',
        borderRadius:5,
        color:'white',
        padding:3,
        formatter: function(value, context) {
            let text = value>=10?value.toFixed(0):value.toFixed(1)
            return text+format
        }            
    }
}

export function calculateRatioCharts(ticker,options){

    const { selected } = options
    const { priceData } = ticker

    const ratiosSections={
        pe:{
            priceRatio:'pe',
            financialRatios:['eps'],
            label:'Historical PE-ratio'
        },
        pb:{
            priceRatio:'pb',
            financialRatios:['bookValuePerShare'],
            label:'Historical PB-ratio'
        },
        dividendYield:{
            priceRatio:'divYield',
            financialRatios:['div'],
            label:'Historical Dividend Yield',
        },
        'ev/ebit':{
            priceRatio:'evEbit',
            financialRatios:['marketCap','debt'],
            label:'Historical EV / Ebit',
            dataLabels:false,
            ratioColors:['rgba(97, 194, 115,0.8)','rgba(197, 94, 115,0.8)']
        },
        ps:{
            priceRatio:'ps',
            financialRatios:['price','revenuePerShare'],
            label:'Historical Price to Sales',
            ratioColors:[,'rgba(197, 94, 115,0.8)','rgba(97, 194, 115,0.8)']
        },
        pfcf:{
            priceRatio:'pfcf',
            financialRatios:['price','freeCashFlowPerShare'],
            label:'Historical Price to Free cash flow',
            ratioColors:[,'rgba(197, 94, 115,0.8)','rgba(97, 194, 115,0.8)']
        },
    }

    const { 
        priceRatio, 
        financialRatios,
        financialRatio2, 
        label, 
        dataLabels,
        ratioColors,
        financialRatio,
        format,
    } = ratiosSections[selected]
    

    const { ratioArray, dateArray, priceArray } = financialRatio?ticker.getYearlyFinancialRatio(financialRatio,options): 
    ticker.getPriceRatio(priceRatio,options)
    
    const financialData = financialRatios
        .map(ratioName=> ticker.getYearlyFinancialRatio(ratioName,options))

    const ratioMin = Math.min(...ratioArray)
    const ratioMax = Math.max(...ratioArray)
    const averageTop=ratioMax-(ratioMax-ratioMin)/3
    const averageBot=ratioMin+(ratioMax-ratioMin)/3

    let reversed = false
    if(selected==='dividendYield') reversed=true
    const pointColors=[]
    ratioArray.forEach(value =>{    
        if(value<averageBot){
            pointColors.push(reversed?'rgba(252, 3, 3,0.7)':'rgba(21, 209, 90,0.9)')             
        }else if(value>averageTop){
            pointColors.push(reversed?'rgba(21, 209, 90,0.9)':'rgba(252, 3, 3,0.7)')             
        }else{
            pointColors.push('rgba(235, 252, 3,0.4)')
        }
    })
    
    let ratioChart = {
        datasets:[{
            label: label,
            pointRadius:0,
            pointHitRadius:0,
            borderWidth:1,
            borderColor:'black',
            data: format==='%'?ratioArray.map(i=>i*100):ratioArray,  
        }],
        labels:dateArray
    }

    let pointRadius=priceArray.length<200?4:2
    if(window.innerWidth<800){
        pointRadius*=0.75
    }
    let priceChart ={
        datasets:[{
            label: 'Stock Price',
            pointRadius:pointRadius,
            pointHitRadius:0,
            pointBackgroundColor:pointColors,
            borderWidth:1,
            data: priceArray, 
        }],
        labels:dateArray
    }

    let financialCharts=[]
    financialData.forEach((data,index) =>{
        financialCharts.push(
            {
                label: data.name,
                backgroundColor: ratioColors?ratioColors[index]:'rgba(97, 194, 115,0.8)',
                data: data.ratioArray,
                categoryPercentage:0.5,
                maxBarThickness: 20,
                borderWidth:2,
                borderColor:'rgb(89, 89, 89)', 
                datalabels:{
                    display:dataLabels===false?false:true,
                } 
            },
        )        
    })

    let financialChart ={
        datasets:financialCharts,
        labels:financialData[0].dateArray
    }

    return { ratioChart, priceChart, financialChart }
}

export function calculateDividendChart(chartComponents,options){
    
    let { data, userDividends } = chartComponents
    const { time, selected } = options
    data = data.filter(item => new Date(item.date)>time.timeStart)

    let dataSets = [];  
    let labels = data.map(item => item.label)

    switch(selected){
        case 'dividends':
            dataSets.push({
                pointRadius:0,
                pointHitRadius:5,
                borderColor:'black',
                data: data.map(item => item.divAmount),    
            })           
            break
        case 'yearlyDividends':

            if(data.length===0) break
            let min=data[0].date.getFullYear()
            let max=data[data.length-1].date.getFullYear()

            for(var i=min;i<=max;i++){
                let mData = monthlyDividends(userDividends,i,i)
                dataSets.push({
                    backgroundColor:randomColor(),
                    type:'bar',
                    label:i,
                    pointRadius:0,
                    pointHitRadius:5,
                    borderColor:'black',
                    data: mData.map(item => item.divAmount),    
                })  
                labels=mData.map(item => item.date.getMonth())
            }        
            break
        case 'cumulativeDividends':
            let total=0;
            let cumulativeDivs = data.map(item =>{
                total+=item.divAmount
                return total
            })
            dataSets.push({
                pointRadius:0,
                pointHitRadius:5,
                borderColor:'black',
                data: cumulativeDivs,    
            })   
            break
        default: 
    }

    return {
        datasets:dataSets,
        labels
    }    
}

export function calculateStatCharts(chartComponents){
    const { sectors ,industries, subIndustries } = chartComponents

    let total = sectors.reduce((a,c) => a+c.value,0)

    let sectorData={
        title:'Test',
        datasets: [{
            data: sectors.map(item => item.value).sort((a,b)=>b-a),
            backgroundColor:['#BB533E','#BB7F3E','#2A6175','#2D884F','#E19B8D','#E1B98D','#5B7F8D','#66A37D','#0A7231','#0C4B62'],
            metaData:sectors,
            values:sectors.map(item => item.value).sort((a,b)=>b-a),
            percentages:sectors.map(item => roundToTwoDecimal(item.value/total)),
            color:'black'
        }],
        labels: sectors.map(item => item.name)
    }
    let industryData={
        datasets: [{
            data: industries.map(item => item.value).sort((a,b)=>b-a),
            backgroundColor:['#BB533E','#BB7F3E','#2A6175','#2D884F','#E19B8D','#E1B98D','#5B7F8D','#66A37D','#0A7231','#0C4B62'],
            metaData:industries
        }],
        labels: industries.map(item => item.name)
    }
    let subIndustryData={
        datasets: [{
            data: subIndustries.map(item => item.value).sort((a,b)=>b-a),
            backgroundColor:['#BB533E','#BB7F3E','#2A6175','#2D884F','#E19B8D','#E1B98D','#5B7F8D','#66A37D','#0A7231','#0C4B62'],
            metaData:subIndustries
        }],
        labels: subIndustries.map(item => item.name)
    }

    return{
        sectorData,
        industryData,
        subIndustryData
    }
}

export function calculateStatTreeMap(chartComponents){
    const { sectors, industries, tickers } = chartComponents  
    let array = []
    array.push(['Division','Parent','Portfolio Share','Percentage Change'])
    array.push(['Portfolio',null,0,0])
    sectors.forEach(item => {
        array.push([item.name,'Portfolio',item.value,0])
    });
    industries.forEach(item => {
        array.push([item.name,item.parent,item.value,0])
    })
    tickers.forEach(item => {
        array.push([
            `${item.name} (${item.items[0].percentageChange})%`,
            item.parent,
            item.value,item.items[0].percentageChange])
    })
    return array
}

export function calculateForecastChartComponents(ticker){

    let priceData = ticker.priceData
        .filter(item => new Date(item.date).getFullYear()>new Date().getFullYear()-15)
        .reverse() 

    priceData = [...priceData.filter((item,index) => { return index%4===0})]

    let { forecastInputs, yearlyData, financialInputs } = ticker.analytics   

    const { 
        eps={latest:0},
        netIncome={latest:0},
        netProfitMargin={latest:0},
        payoutRatio={average:0,latest:0}, 
        debt={latest:0,averageGrowth:0},
        cash={latest:0},
        ebit={latest:0},
        ebitMargin={latest:0},
        evEbit={latest:0},
    } = financialInputs

    let {
        pe={latest:0},
        lastFullFinancialYear,
        startingFinancialYear,
    } = financialInputs

    let {
        startingPrice,
        endingPE,
        futureGrowthRate,
        endingProfitability,
        endingPayoutRatio,
        shareCount,
        startingFreeCashFlow,
        forecastStartingDate
    } = forecastInputs

    let futurePriceData = priceData.filter(item => new Date(item.date)>new Date(forecastStartingDate))

    priceData = priceData.filter(item => new Date(item.date)<=new Date(forecastStartingDate))

    let latestPriceDate = new Date()
    let futurePriceDate = new Date()
    
    if(priceData.length>0){
        latestPriceDate = new Date(priceData[priceData.length-1].date)
        futurePriceDate = new Date(priceData[priceData.length-1].date)
    }

    for(let a=0;a<120;a++){
        futurePriceDate.setMonth(futurePriceDate.getMonth()+1)
        priceData.push({
            date:futurePriceDate.toISOString(),
            close:startingPrice,
            futurePrice:futurePriceData[a]?futurePriceData[a].close:null
        })
    }

    yearlyData = {...yearlyData}
    pe.latest = startingPrice/eps.latest
    let peDiscount = endingPE/pe.latest
    
    for(var i=startingFinancialYear+1;i<startingFinancialYear+11;i++){
        if(!yearlyData[i]){
            yearlyData[i]={
                div: yearlyData[lastFullFinancialYear].div,
                revenue: yearlyData[lastFullFinancialYear].revenue,
                grossProfit: yearlyData[lastFullFinancialYear].grossProfit,
                netIncome: yearlyData[lastFullFinancialYear].netIncome,
                freeCashFlow: startingFreeCashFlow,
                eps: eps.latest,
                debt: debt.latest,
                ebit: ebit.latest,
                evEbit: evEbit.latest,
                netProfitMargin:yearlyData[lastFullFinancialYear].netProfitMargin,
                payoutRatio:yearlyData[lastFullFinancialYear].payoutRatio,
                date:i+'-12'
            }            
        }
    }

    let futureMonths = priceData.filter(item => 
        new Date(item.date)<new Date(startingFinancialYear+11,0)&&
        new Date(item.date)>new Date(latestPriceDate)
    ).length

    priceData = priceData.filter(item => new Date(item.date)<new Date(startingFinancialYear+11,0))
    
    let labels = priceData.map(item => new Date(item.date).getFullYear())
    let pricePast=[]
    let priceForecast=[]
    let dividendForecast=[]

    let financialData={
        eps:{
            data:[],colors:[],color:'rgba(13, 191, 85,0.9)',hidden:false,chart:'epsChart',yAxisID: 'bar',format:''
        },
        div:{
            data:[],colors:[],color:'rgba(201, 85, 85,0.9)',hidden:false,chart:'epsChart',yAxisID: 'bar',format:''
        },
        payoutRatio:{
            data:[],colors:[],color:'rgba(56, 56, 56,0.9)',hidden:false,chart:'epsChart',yAxisID: 'line',order:1,format:'%'
        },
        revenue:{
            data:[],colors:[],color:'rgba(13,135,212,0.9)',hidden:false,chart:'financialChart',yAxisID: 'bar',format:'M'
        },
        grossProfit:{
            data:[],colors:[],color:'rgba(159, 166, 85,0.9)',hidden:true,chart:'financialChart',yAxisID: 'bar',format:'M'
        },
        netIncome:{
            data:[],colors:[],color:'rgba(12,199,15,0.9)',hidden:false,chart:'financialChart',yAxisID: 'bar',format:'M'
        },
        netProfitMargin:{
            data:[],colors:[],color:'rgba(56, 56, 56,0.9)',hidden:false,chart:'financialChart',yAxisID: 'line',order:1,format:'%'
        },
        freeCashFlow:{
            data:[],colors:[],color:'rgba(99, 168, 144,0.9)',hidden:false,chart:'freeCashFlowChart',yAxisID: 'bar',format:'M'
        },        
        marketCap:{
            data:[],colors:[],color:'rgba(13,135,212,0.9)',hidden:false,chart:'evChart',yAxisID: 'bar',format:'M'
        },        
        debt:{
            data:[],colors:[],color:'rgba(201, 85, 85,0.9)',hidden:false,chart:'evChart',yAxisID: 'bar',format:'M'
        },        
        ebit:{
            data:[],colors:[],color:'rgba(13, 191, 85,0.9)',hidden:false,chart:'evChart',yAxisID: 'bar',format:'M'
        },
        evEbit:{
            data:[],colors:[],color:'rgba(56, 56, 56,0.9)',hidden:false,chart:'evChart',yAxisID: 'line',format:'',order:1
        },        
    }

    let numberOfIterations = 0
    let futureYearNumber = 1
    let totalDividends=0
    let financialLabels = []
    let profitabilityChange = (Number(endingProfitability)-netProfitMargin.latest)

    let lastEps = yearlyData[startingFinancialYear]?yearlyData[startingFinancialYear].eps:eps.latest
    let latestEPS = yearlyData[startingFinancialYear]?yearlyData[startingFinancialYear].eps:eps.latest
    let latestCash = cash.latest
    let latestEbit = ebit.latest
    let latestPrice = startingPrice
    let latestDebt = debt.latest
    let latestRevenue = 0
    let monthCount = 0
    let priceDiscount = 0
    let actualPrice = []

    priceData.forEach((item,index) =>{

        let future = new Date(item.date)>new Date(latestPriceDate)
        let year = new Date(item.date).getFullYear()

        actualPrice.push(item.futurePrice)
        if(!future){
            pricePast.push(item.close)
            priceForecast.push(item.close)    
            dividendForecast.push(item.close)            
        }
        
        if(year<=startingFinancialYear){
            if(yearlyData[year]){
                if(yearlyData[year].date===item.date.substring(0,7)){
                    Object.keys(financialData).forEach(item =>{
                        financialData[item].data.push(yearlyData[year][item])
                        financialData[item].colors.push(financialData[item].color)      
                        if(item==='revenue'){
                            lastEps = yearlyData[year][item]
                        }                              
                    })
                    financialLabels.push(year)   
                    if(year!==startingFinancialYear){
                        delete yearlyData[year]
                    }
                }              
            }          
        }else{
            if(yearlyData[year-1]){    
                if(new Date(item.date).getMonth()===0){
                    let fYear = year-1
                    Object.keys(financialData).forEach(item =>{

                        let growthRate = futureGrowthRate
                        if(year<lastFullFinancialYear){
                            growthRate=0 
                        } 

                        let calculatedValue = yearlyData[fYear][item] * (1 + (growthRate))**(futureYearNumber)
                        if(futureYearNumber===1&&item==='freeCashFlow'){
                            calculatedValue=startingFreeCashFlow
                        }
                        let profitability = netProfitMargin.latest + ((profitabilityChange/10)*futureYearNumber)
                        shareCount = netIncome.latest/eps.latest
                        let marketCap = latestPrice*shareCount

                        if(item==='debt'){
                            latestCash = latestCash+(latestCash*growthRate)
                            latestEbit = latestRevenue*(ebitMargin.latest+((profitabilityChange/10)*futureYearNumber))
                            let ev = marketCap+latestDebt+latestCash
                            financialData.evEbit.data.push(ev/latestEbit)
                            financialData.debt.data.push(latestDebt)
                            financialData.ebit.data.push(latestEbit)
                        }

                        if(item==='netProfitMargin'){
                            calculatedValue = profitability
                        }

                        let color = financialData[item].color
                        color = color.split('.')[0]+'.3)'
                        financialData[item].colors.push(color)  

                        if(item==='revenue'){
                            let newEps = (calculatedValue*profitability)/shareCount
                            let newNetIncome = calculatedValue*profitability
                            let newDiv = 0
                            let newPayoutRatio=null

                            if(year<=lastFullFinancialYear){    
                                newEps = yearlyData[year].eps
                                newNetIncome = yearlyData[year].netIncome
                                calculatedValue=yearlyData[year].revenue
                                newDiv = yearlyData[year].div
                                newPayoutRatio = yearlyData[year].payoutRatio
                            }
                            
                            financialData.marketCap.data.push(marketCap)
                            financialData.eps.data.push(newEps)
                            financialData.netIncome.data.push(newNetIncome)
                            lastEps = latestEPS
                            latestEPS = newEps
                            latestRevenue = calculatedValue

                            if(year>lastFullFinancialYear){
                                newPayoutRatio=(payoutRatio.latest+ (endingPayoutRatio-payoutRatio.latest)/10*futureYearNumber)
                                newDiv = newEps*newPayoutRatio                              
                            }

                            totalDividends+=newDiv 
                            financialData.div.data.push(newDiv)  
                            financialData.payoutRatio.data.push(newPayoutRatio)  
                        }
                        if(item!=='netIncome'&&item!=='eps'&&item!=='div'&&item!=='payoutRatio'&&item!=='marketCap'&&item!=='evEbit'&&item!=='debt'&&item!=='ebit'){
                            financialData[item].data.push(calculatedValue)
                        }                            
                        
                    })
                    financialLabels.push(year)               
                    delete yearlyData[fYear]
                    if(year>=lastFullFinancialYear){
                        futureYearNumber++;
                    }
                    
                    monthCount=1                    
                }           
            }
           
            if(future){
                monthCount = new Date(item.date).getMonth()
                numberOfIterations++                    
                let discount = 1-((1-peDiscount)*(numberOfIterations-1)/futureMonths)
                let epsDiscount = ((latestEPS-lastEps)/12)*(monthCount)
                let futurePrice = (lastEps+epsDiscount)*(pe.latest*discount)
                futurePrice = futurePrice + priceDiscount - ((priceDiscount/futureMonths)*numberOfIterations)

                if(numberOfIterations===1){                 
                    peDiscount = endingPE/(futurePrice/lastEps)
                    priceDiscount=startingPrice-futurePrice
                    futurePrice=startingPrice
                }
                priceForecast.push(futurePrice)
                dividendForecast.push(futurePrice+totalDividends)
                monthCount++
                latestPrice=futurePrice                
            }

        }    
    })
    
    let dcfTable = calculateDCF(ticker,forecastInputs, yearlyData )
    let endingPrice = priceForecast[priceForecast.length-1]
    let futureTotalPrice = dividendForecast[dividendForecast.length-1]
    let annualPriceReturn = ((endingPrice/startingPrice)**(1/10))-1
    let annualTotalReturn = ((futureTotalPrice/startingPrice)**(1/10))-1
    let pricePercentageChange = ((endingPrice-startingPrice)/startingPrice)*100
    let totalPercentageChange = ((futureTotalPrice-startingPrice)/startingPrice)*100

    let forecastOutputs={
        priceReturn: annualPriceReturn,
        divReturn: annualTotalReturn - annualPriceReturn,
        totalReturn: annualTotalReturn,
        startingPrice,
        startingIndex:pricePast.length,
        endingPrice,
        endingIndex:priceForecast.length-1,
        pricePercentageChange,
        totalPercentageChange
    }

    ticker.analytics = {
        ...ticker.analytics,
        forecastOutputs,
    }

    let forecastChart = {
        datasets:[
            {
                label:'Price',
                data:pricePast,
                borderColor:'black',
                pointRadius:0,
                borderWidth:2,            
                fill:false,
            },
            {
                label:'Price Forecast',                
                data:priceForecast,
                pointBackgroundColor:'rgba(0,0,0,0)',
                pointRadius:0,
                borderWidth:2,        
                borderColor:'rgba(66, 132, 237,1)',
                fill:false,               
            },
            {
                label:'Dividend Forecast',                
                data:dividendForecast,
                pointBorderRadius:0,
                pointRadius:0,
                borderWidth:2,                            
                pointBackgroundColor:'rgba(0,0,0,0)',
                borderColor:'rgba(238, 255, 0, 0.95)',
                fill:false,               
            },            
            {
                label:'Actual Price',
                data:actualPrice,
                borderColor:'rgba(110, 110, 110,1)',
                pointRadius:0,
                borderWidth:1,            
                fill:false,
            },
        ],
        labels 
    }

    let financialCharts = {
        financialChart:{
            categoryPercentage:5,
            datasets:[],
            labels:financialLabels
        },
        epsChart:{
            categoryPercentage:5,
            datasets:[],
            labels:financialLabels
        },
        freeCashFlowChart:{
            categoryPercentage:5,
            datasets:[],
            labels:financialLabels
        },
        evChart:{
            categoryPercentage:5,
            datasets:[],
            labels:financialLabels
        }
    }

    let lastFullFinancialYearIndex = financialLabels.findIndex(item => item === startingFinancialYear)

    Object.keys(financialData).forEach(dataName =>{
        let chartName = financialData[dataName].chart
        financialCharts[chartName].datasets.push({
            label:camelCaseToString(dataName),
            type:financialData[dataName].yAxisID==='line'?'line':'bar',
            data:financialData[dataName].data,
            backgroundColor:financialData[dataName].colors,
            barPercentage: 0.5,
            barThickness: 10,    
            borderWidth:2,
            yAxisID:financialData[dataName].yAxisID,
            xAxisID:financialData[dataName].xAxisID,
            borderColor:financialData[dataName].colors[financialData[dataName].colors.length-1],
            fill:false,
            hidden:financialData[dataName].hidden,
            order:financialData[dataName].order?financialData[dataName].order:2,
            format:financialData[dataName].format,
            lastFullFinancialYearIndex,
            stacked:financialData[dataName].stacked?true:false,
            stack:financialData[dataName].stack
        })
    })

    console.log('EPS: '+latestEPS)
    console.log('PRICE: '+latestPrice)
    console.log('PE: '+latestPrice/latestEPS)

    return {forecastChart,financialCharts,dcfTable}
}

function calculateDCF(ticker,forecastInputs, yearlyData ){

    let cashFlow = forecastInputs.startingFreeCashFlow
    let shortTerm = 10
    let discountRate = Number(forecastInputs.dcfDiscountRate);
    let discountRateGrowth = 1.1;
    let growthRate = Number(forecastInputs.futureGrowthRate)+1
    let perpetuity = Number(forecastInputs.perpetuityGrowth);
    let shareCount = forecastInputs.shareCount;
    let sharePrice = forecastInputs.startingPrice;
    let cash=cashFlow;
    let total=0;
    let oneYear=0;

    let years=['Year']
    let FCF=['FCF'];
    let DF=['DF'];
    let DFvalue=1;
    let DFCF=['DFCF'];
    let totalDFCF=0

    for(var i=1;i<=shortTerm;i++){
        years.push(i)
        oneYear=cash/Math.pow((1+discountRate),i);
        cash=cash*growthRate;
        FCF.push(Math.round(cash*100)/100);
        DFvalue=DFvalue*discountRateGrowth;
        DF.push((Math.round(DFvalue*100)/100));
        oneYear*=growthRate;
        DFCF.push(Math.round(oneYear*100)/100);
        total+=oneYear;
        totalDFCF+=Math.round(oneYear*100)/100
    }

    let terminal=(oneYear*growthRate)*(1+perpetuity)/((discountRate+(0.01-(perpetuity/10)))-perpetuity);
    
    total+=terminal;
    total=Math.round(total * 100) / 100;

    let  intrinsicValue = total / shareCount

    let annualReturn = calculateAnnual(); 

    let dfcData ={
        years,
        FCF,
        DF,
        DFCF,
        total,
        terminal:terminal.toFixed(0),
        intrinsicValue,
        annualReturn,
        totalDFCF:totalDFCF.toFixed(0)
    }    

    return dfcData
    function calculateAnnual(){
        let xa;
        let xb;
        var step = 0.0001;
        for (var i = 0; i < 50; i++) {
            xa = xb = i / 100;
            var counter = 0;
            do {
                xa = xb;
                xb = iterate(xa);
                counter++;
            } while ((Math.abs(xb - xa) > step) && (counter < 30) && (Math.abs(xb - xa) < 1));
                if ((Math.abs(xb - xa) <= step)) {
                    break;
                }
                }
            if ((Math.abs(xb - xa) <= step)) {
                var ndr = xb * 100;
                ndr=Math.round(ndr*100)/100;
                return ndr
            } 
    }
    
    function iterate(x) {
        var freecashflow = cashFlow;
        var gAfter10 = Number(perpetuity/100);
        var growth10 = growthRate;
        var percent101 = 1 + x;
        var years = Number(shortTerm) + 1;
        var exponent = Math.pow(growth10, years);
        var f0 = freecashflow * exponent * (1 + gAfter10) / (x - gAfter10) / Math.pow(percent101, years) +
        freecashflow * (1 - Math.pow(growth10 / percent101, years)) / (1 - growth10 / percent101) - freecashflow - sharePrice * shareCount;
        var fder = -freecashflow * (1 + gAfter10) * exponent * (1 / Math.pow(percent101, years) / Math.pow(-gAfter10 + x, 2) + years * Math.pow(x + 1, -1 - years) / (-gAfter10 + x)) +
        freecashflow * (years * exponent * Math.pow(percent101, -1 - years) / (1 - growth10 / percent101) - growth10 * (1 - exponent / Math.pow(percent101, years)) / Math.pow((1 - growth10 / percent101) * percent101, 2));
        var result = x - f0 / fder;
        return result;
    }
}

