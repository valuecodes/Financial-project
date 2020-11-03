import { formatMillions, formatCurrency } from "./utils";
import annotation from "chartjs-plugin-annotation";

export function MACDDataOptions(){
    return {
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: false,
            }
        },
        legend: {
            display:false,
            align:'start',
            labels: {
                fontSize:20,
            },
        },
    }

}

export function priceChartOptions(ticker,options){
    const { selected } = options
    
    const {data,oscillator} = ticker.priceChart.data.datasets[0]
    const datasets = ticker.priceChart.data.datasets

    let min = Math.min(...data)
    let max = Math.max(...data)
    let minOffset = (max-min)*0.1*(min>=0?-1:1)

    let startFromZero=false

    return {
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: false,
            },     
        },
        legend: {
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
                ticks: {
                    maxTicksLimit: 8,
                    maxRotation: 0,
                    minRotation: 0,
                    min: 5
                },
            }],
            yAxes: [{
                stacked: selected==='priceChart'?true:false,
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
            custom: function(tooltipModel,index) {
                if(tooltipModel.dataPoints){
                    let tooltipPoints = tooltipModel.dataPoints.length
                    for(var i=0;i<tooltipPoints;i++){
                        
                        if(selected==='movingAverages'&&i<2){
                            continue
                        }
                        if(selected==='MACD'&&i<2){
                            continue
                        }
                        addTooltip(this,i,tooltipModel,i,selected,datasets)
                        addTooltipText(this,i,tooltipModel,selected,datasets)
                    }                    
                }else{
                    clearAllTooltips()
                }
            },
            callbacks: {
                label: function (tooltipItem, data) {
                    const { datasetIndex,index } = tooltipItem
                    let text=''
                    text = data.datasets[datasetIndex].percentageChange[index]+'%'
                    if(selected==='stochasticOscillator'){
                        let value = (oscillator[index]+100)/2
                        let valueText = 'Neutral'
                        if(value<=20) valueText='Oversold'
                        if(value>=80) valueText='Overbought'
                        text = `${valueText} (${value.toFixed(1)})` 
                    }
                    if(selected==='MACD'){
                        text=tooltipItem.value
                    }
                    if(selected==='movingAverages'){
                        text = tooltipItem.value
                    }
                    if(datasetIndex===1){
                        text = data.datasets[datasetIndex].percentageChangeWithDivs[index]+'%'
                    }
                    return text
                }
            }
        }   
    }
}

