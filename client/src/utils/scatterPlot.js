import { camelCaseToString } from "./utils";

export default function ScatterPlot(tickers){
    this.tickers = tickers||[]
    this.scatterOptions = scatterOptions
    this.selectedRatios = {
        y:'pb',
        x:'roe'
    }
    this.ratios=[]
    this.chartData = {}
    this.chartOptions = {
        responsive:true,
        maintainAspectRatio: false,
    }
    this.init = () => handleInit(this)
    this.setOption = (option) => handleSetOption(this,option)
    this.setScatterAxis = (value,axis) => handleSetScatterAxis(this,value,axis)
    this.updateChart = () => handleUpdateChart(this)
}

function handleInit(scatterPlot){
    if(scatterPlot.tickers[0]){
        let ratios = Object.keys(scatterPlot.tickers[0].ratios).filter(item => item!=='date')
        ratios.unshift('selectRatio')
        scatterPlot.ratios = ratios
        scatterPlot.updateChart()
    }
}

function handleSetOption(scatterPlot,option){
    const { x, y } = option
    scatterPlot.selectedRatios={
        y,
        x
    }
    scatterPlot.updateChart()
    return scatterPlot
}

function handleSetScatterAxis(scatterPlot,value,axis){
    scatterPlot.selectedRatios[axis]=value
    const { y, x } = scatterPlot.selectedRatios
    if(y&&x){
        scatterPlot.updateChart()
    }
    return scatterPlot
}

function handleUpdateChart(scatterPlot){
    const { y, x } = scatterPlot.selectedRatios
    let data = scatterPlot.tickers.map(ticker =>{
        return{
            y:ticker.ratios[y],
            x:ticker.ratios[x],
            yName:camelCaseToString(y),
            xName:camelCaseToString(x),
            tickerName:ticker.name
        }
    })
    scatterPlot.chartData = getChartData(data)
    scatterPlot.chartOptions = getChartOptions(scatterPlot)
}
   



function getChartOptions(scatterPlot){

    const { y, x } = scatterPlot.selectedRatios

    const data = scatterPlot.chartData.labels
    let yData = data.map(item => item.y).filter(item => Number(item))
    let xData = data.map(item => item.x).filter(item => Number(item))

    let yMin = ratioOptions[y]?ratioOptions[y].min:Math.min(...yData)
    let yMax = ratioOptions[y]?ratioOptions[y].max:Math.max(...yData)
    let xMin = ratioOptions[x]?ratioOptions[x].min:Math.min(...xData)
    let xMax = ratioOptions[x]?ratioOptions[x].max:Math.max(...xData)

    return{
        responsive:true,
        maintainAspectRatio: false,
        tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                    let index = tooltipItem.index
                    var tickerName = data.labels[index].tickerName;
                    let yName = data.labels[index].yName;
                    let xName = data.labels[index].xName;
                    return tickerName
                },
                footer: function(tooltipItems, data) {
                    
                    let tooltipItem = tooltipItems[0]
                    if(!tooltipItem) return ''
                    let index = tooltipItem.index
                    let yName = data.labels[index].yName;
                    let xName = data.labels[index].xName;
                    return [
                        `${yName}:\t ${tooltipItem.yLabel}`, 
                        `${xName}:\t ${tooltipItem.xLabel}`,
                    ];
                }
            }
        },
        legend: {
            display: true,
            labels: {
                fontSize:30
            }
        },
        scales: {
            xAxes: [{
                    display: true,
                    ticks: {
                        min: xMin,
                        max: xMax
                    }
                }],
            yAxes: [{
                    display: true,
                    ticks: {
                        min: yMin,
                        max: yMax
                    }
                }]
        },
    }
}

function getChartData(data){

    let label = ''    
    if(data.length>0){
        label = `${data[0].yName} & ${data[0].xName}`
    }
    
    return{
        datasets: [
            {
              label,
              backgroundColor: 'rgba(75,192,192,0.4)',
              pointBorderColor: 'rgba(75,192,232,1)',
              pointBackgroundColor: 'dimgray',
              pointBorderWidth: 2,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: 'rgba(75,192,192,1)',
              pointHoverBorderColor: 'rgba(220,220,220,1)',
              pointHoverBorderWidth: 2,
              pointRadius: 7,
              pointHitRadius: 10,
              data
            }
        ],
        labels:data
    }
}

let scatterOptions=[
    { y:'pb', x:'roe' },
    { y:'payoutRatio', x:'divYield' },
    { y:'pe', x:'operatingMargin' },
    { y:'pe', x:'pb' },
    { y:'operatingMargin', x:'marketCap' },
    { y:'profitMargin', x:'roe' }
]

let ratioOptions = {
    pe:{min:0,max:60},
    pb:{min:0,max:10},
    divYield:{min:0,max:15},
    payoutRatio:{min:0,max:300},
    roe:{min:0,max:50},
    roa:{min:0,max:50},
    operatingMargin:{min:-10,max:100},
    profitMargin:{min:-10,max:100},
    currentRatio:{min:0,max:5},
    peg:{min:-20,max:20},
}