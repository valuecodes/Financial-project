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

export function calculateRatioChartComponents(ticker,options){
    const key = options.selected
    let priceData = ticker.filterByDate('priceData',options)

    let ratios = [];
    let ratioName=''

    switch(key){
        case 'pe':
            ratios = ticker.filterByDate('incomeStatement',options)
            ratioName='eps'
            break
        case 'pb':
            ratios = ticker.filterByDate('balanceSheet',options)
            ratioName='bookValuePerShare'
            break
        case 'dividendYield':
            ratios = ticker.filterByDate('dividendData',options)
            ratioName='dividend'
            break
        default: return ''
    }

    let data=[]
    let labels=[]
    let tickerPriceData=[]

    priceData.forEach(price =>{
        let ratio=ratios.find(item => new Date(item.date).getFullYear()<=new 
        Date(price.date).getFullYear())
        if(ratio){
            switch(key){
                case 'pe':
                case 'pb':
                    if(ratio[ratioName]){
                        data.unshift(Number((price.close/ratio[ratioName]).toFixed(1)) )                        
                    }
                    break
                case 'dividendYield':
                    let yearDivs = ratios.filter(item => new Date(item.date).getFullYear()===new Date(price.date).getFullYear())
                    let totalDiv = yearDivs.reduce((a,b)=>a+b.dividend,0)
                    data.unshift(Number(((totalDiv/price.close)*100).toFixed(1)))
                    break
                default: return ''
            }
            labels.unshift(price.date.substring(0, 7))
            tickerPriceData.unshift(price.close)
        }
    })
    
    if(ratios.length>1){
        if(new Date(ratios[0].date)>new Date(ratios[1].date)){
            ratios = ratios.reverse()
        }
    }

    let financialData = ratios.map(item => item[ratioName])
    let financialLabels = ratios.map(item => item.date.split('T')[0])

    return { data, labels, tickerPriceData, financialData, financialLabels, ratios }
}

export function calculateRatioFinacialChart(ratioChartComponents,options){
    const { financialData, financialLabels } = ratioChartComponents
    const key = options.selected
    const financialKey = getFinancialKeyName(key)

    let datasets=[]
    datasets.push({
        label: financialKey,
        backgroundColor:'rgba(97, 194, 115,0.8)',
        data: financialData,
        categoryPercentage:0.5,
        maxBarThickness: 20,
        borderWidth:2,
        borderColor:'rgb(89, 89, 89)'
    })

    return {
        datasets,
        labels:financialLabels
    }
}

export function calculateRatioPriceChart(ratioChart,ratioChartComponents,options){

    const { tickerPriceData,labels } = ratioChartComponents

    let ratioData = ratioChart.datasets[0].data
    let gradient = calculateChartBorderGradient(ratioData,options)

    let dataSets=[]

    dataSets.push({
        label: 'Stock Price',
        pointRadius:0,
        pointHitRadius:0,
        borderColor:gradient,
        borderWidth:5,
        data: tickerPriceData,    
    })

    return {
        datasets:dataSets,
        labels: labels
    }
}

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
            fill:'red',   
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