export function financialChartOptions(options){

    const { selected } = options

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
        tooltips: {
            mode: 'index',
            intersect: false,
            callbacks: {
                label: function (tooltipItem, data) {
                    const { datasetIndex } = tooltipItem
                    let text = formatMillions(tooltipItem.yLabel)+'M'
                    if(datasetIndex===2&&selected!=='cashFlow'){
                        text = tooltipItem.yLabel.toFixed(1)
                        if(selected!=='balanceSheet'){
                            text+='%'
                        }
                    }
                    return text
                }
            }
        },
        barValueSpacing: 1,
        scales: {            
            xAxes: [{  
                ticks: {
                    maxTicksLimit: 16,
                    maxRotation: 0,
                    minRotation: 0,
                },
            }],
            yAxes: [
                {  
                    id: 'y-axis-1',
                    ticks: {
                        maxTicksLimit: 8,
                        maxRotation: 0,
                        minRotation: 0,
                        suggestedMin: 0, 
                    },
                },
                {                      
                    type: 'linear',
                    display: true,
                    position: 'right',
                    id: 'y-axis-2',
                    ticks: {
                        maxTicksLimit: 8,
                        maxRotation: 0,
                        minRotation: 0,
                        suggestedMin: 0, 
                    },
                    gridLines: {
                        display:false
                    }   
                }
            ],
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

function createRatioAnnotations(ratioData,options){
    
    const { selected } = options
    let annotations=[]
    let ratioMin=0
    let ratioMax=0
    if(ratioData){
        let data =[] 
        if(ratioData.datasets){
            data = ratioData.datasets[0].data
        }
        
        ratioMin = Math.min(...data)
        ratioMax = Math.max(...data)
        let averageTop=ratioMax-(ratioMax-ratioMin)/3
        let averageBot=ratioMin+(ratioMax-ratioMin)/3
        annotations.push({
            type: 'box',
            xScaleID: 'x-axis-0',
            yScaleID: 'y-axis-0',
            xMin: 0,
            xMax: 2000,
            yMin: averageTop,
            yMax: ratioMax,
            backgroundColor: selected!=='dividendYield'?'rgba(252, 3, 3,0.2)':'rgba(3, 252, 94,0.2)',
            borderWidth: 1,
        })
        annotations.push({
            type: 'box',
            xScaleID: 'x-axis-0',
            yScaleID: 'y-axis-0',
            xMin: 0,
            xMax: 2000,
            yMin: averageBot,
            yMax: averageTop,
            backgroundColor: 'rgba(235, 252, 3,0.2)',
            borderWidth: 1,
        })
        annotations.push({
            type: 'box',
            xScaleID: 'x-axis-0',
            yScaleID: 'y-axis-0',
            xMin: 0,
            xMax: 2000,
            yMin: ratioMin,
            yMax: averageBot,
            backgroundColor: selected!=='dividendYield'?'rgba(3, 252, 94,0.2)':'rgba(252, 3, 3,0.2)',
            borderWidth: 1,
        })
    }    
    return {annotations,ratioMin,ratioMax}
}

export function ratioChartOptions(ratioChartRef,ratioPriceChartRef,options,ratioData=null){

    let {annotations,ratioMax,ratioMin} = createRatioAnnotations(ratioData,options)
    return {    
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: false,
            },
        },
        annotation: {
            drawTime: 'beforeDatasetsDraw',
            annotations:annotations
        },
        layout: {
            padding: {
               left     : 0,
               right    : 0,
               top      : 0,
               bottom   : 0
            }
          },
        fontSize:20,
        legend: {
            align:'start',
            padding:20,
            labels: {
                fontSize: 20,
                padding:20,
                fontColor:'white',
                boxWidth: 0,
            }
        },
        tooltips: {
            mode: 'index',
            intersect: false,
            titleFontColor:'rgba(0,0,0,0)',
            enabled:false,
            custom: function(tooltipModel) {

                let ratioChart = ratioChartRef.current
                let ratioPrice = ratioPriceChartRef.current
                
                let toolTipItems=[
                    {id:'tooltipRatio',type:'point',chart:ratioChart,chartIndex:0},
                    {id:'toolTipPrice',type:'point',chart:ratioPrice,chartIndex:1},
                    {id:'tooltipRatioLabel',type:'label',chart:ratioChart,chartIndex:0},
                    {id:'toolTipPricelabel',type:'label',chart:ratioPrice,chartIndex:1},
                ]

                if(tooltipModel.dataPoints){

                    let tooltipPoints = tooltipModel.dataPoints.length
                    let index = tooltipModel.dataPoints[0].index

                    for(var i=0;i<tooltipPoints;i++){
                        toolTipItems.forEach((item,index) =>{
                            let tooltipItem = document.getElementById(item.id);
                            if(!tooltipItem){
                                tooltipItem = createTooltipItem(item) 
                            }                            
                            switch(item.type){
                                case 'point':
                                    setTooltipPoint(tooltipItem,item.chart,item.chartIndex)
                                    break
                                case 'label':
                                    setToolTipLabel(tooltipItem,item.chart,item.chartIndex)
                                    break
                                default:
                            }
                        })

                        function createTooltipItem(item){
                            let tooltipItem = document.createElement('div');                 
                            tooltipItem.id = item.id;
                            tooltipItem.innerHTML = '<table></table>';
                            document.body.appendChild(tooltipItem) 
                            return tooltipItem
                        }

                        function setToolTipLabel(item,chart,chartIndex){  

                            if (tooltipModel.body) {
                                let text =chart.props.data.datasets[0].data[index].toFixed(1)
                                var tableRoot = item.querySelector('table');
                                if(chartIndex===0){
                                    text = formatRatio(text,chart.props.data.datasets[0].label)
                                }else{
                                    text = text + '$'
                                }
                                tableRoot.textContent = text;
                            }      

                            let chartKey = Object.keys(chart.props.data.datasets[0]['_meta'])[0]
                            let position = chart.chartInstance.canvas.getBoundingClientRect()

                            if(chart.props.data.datasets[0]['_meta'][chartKey].data[index]){
                                item.style.opacity = 1;
                                item.style.position = 'absolute';
                                item.style.left = position.left + window.pageXOffset +tooltipModel.caretX+15  + 'px';
                                item.style.top = position.top + window.pageYOffset + chart.props.data.datasets[0]['_meta'][chartKey].data[index]['_model'].y-6+ 'px';
                                item.style.backgroundColor='dimgray'
                                item.style.color='white'
                                item.style.fontSize='15px'
                                item.style.borderRadius='25%'                                
                                item.style.padding='5px'                                  
                            }

                        }

                        function setTooltipPoint(item,chart){                    
                            let chartKey = Object.keys(chart.props.data.datasets[0]['_meta'])[0]
                            let position = chart.chartInstance.canvas.getBoundingClientRect()
                            if(chart.props){
                                if(chart.props.data.datasets[0]['_meta'][chartKey].data[index]){
                                    item.style.opacity = 1;
                                    item.style.position = 'absolute';
                                    item.style.left = position.left + window.pageXOffset +tooltipModel.caretX-6  + 'px';
                                    item.style.top = position.top + window.pageYOffset + chart.props.data.datasets[0]['_meta'][chartKey].data[index]['_model'].y-6+ 'px';
                                    item.style.pointerEvents = 'none';
                                    item.style.width = '10px';
                                    item.style.height = '10px';
                                    item.style.borderRadius = '20px';
                                    item.style.border = '2px solid black';
                                    item.style.backgroundColor = 'white';                                   
                                }                                   
                            }
      
                        }

                    }                    
                }else{
                    toolTipItems.forEach(item =>{
                        if(document.getElementById(item.id)){
                            document.getElementById(item.id).style.opacity=0;
                        }     
                    })
                }
            },
            callbacks: {
                label: function (tooltipItem, data) {
                    return tooltipItem.yLabel.toFixed(1)+'$'
            }}
        },  
        scales: {
            xAxes: [{   
                ticks: {
                    maxTicksLimit: 8,
                    maxRotation: 0,
                    minRotation: 0
                },
            }],
             yAxes:[{
                ticks:{
                    min:ratioMin,
                    max:ratioMax                  
                }
            }]
        },
    }
}                        
function formatRatio(text,ratio){
    switch(ratio){
        case 'Historical PE-ratio':
            return 'P/E '+text
        case 'Historical PB-ratio':
            return 'P/B '+text
        case 'Historical Dividend Yield':
            return text+'%'
        case 'Historical EV / Ebit':
            return 'EV / EBIT '+ text
        case 'Historical Price to Sales':
            return 'P/S '+ text
        default: return text
    }
}

