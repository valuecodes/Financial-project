import { camelCaseToString, uniqueValuesArray, regress } from "./utils";
import { datalabels } from 'chartjs-plugin-datalabels'
import { TickerRatio } from "./tickerRatio";
import annotation from "chartjs-plugin-annotation";
import { zoom } from 'chartjs-plugin-zoom'

export default function ScatterPlot(tickers=[],tickerRatios=[],portfolio){
    this.tickers = tickers
    this.tickerRatios = tickerRatios.map(item => new TickerRatio(item))
    this.scatterOptions = scatterOptions    
    this.portfolio = portfolio
    this.ratios=[]
    this.countries={}
    this.sectors={}
    this.highlight = "myPortfolio.myPortfolio"
    this.highlightColor = '#90ee90'
    this.selectedRatios = {
        y:'pb',
        x:'roe'
    }
    this.filterTotals={
        sectors:0,
        sectorsSelected:0,
        countries:0,
        countriesSelected:0
    }
    this.filterTickers={
        category:'sectors',
        selectedTickers:['AKTIA','EVLI','EQV1V']
    }
    this.chartControls={
        scale:true,
        regression:true,
        average:false,
        colors:false
    }
    this.chartData = {}
    this.chartOptions = {
        responsive:true,
        maintainAspectRatio: false,
    }
    this.fullData = []
    this.historical = tickerRatios.length?true:false
    this.init = () => handleInit(this)
    this.changeMode = (historical) => handleChangeMode(this,historical)
    this.setOption = (option) => handleSetOption(this,option)
    this.filterValue = (newValue) => handleFilterValue(this,newValue)
    this.filterSelectAll = (filterName) => handleFilterSelectAll(this,filterName)
    this.setHighlight = (value) => handleSetHighlight(this,value)
    this.setHighlightColor = value => handleSetHighlightColor(this,value)
    this.setScatterAxis = (value,axis) => handleSetScatterAxis(this,value,axis)
    this.updateChart = () => handleUpdateChart(this)
    this.setChartData = (data) =>  handleSetChartData(this,data)
    this.setChartOptions = () => handleSetChartOptions(this)
    this.updateFilterTotals = () => handleUpdateFilterTotals(this)
    this.filterData = (data) => handleFilterData(this,data)

    this.filterTicker = (ticker) => handleFilterTicker(this,ticker)
}

function handleInit(scatterPlot){
    if(scatterPlot.tickers[0]){
        let ratios = Object.keys(scatterPlot.tickers[0].ratios).filter(item => item!=='date')
        let countries={}
        let countriesArray = uniqueValuesArray(scatterPlot.tickers,'country')
        countriesArray.forEach(country =>{
            countries[country] = {
                name:country,
                selected:true,
                filterName:'countries',
                count: scatterPlot.tickers.filter(item=>item.country===country).length,
                tickers:scatterPlot.tickers.filter(item=>item.country===country)
            }
        })
        
        let sectors = {} 
        let sectorsArray = uniqueValuesArray(scatterPlot.tickers,'sector')
        sectorsArray.forEach(sector =>{
            sectors[sector]={
                name:sector,
                selected:true,
                filterName:'sectors',    
                count: scatterPlot.tickers.filter(item=>item.sector===sector).length,
                tickers: scatterPlot.tickers.filter(item=>item.sector===sector) 
            }
        })
        
        scatterPlot.ratios = ratios
        scatterPlot.countries = countries
        scatterPlot.sectors = sectors
        if(scatterPlot.tickerRatios.length>0){
            scatterPlot.chartControls.scale = false
            scatterPlot.chartControls.regression = false            
            scatterPlot.chartControls.average = false            
        }
        scatterPlot.updateFilterTotals()        
        scatterPlot.updateChart()
    }
    return scatterPlot
}

