import { camelCaseToString, uniqueValuesArray } from "./utils";
import { datalabels } from 'chartjs-plugin-datalabels'
import { TickerRatio } from "./tickerRatio";

export default function ScatterPlot(tickers,tickerRatios=[],portfolio){
    this.tickers = tickers||[]
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
    this.chartData = {}
    this.chartOptions = {
        responsive:true,
        maintainAspectRatio: false,
    }
    this.historical =tickerRatios.length?true:false
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
        scatterPlot.updateFilterTotals()        
        scatterPlot.updateChart()
    }
}

function handleChangeMode(scatterPlot,historical){
    scatterPlot.historical = historical
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
            sector:ticker.sector
        }
    })
    let filteredData = scatterPlot.filterData(data)
    scatterPlot.setChartData(filteredData)
    scatterPlot.setChartOptions(scatterPlot)
    return scatterPlot
}

function handleSetChartOptions(scatterPlot){

    const { y, x } = scatterPlot.selectedRatios

    const data = scatterPlot.chartData.labels
    let yData = data.map(item => item.y).filter(item => Number(item))
    let xData = data.map(item => item.x).filter(item => Number(item))

    let yMin = ratioOptions[y]?ratioOptions[y].min:Math.min(...yData)
    let yMax = ratioOptions[y]?ratioOptions[y].max:Math.max(...yData)
    let xMin = ratioOptions[x]?ratioOptions[x].min:Math.min(...xData)
    let xMax = ratioOptions[x]?ratioOptions[x].max:Math.max(...xData)

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
                    if(context.datasetIndex>0) return value.yName
                    return value.ticker;
                }
            }
        },
        tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                    if(tooltipItem.datasetIndex>0) return ''
                    let index = tooltipItem.index
                    var tickerName = data.labels[index].tickerName;
                    return tickerName
                },
                footer: function(tooltipItems, data) {
                    
                    let tooltipItem = tooltipItems[0]
                    if(!tooltipItem) return ''
                    if(tooltipItem.datasetIndex>0) return ''                    
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

    const {
        y:yRatio,
        x:xRatio
    } = scatterPlot.selectedRatios

    let label = ''    
    if(data.length>0){
        label = `${data[0].yName} & ${data[0].xName}`
    }

    let highlightColor = scatterPlot.highlightColor
    let filter = scatterPlot.highlight.split('.')[0]
    let value = scatterPlot.highlight.split('.')[1]

    let tickers = []
    let tickerRatios = []

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

    let tickerKeys = data.map(item => item.ticker)
    tickerRatios = scatterPlot.tickerRatios.filter(item => tickerKeys.includes(item.ticker))

    let historicData =[{}]

    if(scatterPlot.historical) {
        historicData = tickerRatios.map(ticker =>{
            let historic = ticker.getScatterChart(yRatio,xRatio)
            let tickerLatest = scatterPlot.tickers.find(item => item.ticker === ticker.ticker).ratios
            historic.data.unshift({            
                y: tickerLatest[yRatio],
                x: tickerLatest[xRatio],
                yName: '',
                xName:''
            })
            return historic
        })        
    }


    scatterPlot.chartData={
        datasets: [
            {
              label,
              backgroundColor: highlightColor,
            //   pointBorderColor: 'rgba(75,192,232,1)',
              pointBorderColor: 'rgba(51, 51, 51,1)',
              pointBackgroundColor:pointBackgroundColor,
              pointBorderWidth: 2,
              pointHoverRadius: 12,
            //   pointHoverBackgroundColor: 'rgba(75,192,192,1)',
            //   pointHoverBorderColor: 'rgba(220,220,220,1)',
              pointHoverBorderWidth: 2,
              pointRadius:pointRadius,
              pointHitRadius: 10,
              data
            },
            ...historicData,
            // {
            //     label: 'Line Dataset',
            //     data: [{
            //         x: 0,
            //         y: 0
            //     }, {
            //         x: 5,
            //         y: 7
            //     }, {
            //         x: 9,
            //         y: 9
            //     }],
            //     type: 'line',
            //     fill:false,
                
            //     // this dataset is drawn on top
            //     order: 2
            // },
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
    console.log(scatterPlot,scatterPlot.historical)
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