export function ratioChartPriceOptions(ratioChartRef,ratioPriceChartRef,options,ratioData=null){

    return {    
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: false,
            },
        },
        layout: {
            padding: {
               left     : 0,
               right    : 0,
               top      : 0,
               bottom   : 0
            }
          },
        fontSize:20,
        legend: {
            align:'start',
            padding:20,
            labels: {
                fontSize: 20,
                padding:20,
                fontColor:'white',
                boxWidth: 0,
            }
        },
        tooltips: {
            mode: 'index',
            intersect: false,
            titleFontColor:'rgba(0,0,0,0)',
            enabled:false,
            custom: function(tooltipModel) {

                let ratioChart = ratioChartRef.current
                let ratioPrice = ratioPriceChartRef.current
                
                let toolTipItems=[
                    {id:'tooltipRatio',type:'point',chart:ratioChart,chartIndex:0},
                    {id:'toolTipPrice',type:'point',chart:ratioPrice,chartIndex:1},
                    {id:'tooltipRatioLabel',type:'label',chart:ratioChart,chartIndex:0},
                    {id:'toolTipPricelabel',type:'label',chart:ratioPrice,chartIndex:1},
                ]

                if(tooltipModel.dataPoints){

                    let tooltipPoints = tooltipModel.dataPoints.length
                    let index = tooltipModel.dataPoints[0].index

                    for(var i=0;i<tooltipPoints;i++){
                        toolTipItems.forEach((item,index) =>{
                            let tooltipItem = document.getElementById(item.id);
                            if(!tooltipItem){
                                tooltipItem = createTooltipItem(item) 
                            }                            
                            switch(item.type){
                                case 'point':
                                    setTooltipPoint(tooltipItem,item.chart,item.chartIndex)
                                    break
                                case 'label':
                                    setToolTipLabel(tooltipItem,item.chart,item.chartIndex)
                                    break
                                default:
                            }
                        })

                        function createTooltipItem(item){
                            let tooltipItem = document.createElement('div');                 
                            tooltipItem.id = item.id;
                            tooltipItem.innerHTML = '<table></table>';
                            document.body.appendChild(tooltipItem) 
                            return tooltipItem
                        }

                        function setToolTipLabel(item,chart,chartIndex){  

                            if (tooltipModel.body) {
                                let text =chart.props.data.datasets[0].data[index].toFixed(1)
                                var tableRoot = item.querySelector('table');
                                if(chartIndex===0){
                                    text = formatRatio(text,chart.props.data.datasets[0].label)
                                }else{
                                    text = text + '$'
                                }
                                tableRoot.textContent = text;
                            }      

                            let chartKey = Object.keys(chart.props.data.datasets[0]['_meta'])[0]
                            let position = chart.chartInstance.canvas.getBoundingClientRect()

                            if(chart.props.data.datasets[0]['_meta'][chartKey].data[index]){
                                item.style.opacity = 1;
                                item.style.position = 'absolute';
                                item.style.left = position.left + window.pageXOffset +tooltipModel.caretX+15  + 'px';
                                item.style.top = position.top + window.pageYOffset + chart.props.data.datasets[0]['_meta'][chartKey].data[index]['_model'].y-6+ 'px';
                                item.style.backgroundColor='dimgray'
                                item.style.color='white'
                                item.style.fontSize='15px'
                                item.style.borderRadius='25%'                                
                                item.style.padding='5px'                                  
                            }

                        }

                        function setTooltipPoint(item,chart){                    
                            let chartKey = Object.keys(chart.props.data.datasets[0]['_meta'])[0]
                            let position = chart.chartInstance.canvas.getBoundingClientRect()
                            if(chart.props){
                                if(chart.props.data.datasets[0]['_meta'][chartKey].data[index]){
                                    item.style.opacity = 1;
                                    item.style.position = 'absolute';
                                    item.style.left = position.left + window.pageXOffset +tooltipModel.caretX-6  + 'px';
                                    item.style.top = position.top + window.pageYOffset + chart.props.data.datasets[0]['_meta'][chartKey].data[index]['_model'].y-6+ 'px';
                                    item.style.pointerEvents = 'none';
                                    item.style.width = '10px';
                                    item.style.height = '10px';
                                    item.style.borderRadius = '20px';
                                    item.style.border = '2px solid black';
                                    item.style.backgroundColor = 'white';                                   
                                }                                   
                            }
      
                        }

                    }                    
                }else{
                    toolTipItems.forEach(item =>{
                        if(document.getElementById(item.id)){
                            document.getElementById(item.id).style.opacity=0;
                        }     
                    })
                }
            },
            callbacks: {
                label: function (tooltipItem, data) {
                    return tooltipItem.yLabel.toFixed(1)+'$'
            }}
        },  
        scales: {
            xAxes: [{   
                ticks: {
                    maxTicksLimit: 8,
                    maxRotation: 0,
                    minRotation: 0
                },
            }],
        },
    }
}