export function calculateFinancialChartComponents(ticker,options){

    let selectedStatement = options.selected
    let financialData = ticker.filterByDate(selectedStatement,options)
    if(selectedStatement==='dividends'){
        financialData = ticker.filterByDate('incomeStatement',options)
    }
    let dividends = ticker.dividendData

    let data1=[]
    let data2=[]
    let data3=[]
    let data4=[]
    let labels=[]
    
    financialData.forEach(item =>{
        switch(selectedStatement){
            case 'incomeStatement':
                data1.unshift(item.revenue)
                data2.unshift(item.netIncome)                
                data3.unshift((item.netIncome/item.revenue)*100)
                break
            case 'balanceSheet':
                data1.unshift(item.currentAssets)
                data2.unshift(item.currentLiabilities)
                data3.unshift(item.currentAssets/item.currentLiabilities)
                break
            case 'cashFlow':
                data1.unshift(item.operatingCashFlow)
                data2.unshift(item.investingCashFlow)
                data3.unshift(item.financingCashFlow)
                data4.unshift(item.operatingCashFlow-item.capEx)
                break
            case 'dividends':
                let yearDivs = dividends.filter(div => new Date(div.date).getFullYear()===new Date(item.date).getFullYear())
                    .reduce((a,c)=>a+c.dividend,0)
                data1.unshift(item.eps)      
                data2.unshift(yearDivs)   
                data3.unshift((yearDivs/item.eps)*100)   
            default: break
        }
        labels.unshift(item.date.substring(0, 7))
    })
    let fullFinancialData = ticker.getTickerData(selectedStatement)
    return { data1, data2, data3, data4, labels, financialData, fullFinancialData }
}

