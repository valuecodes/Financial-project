import { 
    getFinancialKeyName, 
    calculateChartBorderGradient, 
    monthlyDividends,
    getRatioName
} from "./chartUtils";
import { randomColor, roundToTwoDecimal } from "./utils";

export function calculateRatioFinacialChart(chartComponents,options){
    const { financialData, financialLabels } = chartComponents

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

export function calculateRatioPriceChart(chartComponents,ratioChartComponents,options){
    let{
        data:ratioData
    } = ratioChartComponents
    
    let { 
        labels, 
        tickerPriceData, 
    } = chartComponents

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

export function calculatePriceChart(chartComponents,options){

    let { 
        labels, 
        data, 
        cumulativeDividends,      
        percentageChange, 
        percentageChangeWithDivs 
    } = chartComponents

    let dataSets=[]

    dataSets.push({
        label: 'Share Price',
        backgroundColor:'rgba(133, 133, 133,0.8)',
        pointRadius:0,
        pointHitRadius:5,
        borderColor:'black',
        data: data,    
        percentageChange,
        percentageChangeWithDivs,
        options
    })

    dataSets.push({
        label: 'Dividends',
        backgroundColor:'rgba(255, 234, 94,0.2)',            
        pointRadius:0,
        borderColor:'yellow',
        data:cumulativeDividends,
        percentageChange,
        percentageChangeWithDivs,
        options  
    })

    return {
        datasets:dataSets,
        labels: labels
    }
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
            break
        case 'balanceSheet':
            bg1 = data1.map(item => 'rgba(97, 194, 115,0.8)')
            bg2 = data1.map(item => 'rgba(194, 128, 128,0.8)')
            label1='Current Assets'
            label2='Current Liabilities'
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
        default: return ''
    }

    let dataSets = [];

    dataSets.push({
        label: label1,
        backgroundColor:bg1,
        pointRadius:0,
        pointHitRadius:5,
        borderColor:'black',
        data: data1,   
        categoryPercentage:0.5 
    })
    dataSets.push({
        label: label2,
        backgroundColor:bg2,
        pointRadius:0,
        pointHitRadius:5,
        borderColor:'black',
        data: data2,    
        categoryPercentage:0.5
    })

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

export function calculateEventChart(chartComponents,options){
    let { 
        labels, 
        data, 
        percentageChange, 
        percentageChangeWithDivs,
        events,
    } = chartComponents

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

export function calculateRatioChart(chartComponents,options){
    let { 
        labels, 
        data, 
    } = chartComponents

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