export function barChartOptions(options){
    return{    
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                color:'white',
                backgroundColor:'rgba(92, 92, 92,0.2)',
                align:'center',
                anchor:'center',
                borderRadius:20,
                formatter: (value, ctx) => {
                    if(!value) return ''
                    return value.toFixed(1);
                },
            },
        },
        fontSize:20,
        legend: {
            align:'start',
            padding:20,
            labels: {
                fontSize: 20,
                padding:20,
                fontColor:'white',
                boxWidth: 0,
            }
        },
        tooltips: {
            mode: 'index',
            intersect: false,
            callbacks: {
                label: function (tooltipItem, data) {
                    const { datasetIndex } = tooltipItem
                    let value = tooltipItem.yLabel
                    let label = data.datasets[datasetIndex].label
                    if(options.selected==='ev/ebit'){
                        value = formatMillions(value)+'M'
                    }else{
                        value=value.toFixed(2)
                    }
                    return label+' '+value
                }
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    barPercentage:0.5
                },
                // categoryPercentage:0.5,
            }],
        }
    }
}

export function portfolioChartOptions(){
    return {        
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: false,
            },
        },
        legend: {
            display: false,
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
                    color: "rgba(0, 0, 0, 0)",
                },
                barPercentage: 1.1
            }],
            yAxes: [{
                gridLines: {
                    color: "rgba(0, 0, 0, 0)",
                },
                stacked:true,
                ticks: {
                    maxTicksLimit: 20,
                    // minTicksLimit:6
                    // Include a dollar sign in the ticks
                    callback: function(value, index, values) {
                        return '$' + value;
                    }}
            }]
        },
        tooltips: {
            mode: 'index',
            intersect: false,
            titleFontColor:'rgba(0,0,0,0)',
            enabled:false,
            custom: function(tooltipModel) {
                if(tooltipModel.dataPoints){
                    let tooltipPoints = tooltipModel.dataPoints.length
                    for(var i=0;i<tooltipPoints;i++){
                        let tooltip = document.getElementById('chartjs-tooltip'+i);
                        let tooltipText =  document.getElementById('chartjs-tooltip-text'+i);
                        if(!tooltip){
                            tooltip = document.createElement('div');                 
                            tooltip.id = 'chartjs-tooltip'+i;
                            tooltip.innerHTML = '<table></table>';
                            document.body.appendChild(tooltip)
                        }

                        if(!tooltipText){
                            tooltipText = document.createElement('div');                 
                            tooltipText.id = 'chartjs-tooltip-text'+i;
                            tooltipText.innerHTML = '<table></table>';
                            document.body.appendChild(tooltipText)
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
                            var tableRoot = tooltipText.querySelector('table');
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

                        tooltipText.style.opacity = 1;
                        tooltipText.style.position = 'absolute';
                        tooltipText.style.left = position.left + window.pageXOffset +tooltipModel.caretX +16+ 'px';
                        tooltipText.style.top = position.top + window.pageYOffset + tooltipModel.dataPoints[i].y+(i===0?0:-32) + 'px';
                        tooltipText.style.backgroundColor='dimgray'
                        tooltipText.style.color='white'
                        tooltipText.style.padding='5px'
                        tooltipText.style.fontSize='16px'
                        tooltipText.style.borderRadius='5px'
                    }                    
                }else{
                    for(var q=0;q<2;q++){
                        if(document.getElementById('chartjs-tooltip'+q)){
                            document.getElementById('chartjs-tooltip'+q).style.opacity=0;
                        }
                        if(document.getElementById('chartjs-tooltip-text'+q)){
                            document.getElementById('chartjs-tooltip-text'+q).style.opacity=0;
                        }
                    }
                }
            },
            callbacks: {
                label: function (tooltipItem, data) {
                    const { datasetIndex } = tooltipItem
                    if(datasetIndex===0){
                        return 'Price: ' + formatCurrency(tooltipItem.yLabel)
                    }
                    if(datasetIndex===1){
                        return 'Dividends: ' + formatCurrency(tooltipItem.yLabel)
                    }
                },
            }
        },

    }
}

