import { camelCaseToString, formatCurrency, formatMillions, randomColor } from "./utils";

export function getChartOptions(tooltipLabels, tooltipFooters){

    return {
        legend: {
            display: false,
        },
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: false,
                color: 'black',
                // align: 'end',
                // font: {
                //     size: 12,
                // }
            },
        },
        tooltips: {
            // enabled: !state.dividendYield,

            // backgroundColor:'red',
            // cornerRadius: 1,
            callbacks: {
                label: function (tooltipItem, data) {
                    console.log(tooltipItem)
                    return data.datasets[0].tooltipLabels[tooltipItem.index]
                },
                // labelColor: function(tooltipItem, chart) {
                //     console.log(tooltipItem,chart)
                //     return {
                //         borderColor: 'rgb(255, 0, 0)',
                //         backgroundColor: 'rgb(255, 0, 0)'
                //     };
                // },
                // footer: function (tooltipItem, data) {
                //     console.log(tooltipItem)
                //     let items = data.datasets[0].tooltipFooters[tooltipItem[0].index]
                //     let array=[]
                //     if(items.length>1){
                //         items.forEach(item => {
                //             array.push(
                //                 'Name: '+item.name+
                //                 ' \Transaction: '+item.volume*item.price+
                //                 ' \Type: '+item.type,
                //             )
                //         });     
                //     }else{
                //         items.forEach(item => {
                //             array.push(
                //                 'Name: '+item.name,
                //                 'Title: '+item.position,
                //                 'Volume: '+item.volume,
                //                 'Price: '+item.price,
                //                 'Type: '+item.type,
                //             )
                //         });                        
                //     }

                //     console.log(array)
                //     return array
                // }
            }
        }
    }
}

function normalize(min, max) {
    var delta = max - min;
    return function (val) {
        return (val - min) / delta;
    };
}

function getColorFromRedToGreenByPercentage(percent) {
    const r = 255 * percent/100;
    const g = 255 - (255 * percent/100);
    return 'rgb('+r+','+g+',0)';
}

export function calculateChartGradient(data){

    var ctx = document.getElementById('canvas').getContext("2d")
    let height=Number(document.getElementById('canvas').style.height.substring(0, document.getElementById('canvas').style.height.length - 2))
    var gradient = ctx.createLinearGradient(0, 0, 0, height*0.92)
    let max = Math.max(...data)
    let min = Math.min(...data)
    let percentage=0
    let red=0
    let barData=data.map(item => max*1)
    if(min<0){
        percentage= 1- Math.abs(min)/(max+Math.abs(min))
        red=1            
        gradient.addColorStop(0, 'green')
        gradient.addColorStop(percentage, 'white')
        gradient.addColorStop(red, 'red')
    }else{
        percentage=1
        red=1
        gradient.addColorStop(0, 'green')
        gradient.addColorStop(percentage, 'white')
    }
    return gradient
}

function mapBetween(currentNum, minAllowed, maxAllowed, min, max) {
    return (maxAllowed - minAllowed) * (currentNum- min) / (max - min) + minAllowed;
  }


function calculateChartBorderGradient(data,options){

    var ctx = document.getElementById('ratioPriceChart').getContext("2d")
    let height=Number(document.getElementById('ratioPriceChart').style.height.substring(0, document.getElementById('ratioPriceChart').style.height.length - 2))
    
    var gradient = ctx.createLinearGradient(0, 0, 1200,0 )
     
    let max = Math.max(...data)
    let min = Math.min(...data)
    
    const key = options.selected
    if(key === 'dividendYield'){
        max = Math.min(...data)
        min = Math.max(...data)
    }
    
    if(max>60) max = 60

    data.forEach((item,index) =>{
        
        if((data.length/index)!==Infinity){
            let percentage = mapBetween(item,0,100,min,max)
            gradient.addColorStop(index/data.length, getColorFromRedToGreenByPercentage(percentage))
        }
    })

    return gradient
}

