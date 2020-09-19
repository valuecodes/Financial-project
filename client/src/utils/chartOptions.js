import { formatMillions, formatCurrency } from "./utils";

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
            custom: function(tooltipModel) {
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
                    for(var z=0;z<2;z++){
                        if(document.getElementById('chartjs-tooltip'+z)){
                            document.getElementById('chartjs-tooltip'+z).style.opacity=0;
                        }
                        if(document.getElementById('chartjs-tooltip-line'+z)){
                            document.getElementById('chartjs-tooltip-line'+z).style.opacity=0;
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

export function ratioChartOptions(ratioChartRef,ratioPriceChartRef){
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

                        function formatRatio(text,ratio){
                            switch(ratio){
                                case 'Historical PE-ratio':
                                    return 'P/E '+text
                                case 'Historical PB-ratio':
                                    return 'P/B '+text
                                case 'Historical Dividend Yield':
                                    return text+'%'
                                default: return ''
                            }
                        }

                        function setTooltipPoint(item,chart){                    
                            let chartKey = Object.keys(chart.props.data.datasets[0]['_meta'])[0]
                            let position = chart.chartInstance.canvas.getBoundingClientRect()
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

export function barChartOptions(){
    return{    
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                // display: false,
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
            titleFontColor:'rgba(0,0,0,0)',
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
                        tooltipLine.style.left = position.left + window.pageXOffset +tooltipModel.caretX +16+ 'px';
                        tooltipLine.style.top = position.top + window.pageYOffset + tooltipModel.dataPoints[i].y+(i===0?0:-32) + 'px';
                        tooltipLine.style.backgroundColor='dimgray'
                        tooltipLine.style.color='white'
                        tooltipLine.style.padding='5px'
                        tooltipLine.style.fontSize='16px'
                        tooltipLine.style.borderRadius='5px'
                    }                    
                }else{
                    for(var q=0;q<2;q++){
                        if(document.getElementById('chartjs-tooltip'+q)){
                            document.getElementById('chartjs-tooltip'+q).style.opacity=0;
                        }
                        if(document.getElementById('chartjs-tooltip-line'+q)){
                            document.getElementById('chartjs-tooltip-line'+q).style.opacity=0;
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