export function portfolioDivChartOptions(){
    return {        
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: false,
            }
        },
        tooltips: {
            mode: 'index',
            intersect: false,
            titleFontColor:'rgba(0,0,0,0)',
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
                    maxRotation: 0,
                    minRotation: 0,
                },
            }],
        },
    }
}

export function portfolioStatChartOptions(title){
    return {        
        responsive:true,
        maintainAspectRatio: false,
        title: {
            display: true,
            text: title,
            fontSize:20
        },
        plugins: {
            datalabels: {
                display:true,
                formatter: (value, ctx) => {
                    let sum = 0;
                    let dataArr = ctx.chart.data.datasets[0].data;
                    dataArr.map(data => {
                        sum += data;
                    });
                    let percentage = (value*100 / sum).toFixed(2)+"%";
                    return percentage;
                },
                color: '#fff',
            }
        }
    }
}

function addTooltipText(chart,i,tooltipModel,selected,datasets){
    let tooltipText = document.getElementById('chartjs-tooltip-text'+i);
    if(!tooltipText){
        tooltipText = document.createElement('div');                 
        tooltipText.id = 'chartjs-tooltip-text'+i;
        tooltipText.innerHTML = '<table></table>';
        document.body.appendChild(tooltipText)
    }
    function getBody(bodyItem) {
        return bodyItem.lines;
    }       

    // Set Text 
    if (tooltipModel.body) {
        var bodyLines = tooltipModel.body.map(getBody);
        var tableRoot = tooltipText.querySelector('table');
        tableRoot.textContent = bodyLines[i];
    }
    var position = chart._chart.canvas.getBoundingClientRect();

    tooltipText.style.opacity = 1;
    tooltipText.style.position = 'absolute';
    tooltipText.style.left = position.left + window.pageXOffset +tooltipModel.caretX +10+ 'px';
    tooltipText.style.top = position.top + window.pageYOffset + tooltipModel.dataPoints[i].y+(i===0?5:-22) + 'px';
    tooltipText.style.backgroundColor='dimgray'
    tooltipText.style.color='white'
    tooltipText.style.fontSize='15px'
    tooltipText.style.borderLeft='5px solid white'
    tooltipText.style.padding = '2px';  

    let datasetIndex=tooltipModel.dataPoints[i].datasetIndex
    let index=tooltipModel.dataPoints[i].index

    if(selected==='priceChart'){
        let value = 0;
        if(datasetIndex===1){
            value=datasets[datasetIndex].percentageChangeWithDivs[index]
        }
        if(datasetIndex===0){
            value=datasets[datasetIndex].percentageChange[index]
        }
        tooltipText.style.borderLeft = value>=0?'5px solid lightgreen':'5px solid red'
    }
    if(selected==='stochasticOscillator'){
        let value = datasets[datasetIndex].oscillator[index]
        let color='white'
        if(value>=60)color='salmon'
        if(value<=-60)color='lightgreen'
        tooltipText.style.borderLeft = '5px solid '+'gray'  
        tooltipText.style.backgroundColor=color
        tooltipText.style.color='black'
    }
}