export function calculateFinancialChart(chartComponents,options){
    const {
        data1,
        data2,
        data3,
        data4,
        labels,
    } = chartComponents

    let selectedStatement = options.selected 

    let bg1=[]
    let bg2=[]
    let bg3=[]

    let label1=''
    let label2=''
    let label3=''
    let label4=''

    switch(selectedStatement){
        case 'incomeStatement':
            bg1 = data1.map(item => 'rgba(70, 125, 189,0.8)')
            bg2 = data1.map(item => 'rgba(97, 194, 115,0.8)')
            label1='Revenue'            
            label2='Net Income'    
            label3='Profit Margin'              
            break
        case 'balanceSheet':
            bg1 = data1.map(item => 'rgba(97, 194, 115,0.8)')
            bg2 = data1.map(item => 'rgba(194, 128, 128,0.8)')
            label1='Current Assets'
            label2='Current Liabilities'
            label3='Current Ratio'
            break
        case 'cashFlow':
            bg1 = data1.map(item => 'rgba(70, 125, 189,0.8)')
            bg2 = data1.map(item => 'rgba(252, 236, 3,0.6)')
            bg3 = data1.map(item => 'rgba(194, 128, 128,0.8)')
            label1='Operating Cashflow'        
            label2='Investing Cashflow'        
            label3='Financing Cashflow'        
            label4='Free Cashflow'        
            break
        case 'dividends':
            bg1 = data1.map(item => 'rgba(70, 125, 189,0.8)')
            bg2 = data1.map(item => 'rgba(194, 128, 128,0.8)')
            label1='EPS'            
            label2='Dividend'    
            label3='Payout Ratio'    
        default: break
    }

    let dataSets = [];
    
    dataSets.push({
        label: label1,
        backgroundColor:bg1,
        yAxisID: 'y-axis-1',
        pointRadius:0,
        pointHitRadius:5,
        borderColor:'black',
        data: data1,   
        categoryPercentage:0.5 
    })
    dataSets.push({
        label: label2,
        backgroundColor:bg2,
        yAxisID: 'y-axis-1',
        pointRadius:0,
        pointHitRadius:5,
        borderColor:'black',
        data: data2,    
        categoryPercentage:0.5
    })

    if(
        selectedStatement==='incomeStatement'||
        selectedStatement==='dividends'||
        selectedStatement==='balanceSheet'
    ){
        dataSets.push({
            type:'line',
            label: label3,
            yAxisID: 'y-axis-2',
            pointRadius:0,
            pointHitRadius:5,
            borderColor:'dimgray',
            data: data3,    
            categoryPercentage:0.5,
            fill: false,
            datalabels: {
                display: true,
                backgroundColor:'dimgray',
                borderRadius:5,
                color:'white',
                padding:3,
                formatter: function(value, context) {
                    let text = value>=10?value.toFixed(0):value.toFixed(1)
                    if(selectedStatement!=='balanceSheet') text+='%'
                    return text
                }
            }
        })            
    }    
    if(selectedStatement==='cashFlow'){
        dataSets.push({
            label: label3,
            backgroundColor:bg3,
            pointRadius:0,
            pointHitRadius:5,
            borderColor:'black',
            data: data3,    
            categoryPercentage:0.5
        })
        dataSets.push({
            label: label4,
            borderColor:'black',
            data: data4,   
            type: 'line' 
        })
    }
    return {
        datasets:dataSets,
        labels: labels
    }    

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

export function calculateRatioChart(ratioChartComponents,options){

    const { data, labels } = ratioChartComponents

    let dataSets=[]

    const key = options.selected
    const ratioName = getRatioName(key)

    dataSets.push({
        label: ratioName,
        pointRadius:0,
        pointHitRadius:0,
        borderColor:'black',
        data: data,    
    })

    return {
        datasets:dataSets,
        labels: labels
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

    priceData = priceData.filter((item,index) => { return index%4===0})

    let { price, financials, yearlyData } = ticker.analytics   

    let {
        epsGrowthRate, 
        futureEpsGrowthRate,
        lastFullFinancialYear,
        latestEps={eps:0},
        freeCashFlow,
        startingFreeCashFlow
    } = financials

    let today = new Date()
    for(var i=0;i<120;i++){
        today.setMonth(today.getMonth()+1)
        priceData.push({
            date:today.toISOString(),
            close:price.starting
        })
    }
    
    yearlyData = {...yearlyData}
    price.latestPE = price.starting/latestEps.eps
    const peDiscount = price.futurePE/price.latestPE

    for(var i=lastFullFinancialYear+1;i<lastFullFinancialYear+11;i++){
        yearlyData[i]={
            div: yearlyData[lastFullFinancialYear].div,
            revenue: yearlyData[lastFullFinancialYear].revenue,
            grossProfit: yearlyData[lastFullFinancialYear].grossProfit,
            netIncome: yearlyData[lastFullFinancialYear].netIncome,
            freeCashFlow: startingFreeCashFlow,
            eps: latestEps.eps,
            date:i+'-11'
        }
    }

    let data = priceData.map(item => item.close)
    let labels = priceData.map(item => new Date(item.date).getFullYear())

    let pricePast=[]
    let priceForecast=[]
    let dividendForecast=[]

    let financialData={
        eps:{data:[],colors:[],color:'rgba(13, 191, 85,0.9)',hidden:false},
        div:{data:[],colors:[],color:'rgba(201, 85, 85,0.9)',hidden:false},
        revenue:{data:[],colors:[],color:'rgba(13,135,212,0.9)',hidden:true},
        grossProfit:{data:[],colors:[],color:'rgba(159, 166, 85,0.9)',hidden:true},
        netIncome:{data:[],colors:[],color:'rgba(12,199,15,0.9)',hidden:true},
        freeCashFlow:{data:[],colors:[],color:'rgba(99, 168, 144,0.9)',hidden:true},
    }

    if(epsGrowthRate<0){
        epsGrowthRate=0.05
    }

    let numberOfIterations=1
    let totalDividends=0
    let forecastedDividends=0
    

    priceData.forEach((item,index) =>{

        let future = new Date(item.date)<new Date()
        let year = new Date(item.date).getFullYear()
        let yearlyDataFound = false;

        if(future){
            pricePast.push(item.close)
            priceForecast.push(item.close)   
            dividendForecast.push(item.close)
            if(yearlyData[year]){
                if(yearlyData[year].date===item.date.substring(0,7)){
                    Object.keys(financialData).forEach(item =>{
                        financialData[item].data.push(yearlyData[year][item])
                    })
                    yearlyDataFound = true
                    delete yearlyData[year]
                }              
            }
        }else{
            let discount = 1-((1-peDiscount)*numberOfIterations/120)
            let interest = (item.close*(1 + futureEpsGrowthRate/12)**(numberOfIterations))*discount
            priceForecast.push(interest)                  
            numberOfIterations++ 
            if(yearlyData[year]){
                if(yearlyData[year].date===item.date.substring(0,7)){
                    Object.keys(financialData).forEach(item =>{
                        let calculatedValue = yearlyData[year][item] * (1 + (futureEpsGrowthRate)/12)**(numberOfIterations)
                        if(item==='div'){
                            totalDividends+=calculatedValue
                            forecastedDividends+=calculatedValue                            
                        }
                        financialData[item].data.push(calculatedValue)
                    })
                    yearlyDataFound = true                    
                    delete yearlyData[year]
                }              
            }
            dividendForecast.push(interest+totalDividends)
        }    

        Object.keys(financialData).forEach(item =>{
            let color = financialData[item].color
            if(!future){
                color = color.split('.')[0]+'.3)'
            }
            financialData[item].colors.push(color)
            if(!yearlyDataFound){
                financialData[item].data.push(0)                
            }
        })
    })

    let dcfTable = calculateDCF(ticker,financials, yearlyData )

    let futurePrice = priceForecast[priceForecast.length-1]
    let futureTotalPrice = dividendForecast[dividendForecast.length-1]
    let annualPriceReturn = ((futurePrice/price.starting)**(1/10))-1
    let annualTotalReturn = ((futureTotalPrice/price.starting)**(1/10))-1

    price.ending = futurePrice
    price.forecastedDividends = forecastedDividends

    let annualReturn={
        price: annualPriceReturn,
        div: annualTotalReturn - annualPriceReturn,
        total: annualTotalReturn
    }

    ticker.analytics = {
        ...ticker.analytics,
        price,
        annualReturn,
    }

    let forecastChart = {
        datasets:[
            {
                label:'Price',
                data:pricePast,
                borderColor:'black',
                pointRadius:0,
                fill:false,
            },
            {
                label:'Price Forecast',                
                data:priceForecast,
                pointBackgroundColor:'rgba(0,0,0,0)',
                pointRadius:0,
                lineColor:'green',                
                borderColor:'green',
                fill:false,               
            },
            {
                label:'Dividend Forecast',                
                data:dividendForecast,
                pointBorderRadius:0,
                pointRadius:0,
                lineColor:'yellow',
                pointBackgroundColor:'rgba(0,0,0,0)',
                borderColor:'yellow',
                fill:false,               
            },
        ],
        labels 
    }

    let datasets =[] 
    
    Object.keys(financialData).forEach(dataName =>{
        datasets.push({
            label:camelCaseToString(dataName),
            type:'bar',
            data:financialData[dataName].data,
            backgroundColor:financialData[dataName].colors,
            barPercentage: 0.5,
            barThickness: 10,    
            borderWidth:2,
            borderColor:financialData[dataName].colors[financialData[dataName].colors.length-1],
            hidden:financialData[dataName].hidden   
        })
    })

    let financialChart={
        categoryPercentage:5,
        datasets:datasets,
        labels
    }

    let freeCashFlowChart = {
        categoryPercentage:5,
        datasets:[
            {
                label:'Free Cash Flow',
                type:'bar',
                data:financialData.freeCashFlow.data,
                backgroundColor:financialData.freeCashFlow.colors,
                barPercentage: 0.5,
                barThickness: 10,    
                borderWidth:2,
            }
        ],
        labels
    }

    return {forecastChart,financialChart,freeCashFlowChart,dcfTable}
}

function calculateDCF(ticker,financials, yearlyData ){

    let cashFlow = financials.startingFreeCashFlow
    let shortTerm = 10
    let discountRate = Number(financials.dcfDiscountRate);
    let discountRateGrowth = 1.1;
    let growthRate = Number(financials.futureEpsGrowthRate)+1
    let perpetuity = Number(financials.perpetuityGrowth);
    let shareCount = financials.shareCount;
    let sharePrice = ticker.analytics.price.starting;
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
                    console.log('breaK')
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