export function calculateEventChart(chartComponents,options){
    let { 
        labels, 
        data, 
        cumulativeDividends,
        cumulativeDividendsPrice,        
        percentageChange, 
        percentageChangeWithDivs,
        events,
    } = chartComponents

    const {        
        points, 
        pointColors, 
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
        tradePointColors
    }= events
    console.log(userDivPoints,tradePoints,)
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
    var ctx = document.getElementById('ratioPriceChart').getContext("2d");

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

function getRatioName(key){
    switch(key){
        case 'pe':
            return 'Historical PE-ratio'
        case 'pb':
            return 'Historical PB-ratio'
        case 'dividendYield':
            return 'Historical Dividend Yield'
        default: return ''
    }
}

function getFinancialKeyName(key){
    switch(key){
        case 'pe':
            return 'Earnings per share'
        case 'pb':
            return 'Book value per share'
        case 'dividendYield':
            return 'Dividend history'
        default: return ''
    }
}

export function calculateRatioFinacialChart(chartComponents,options){
    const { financialData, financialLabels } = chartComponents

    const key = options.selected
    const financialKey = getFinancialKeyName(key)

    let datasets=[]
    datasets.push({
        label: financialKey,
        barThickness: 30,
        maxBarThickness: 30,
        minBarLength: 2,
        backgroundColor:'lightgreen',
        data: financialData,
        barPercentage:0.5
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

    var ctx = document.getElementById('ratioPriceChart').getContext("2d");
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
        cumulativeDividendsPrice,        
        percentageChange, 
        percentageChangeWithDivs 
    } = chartComponents
    
    let gradient = calculateChartGradient(data)
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
        // backgroundColor:'yellow',
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
    }

    let dataSets = [];

    dataSets.push({
        label: label1,
        backgroundColor:bg1,
        pointRadius:0,
        pointHitRadius:5,
        borderColor:'black',
        data: data1,    
    })
    dataSets.push({
        label: label2,
        backgroundColor:bg2,
        pointRadius:0,
        pointHitRadius:5,
        borderColor:'black',
        data: data2,    
    })

    if(selectedStatement==='cashFlow'){
        dataSets.push({
            label: label3,
            backgroundColor:bg3,
            pointRadius:0,
            pointHitRadius:5,
            borderColor:'black',
            data: data3,    
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

function monthlyDividends(userDividends,min,max){

    userDividends=userDividends.filter(item => item.date.getFullYear()===min)

    let data=[]    
    let count=0  
    let total=0
    let yearDivs=[]
    for(var i=min;i<=max;i++){
        for(var a=1;a<=12;a++){
            let divFound=true
            let divs=[];
            while(divFound){
                if(count===userDividends.length) break
                if(userDividends[count].year===i&&userDividends[count].month===a){
                    divs.push(userDividends[count])
                    count++
                }else{
                    divFound=false
                }
            }
            
            data.push({
                date:new Date(i,a),
                divAmount:divs.reduce((a,c)=>a+(c.payment),0),
                dividends:divs,
                label:i+'/'+a,
            })

            if(count===userDividends.length) break
        }
    }

    return data
}

export function priceChartOptions(data,options,chart){

    let min = Math.min(...data)
    let max = Math.max(...data)
    let minOffset = (max-min)*0.1*(min>=0?-1:1)

    let startFromZero=false

    if(chart){
        let chartKey = Object.keys(chart.current.props.data.datasets[0]['_meta'])[0]        
        if(chart.current.props.data.datasets[0]['_meta'][chartKey].hidden){
            startFromZero=true
        }
    }

    return {
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: false,
            }
        },
        legend: {
            // display: false,
            // position:'right',
            align:'start',
            labels: {
                fontSize:20,

            },
        },
        layout: {
            padding: {
                left: 0,
                right: 0,
                top: 20,
                bottom: 0
            }
        },        
        scales: {
            xAxes: [{
                gridLines: {
                    // color: "rgba(0, 0, 0, 0)",
                },    
                ticks: {
                    maxTicksLimit: 8,
                    maxRotation: 0,
                    minRotation: 0,
                    min: 5
                    // beginAtZero: false,
                },
                // barPercentage: 1.1
            }],
            yAxes: [{
                gridLines: {
                    // color: "rgba(0, 0, 0, 0)",
                },
                stacked: true,
                ticks: {
                    maxTicksLimit: 20,
                    min:startFromZero?0:min+minOffset,
                    beginAtZero:startFromZero
                }
            }]
        },
        tooltips: {
            mode: 'index',
            intersect: false,
            titleFontColor:'rgba(0,0,0,0)',
            enabled:false,
            custom: function(tooltipModel,i,a) {
                if(tooltipModel.dataPoints){
                    let tooltipPoints = tooltipModel.dataPoints.length
                    for(var i=0;i<tooltipPoints;i++){
                        let tooltip = document.getElementById('chartjs-tooltip'+i);
                        let tooltipLine =  document.getElementById('chartjs-tooltip-line'+i);
                        if(!tooltip){
                            tooltip = document.createElement('div');                 
                            tooltip.id = 'chartjs-tooltip'+i;
                            tooltip.innerHTML = '<table></table>';
                            document.body.appendChild(tooltip)
                        }
    
                        if(!tooltipLine){
                            tooltipLine = document.createElement('div');                 
                            tooltipLine.id = 'chartjs-tooltip-line'+i;
                            tooltipLine.innerHTML = '<table></table>';
                            document.body.appendChild(tooltipLine)
                        }
    
                        if (tooltipModel.opacity === 0) {
                            tooltip.style.opacity = 0;
                            return;
                        }
    
                        function getBody(bodyItem) {
                            return bodyItem.lines;
                        }       
    
                        // Set Text 
                        if (tooltipModel.body) {
                            var bodyLines = tooltipModel.body.map(getBody);
                            var tableRoot = tooltipLine.querySelector('table');
                            tableRoot.textContent = bodyLines[i];
                        }
    
                        var position = this._chart.canvas.getBoundingClientRect();
                        tooltip.style.opacity = 1;
                        tooltip.style.position = 'absolute';
                        tooltip.style.left = position.left + window.pageXOffset +tooltipModel.caretX-6  + 'px';
                        tooltip.style.top = position.top + window.pageYOffset + tooltipModel.dataPoints[i].y-6+ 'px';
                        tooltip.style.pointerEvents = 'none';
                        tooltip.style.width = '10px';
                        tooltip.style.height = '10px';
                        tooltip.style.borderRadius = '20px';
                        tooltip.style.border = '2px solid black';
                        tooltip.style.backgroundColor = 'white';
    
                        tooltipLine.style.opacity = 1;
                        tooltipLine.style.position = 'absolute';
                        tooltipLine.style.left = position.left + window.pageXOffset +tooltipModel.caretX +10+ 'px';
                        tooltipLine.style.top = position.top + window.pageYOffset + tooltipModel.dataPoints[i].y+(i===0?5:-22) + 'px';
                        tooltipLine.style.backgroundColor='dimgray'
                        tooltipLine.style.color='white'
                        tooltipLine.style.fontSize='15px'
                        tooltipLine.style.borderRadius='25%'
                        tooltipLine.style.border='3px solid black'

                    }                    
                }else{
                    for(var i=0;i<2;i++){
                        if(document.getElementById('chartjs-tooltip'+i)){
                            document.getElementById('chartjs-tooltip'+i).style.opacity=0;
                        }
                        if(document.getElementById('chartjs-tooltip-line'+i)){
                            document.getElementById('chartjs-tooltip-line'+i).style.opacity=0;
                        }
                    }
                }
            },
            callbacks: {
                label: function (tooltipItem, data) {
                    const { datasetIndex,index } = tooltipItem
                    // tt.current.textContent=`${formatCurrency( tooltipItem.yLabel)}`
                    let currentData = (datasetIndex===0?data.datasets[datasetIndex].percentageChange[index]:data.datasets[datasetIndex].percentageChangeWithDivs[index])+'%'
                    // if(data.datasets[datasetIndex].options.price.chartType.selectedOption==='dividends'){
                    //     currentData = data.datasets[datasetIndex].data[index].toFixed(2)+'$'
                    // }
                    return currentData
                }
            }
        }   
    }

}

export function financialChartOptions(options){

    return{    
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: false,
            },
        },            

        legend: {
            position:'right',
            align:'start',
            
            labels: {
                fontSize:20,
                // padding:'100px',
            },
        },
        tooltips: {
            mode: 'index',
            intersect: false,
            callbacks: {
                label: function (tooltipItem, data) {
                    return formatMillions(tooltipItem.yLabel)+'M'
                }
            }
        },
        barValueSpacing: 1,
        scales: {            
            xAxes: [{  
                ticks: {
                    maxTicksLimit: 8,
                    maxRotation: 0,
                    minRotation: 0,
                },
                categoryPercentage:0.5,
            }],
            yAxes: [{  
                ticks: {
                    maxTicksLimit: 8,
                    maxRotation: 0,
                    minRotation: 0,
                    suggestedMin: 0, 
                },
            }],
        },

    }
}

export function eventChartOptions(){
    return{    
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: false,
            },
        },     
        legend: {
            position:'right',
            align:'start',
            labels: {
                fontSize:20,
            },
        },
        scales: {            
            xAxes: [{  
                ticks: {
                    maxTicksLimit: 8,
                    maxRotation: 0,
                    minRotation: 0,
                },
            }],
            yAxes: [{  
                ticks: {
                    maxTicksLimit: 8,
                    maxRotation: 0,
                    minRotation: 0
                },
            }],
        },
        
        tooltips: {
            mode: 'index',
            callbacks: {
                label: function (tooltipItem, data) {
                    if(tooltipItem.datasetIndex===1){
                        return data.datasets[1].tooltipLabels[tooltipItem.index]
                    }
                    if(tooltipItem.datasetIndex===2){
                        return data.datasets[2].tooltipLabels[tooltipItem.index]
                    }
                    if(tooltipItem.datasetIndex===3){
                        return data.datasets[3].tooltipLabels[tooltipItem.index]
                    }
                    if(tooltipItem.datasetIndex===4){
                        return data.datasets[4].tooltipLabels[tooltipItem.index]
                    }
                    
                },
            }
        },

    }
} 