function addTooltip(chart,i,tooltipModel){
    let tooltip = document.getElementById('chartjs-tooltip'+i);
    if(!tooltip){
        tooltip = document.createElement('div');                 
        tooltip.id = 'chartjs-tooltip'+i;
        tooltip.innerHTML = '<table></table>';
        document.body.appendChild(tooltip)
    }
    if (tooltipModel.opacity === 0) {
        tooltip.style.opacity = 0;
        return;
    }

    var position = chart._chart.canvas.getBoundingClientRect();
    tooltip.style.opacity = 1;
    tooltip.style.position = 'absolute';
    tooltip.style.left = position.left + window.pageXOffset +tooltipModel.caretX-6  + 'px';
    tooltip.style.top = position.top + window.pageYOffset + tooltipModel.dataPoints[i].y-6+ 'px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.width = '10px';
    tooltip.style.height = '10px';
    tooltip.style.borderRadius = '20px';
    tooltip.style.border = '1px solid black';
    tooltip.style.backgroundColor = 'white';

}

function clearAllTooltips(){
    let tooltipNames=[
        'chartjs-tooltip-underline',
        'chartjs-tooltip-text',
        'chartjs-tooltip'
    ]
    for(var a=0;a<3;a++){
        tooltipNames.forEach(item =>{
            if(document.getElementById(item+a)){
                document.getElementById(item+a).style.opacity=0;
            }
        })
    }
}