function handleChangeMode(scatterPlot,historical){
    scatterPlot.historical = historical
    scatterPlot.chartControls.regression = !historical
    scatterPlot.chartControls.average = false          
    scatterPlot.updateChart()
    return scatterPlot
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

function handleFilterValue(scatterPlot,newValue){
    const { name, selected, filterName } = newValue
    scatterPlot[filterName][name].selected = !selected
    scatterPlot.updateFilterTotals()
    scatterPlot.updateChart()
    return scatterPlot
}

function handleFilterSelectAll(scatterPlot,filterName){
    let firstFilter = Object.keys(scatterPlot[filterName])[0]
    let selecteAll = !scatterPlot[filterName][firstFilter].selected
    Object.keys(scatterPlot[filterName]).forEach(item =>scatterPlot[filterName][item].selected=selecteAll)
    scatterPlot.updateFilterTotals()    
    scatterPlot.updateChart()
    return scatterPlot
}

function handleSetHighlight(scatterPlot,value){
    scatterPlot.highlight=value
    scatterPlot.updateChart()
    return scatterPlot
}

function handleSetHighlightColor(scatterPlot,value){
    scatterPlot.highlightColor=value
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

function handleUpdateFilterTotals(scatterPlot){

    let countries =  Object.keys(scatterPlot.countries).length
    let sectors = Object.keys(scatterPlot.sectors).length
    let countriesSelected = Object.keys(scatterPlot.countries)
        .filter(item => scatterPlot.countries[item].selected).length

    let sectorsSelected = Object.keys(scatterPlot.sectors)
        .filter(item => scatterPlot.sectors[item].selected).length

    scatterPlot.filterTotals.countries = countries
    scatterPlot.filterTotals.countriesSelected = countriesSelected
    scatterPlot.filterTotals.sectors = sectors
    scatterPlot.filterTotals.sectorsSelected = sectorsSelected
    
}

function handleUpdateChart(scatterPlot){
    const { y, x } = scatterPlot.selectedRatios
    let data = scatterPlot.tickers.map(ticker =>{
        return{
            y:ticker.ratios[y],
            x:ticker.ratios[x],
            yName:camelCaseToString(y),
            xName:camelCaseToString(x),
            tickerName:ticker.name,
            ticker:ticker.ticker,
            country:ticker.country,
            sector:ticker.sector,
            ratioOptionsY:ratioOptions[y]?ratioOptions[y]:{min:-Infinity,max:Infinity},
            ratioOptionsX:ratioOptions[x]?ratioOptions[x]:{min:-Infinity,max:Infinity}
        }
    })
    scatterPlot.fullData = data
    let filteredData = scatterPlot.filterData(data)
    scatterPlot.setChartData(filteredData)
    scatterPlot.setChartOptions(scatterPlot)
    return scatterPlot
}

function handleSetChartOptions(scatterPlot){

    const { scale, average } = scatterPlot.chartControls
    const { y, x } = scatterPlot.selectedRatios

    let data = scatterPlot.chartData.labels    

    if(!scale){
        data = scatterPlot.chartData.datasets
            .filter(item => item.label!=='Regression chart')
            .map(item => item.data)
            .flat(1)
            .filter(item => item!==undefined)
    }
    if(data[0]===undefined) data = []

    let yData = data.map(item => item.y).filter(item => Number(item))
    let xData = data.map(item => item.x).filter(item => Number(item))

    let yMin = ratioOptions[y]&&scale?ratioOptions[y].min:Math.min(...yData)
    let yMax = ratioOptions[y]&&scale?ratioOptions[y].max:Math.max(...yData)
    let xMin = ratioOptions[x]&&scale?ratioOptions[x].min:Math.min(...xData)
    let xMax = ratioOptions[x]&&scale?ratioOptions[x].max:Math.max(...xData)

    if(!scale){
        yMin=yMin>0?0:yMin
        xMin=xMin>0?0:xMin
        yMax=yMax*1.1
        xMax=xMax*1.1
    }

    let annotations = calculatioAnnotationsData(scatterPlot)

    scatterPlot.chartOptions={
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                align:'end',
                anchor:'center',
                color:'black',
                font:{
                    size:11
                },
                formatter: function(value, context) {
                    if(context.datasetIndex>0){
                        if(value.yName) return value.yName
                        if(value.averageY) return value.y.toFixed(2)
                        if(value.averageX) return value.x.toFixed(2)
                        return ''
                    } 
                    if(!value) return''
                    return value.ticker;
                }
            },zoom: {
                pan: {
                    enabled: true,
                    mode: 'xy',
                    rangeMin: {
                        x: null,
                        y: null
                    },
                    rangeMax: {
                        x: null,
                        y: null
                    },
                    speed: 20,
                    threshold: 10,
                },
                zoom: {
                    enabled: true,
                    mode: 'xy',
                    rangeMin: {
                        x: null,
                        y: null
                    },
                    rangeMax: {
                        x: null,
                        y: null
                    },
                    speed: 0.1,
                    threshold: 0.1,
                    sensitivity: 3,
                }
            }

        },
        annotation: {
            drawTime: 'beforeDatasetsDraw',
            annotations:annotations
        },
        tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                    const { index, datasetIndex } = tooltipItem
                    console.log(tooltipItem,data)
                    if(data.datasets[datasetIndex].data[index].historicTicker){
                        return data.datasets[datasetIndex].data[index].historicTicker+' '+
                        data.datasets[datasetIndex].data[index].yName
                    }    
                    if(datasetIndex>0) return''
                    let tickerName = data.labels[index].tickerName;
                    return tickerName
                },
                footer: function(tooltipItems, data) {
                    
                    let tooltipItem = tooltipItems[0]
                    const { datasetIndex, index } = tooltipItem
                    
                    if(data.datasets[datasetIndex].data[index].historicTicker){
                        let y = data.datasets[datasetIndex].data[index].yRatio
                        let x = data.datasets[datasetIndex].data[index].xRatio
                        return [
                            `${y}:\t ${tooltipItem.yLabel}`, 
                            `${x}:\t ${tooltipItem.xLabel}`,
                        ];
                    }

                    if(!tooltipItem) return ''
                    if(datasetIndex>0) return ''                    
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
            display: false,
            labels: {
                fontSize:25
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

function handleSetChartData(scatterPlot,data){

    let scatterData = calculateScatterData(scatterPlot,data) 
    let historicData = calculateHistoricalData(scatterPlot,data)
    let regressionData = calculateRegressionData(scatterPlot,data)
    let averageData = calculateAverageData(scatterPlot,data)

    scatterPlot.chartData={
        datasets: [
            scatterData,
            regressionData,
            ...historicData,
            ...averageData
        ],
        labels:data
    }
}

function handleFilterData(scatterPlot,data){
    let filteredData = []

    let sectorsToRemove = Object.keys(scatterPlot.sectors)
        .filter(item => !scatterPlot.sectors[item].selected)
    let countriesToRemove = Object.keys(scatterPlot.countries)
        .filter(item => !scatterPlot.countries[item].selected)
    
    data.forEach((item,index) =>{
        let remove = false
        let country = item.country
        let sector = item.sector
        if(sectorsToRemove.find(item => item === sector)){
            remove=true
        }
        if(countriesToRemove.find(item => item === country)){
            remove=true
        }
        if(!remove){
            filteredData.push(item)
        }
    })

    if(scatterPlot.historical){
        const { selectedTickers } = scatterPlot.filterTickers
        filteredData = data.filter(item => selectedTickers.includes(item.ticker))
    }

    return filteredData
}

function handleFilterTicker(scatterPlot,ticker){
    let found = scatterPlot.filterTickers.selectedTickers.findIndex(item => item ===ticker)

    if(found===-1){
        scatterPlot.filterTickers.selectedTickers.push(ticker)
    }else{
        scatterPlot.filterTickers.selectedTickers.splice(found,1)
    }

    scatterPlot.updateFilterTotals()
    scatterPlot.updateChart()
    return scatterPlot
}

function calculateScatterData(scatterPlot, data){

    let highlightColor = scatterPlot.highlightColor
    let filter = scatterPlot.highlight.split('.')[0]
    let value = scatterPlot.highlight.split('.')[1]

    let tickers = []
    
    switch(filter){
        case 'myPortfolio':
            if(scatterPlot.portfolio){
                tickers = scatterPlot.portfolio.tickers.map(ticker => ticker.ticker)
            }
            break
        case 'countries':
            tickers =  scatterPlot.tickers.filter(item =>item.country===value).map(item => item.ticker)
            break
        case 'sectors':
            tickers =  scatterPlot.tickers.filter(item =>item.sector===value).map(item => item.ticker)
            break
        default: tickers = scatterPlot.tickers
    }

    let pointBackgroundColor = []
    let pointRadius = []
    
    data.forEach(item =>{
        if(tickers.find(elem=>elem===item.ticker)){
            pointBackgroundColor.push(highlightColor)
            pointRadius.push(10)
        }else{
            pointBackgroundColor.push('dimgray')
            pointRadius.push(7)
        }
    })

    return {
        label:'ScatterChart',
        backgroundColor: highlightColor,
        pointBorderColor: 'rgba(51, 51, 51,1)',
        pointBackgroundColor:pointBackgroundColor,
        pointBorderWidth: 2,
        pointHoverRadius: 12,
        pointHoverBorderWidth: 2,
        pointRadius:pointRadius,
        pointHitRadius: 10,
        order:10,
        data
      }

}

function calculateHistoricalData(scatterPlot, data){

    let tickerKeys = data.map(item => item.ticker)
    let tickerRatios = scatterPlot.tickerRatios.filter(item => tickerKeys.includes(item.ticker))
    
    const {
        y:yRatio,
        x:xRatio
    } = scatterPlot.selectedRatios

    let historicData = [{label:'Historic'}]

    if(scatterPlot.historical) {
        historicData = tickerRatios.map(ticker =>{
            let historic = ticker.getScatterChart(yRatio,xRatio)
            let tickerLatest = scatterPlot.tickers.find(item => item.ticker === ticker.ticker).ratios
            historic.data.unshift({            
                y: tickerLatest[yRatio],
                x: tickerLatest[xRatio],
                yName: '',
                xName:'',
                year:true,
                historicTicker:scatterPlot.ticker
            })
            historic.pointRadius.unshift(0.01)
            historic.pointHitRadius.unshift(0.01)
            return historic
        })        
    }

    return historicData
}

function calculateRegressionData(scatterPlot,data){

    const { regression } = scatterPlot.chartControls

    if(!regression) return {label: 'Regression chart',}

    let regressionData = data.filter(item =>
        item.x>item.ratioOptionsX.min&&
        item.x<item.ratioOptionsX.max&&
        item.y>item.ratioOptionsY.min&&
        item.y<item.ratioOptionsY.max
    )

    let yPoints = regressionData.map(item => item.y)
    let xPoints = regressionData.map(item => item.x)

    let regData = regress(xPoints,yPoints)

    return {
        label: 'Regression chart',
        borderColor:'rgba(26, 26, 26,0.4)',
        borderWidth:2,
        data: [{
                x: 0,
                y: regData.intercept
            }, 
            {
                x: 5000000,
                y: regData.slope*5000000
            }
        ],
        order:-2,
        type: 'line',
        fill: false,
    }
}

function calculateAverageData(scatterPlot,data){

    const fullData = scatterPlot.fullData

    const { average } = scatterPlot.chartControls

    if(!average) return []

    let xAverage = fullData.reduce((a,c) => a + c.x ,0) / fullData.length  
    let yAverage = fullData.reduce((a,c) => a + c.y ,0) / fullData.length

    const { y, x } = scatterPlot.selectedRatios

    let yMax = ratioOptions[y]?ratioOptions[y].max:yAverage
    let xMax = ratioOptions[x]?ratioOptions[x].max:xAverage

    let xLine = {
        label: 'X-Average',
        borderColor:'rgba(26, 26, 26,0.4)',
        borderWidth:2,
        pointRadius:5,
        data:[{
            x:xAverage,
            y:0
        },{
            x:xAverage,
            y:yMax*0.9,
            averageX:true,
        }],
        type: 'line',
        fill: false,
    }
    let yLine = {
        label: 'Y-Average',
        borderColor:'rgba(26, 26, 26,0.4)',
        borderWidth:2,
        pointRadius:5,        
        data:[{
            x:0,
            y:yAverage
        },{
            x:xMax*0.9,
            y:yAverage,
            averageY:true,            
        }],
        type: 'line',
        fill: false,
    }

    return [xLine,yLine]
}

function calculatioAnnotationsData(scatterPlot){

    const { colors } = scatterPlot.chartControls

    if(!colors) return []

    const { y, x } = scatterPlot.selectedRatios
    let yMax = ratioOptions[y]?ratioOptions[y].max/3:100
    let xMax = ratioOptions[x]?ratioOptions[x].max/3:100
    let annotations = []

    let opacity = 0.5
    let red = `rgba(255, 55, 0,${opacity})`
    let orange = `rgba(255, 106, 0,${opacity})`
    let yellow = `rgba(255, 255, 0,${opacity})`
    let lightgreen = `rgba(168, 255, 69,${opacity})`
    let green = `rgba(0, 255, 8,${opacity})`

    let areaColors = [[yellow,orange,red],[lightgreen,yellow,orange],[green,lightgreen,yellow]]

    if(y==='profitMargin'){     
        areaColors = areaColors.map(item => item.reverse())
    }

    if(x==='pb'||x==='pe'){
        areaColors = areaColors.reverse()     
    }

    for(let i=1;i<=3;i++){
        for(let a=1;a<=3;a++){
            annotations.push({
                type: 'box',
                xScaleID: 'x-axis-1',
                yScaleID: 'y-axis-1',
                xMin: (i-1)*xMax,
                xMax: i*xMax,
                yMin: (a-1)*yMax,
                yMax: a*yMax,
                backgroundColor: areaColors[i-1][a-1],
                borderWidth: 1,
            })
        }
    }
    return annotations
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
    divYield:{min:0,max:13},
    payoutRatio:{min:0,max:150},
    roe:{min:0,max:50},
    roa:{min:0,max:50},
    operatingMargin:{min:-10,max:100},
    profitMargin:{min:-10,max:60},
    currentRatio:{min:0,max:5},
    peg:{min:-20,max:20},
}