export function calculateForecastChartOptions(forecastChart,ticker){

    const {   
        pricePercentageChange,
        totalPercentageChange,
        startingPrice,
        startingIndex,
        endingPrice,
        endingIndex
    } = ticker.analytics.forecastOutputs

    return{
        plugins: {
            datalabels: {
                display: true,
                borderRadius:20,
                color:'white',
                align:'top',
                borderWidth:1,
                borderColor:'dimgray',
                backgroundColor:function(context) {
                    return context.dataset.borderColor.split('.')[0]+'.5)'
                },
                color:function(context) {
                    return context.datasetIndex===1?'white':'black'
                },
                formatter: function(value, context) {
                    const { datasetIndex, dataIndex } = context
                    if(datasetIndex===1&&dataIndex===startingIndex){
                        return value.toFixed(2)+'$'
                    }
                    if(datasetIndex===1&&dataIndex===endingIndex){
                        return `${value.toFixed(2)}$ (${pricePercentageChange.toFixed(1)}%)`
                    }
                    if(datasetIndex===2&&dataIndex===endingIndex){
                        return `${value.toFixed(2)}$ (${totalPercentageChange.toFixed(1)}%)`
                    }
                    return  null;
                }
            }
        },
        layout: {
            padding: {
                left: 0,
                right: 50,
                top: 0,
                bottom:0 
            }
        },
        scales:{
            xAxes: [
                {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 20,
                        maxRotation: 0,
                        minRotation: 0,
                    }                    
                }
            ],
        }        
    }
}

export function calculateForecastFinancialsOptions(financialChart){

    return{
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: true,
                borderRadius:20,
                color:'white',
                align:'center',
                borderWidth:1,
                borderColor:'dimgray',
                font:{
                    size:11
                },
                backgroundColor:function(context) {
                    return context.dataset.borderColor.split('.')[0]+'.5)'
                },
                formatter: function(value, context) {
                    const { datasetIndex, dataIndex,dataset } = context
                    if(dataIndex===dataset.data.length-1||dataIndex===dataset.lastFullFinancialYearIndex){  
                        let number = value
                        let format = context.dataset.format
                        switch(format){
                            case '%':
                                number = (number*100).toFixed(1)+'%'
                                break
                            case 'M':
                                number = formatMillions(number)+' M'
                                break
                            default: number = number.toFixed(2)
                        }                   
                        return  number
                    }
                    return  null;
                }
            }
        },
        barValueSpacing: 1,
        layout: {
            padding: {
                left: 0,
                right: 25,
                top: 0,
                bottom:0,
                
            }
        },
        scales:{
            barValueSpacing: 15,
            xAxes: [
                { 
                    id:'normal',
                    ticks: {
                        display: false
                    },   
                    gridLines: {
                        display:false
                    },
                    offset: true,             
                },
                { 
                    id:'stacked',
                    stacked:true,
                    ticks: {
                        display: false
                    },   
                    gridLines: {
                        display:false
                    },
                    stack:'Stack 1'           
                },
                { 
                    id:'stacked2',
                    stacked:true,
                    ticks: {
                        display: false
                    },   
                    gridLines: {
                        display:false
                    },
                    stack:'Stack 2'           
                },
            ],
            yAxes: [
                {  
                    id: 'bar',
                    ticks: {
                        maxTicksLimit: 8,
                        maxRotation: 0,
                        minRotation: 0,
                        suggestedMin: 0, 
                    },
                },
                {  
                    id: 'barStacked',
                    display: false,                    
                    stacked:true,
                    ticks: {
                        maxTicksLimit: 8,
                        suggestedMin: 0, 
                    },
                    gridLines: {
                        display:false
                    }  
                },
                {  
                    type: 'linear',
                    display: true,
                    position: 'right',
                    id: 'line',
                    ticks: {
                        maxTicksLimit: 8,
                        maxRotation: 0,
                        minRotation: 0,
                        suggestedMin: 0, 
                    },
                    gridLines: {
                        display:false
                    }  
                },
            ]
        }        
    }
}