import { tickerInit, calculateFilterByDate, handleGetPriceRatio, addMovingAverages, addFinancialRatios, addAnalytics } from './calculations/tickerCalculations';
import train, { makePredictions } from './calculations/model';
import { randomColor, colorArray, normalize } from './utils';
import { input } from '@tensorflow/tfjs';

export default function MachineLearning(data){
    this.profile = data?data.profile:{}
    this.incomeStatement = data?data.incomeStatement:[]
    this.balanceSheet = data?data.balanceSheet:[]
    this.cashFlow = data?data.cashFlow:[]
    this.insiderTrading = data?data.insiderTrading:[]
    this.dividendData = data?data.dividendData:[]
    this.priceData = data?data.priceData:[]
    this.chart={
        priceChart:{},
        options:{
            responsive:true,
            maintainAspectRatio: false,
            plugins:{
                datalabels:{
                    display:false
                }
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            }            
        },
        ratioChart:{},
        predictionChart:{},
        ratiosChartOptions:{
            responsive:true,
            maintainAspectRatio: false,
            plugins:{
                datalabels:{
                    display:false
                }
            },
            tooltips: {
                mode: 'index',
                intersect: false,
                position:'nearest'
            },
            scales: {
                xAxes: [{
                    ticks: {
                        display: false
                    }
                }]
            }
        },
        lossChart:{   
            labels:[],     
            datasets:[{
                label:'Loss',
                data: [],
                borderColor: "black"
            }],
        }
    }
    this.ml={
        stage:0,
        stages:[
            {number:0, name:'selectTicker'},
            {number:1, name:'addTrainingData',icon:'ArrowForwardIosIcon',type:'button'},
            {number:2, name:'trainModel',icon:'ArrowForwardIosIcon',type:'button'},
            {number:3, name:'training',icon:'LoopIcon',spinning:true},
            {number:4, name:'validateModel',icon:'ArrowForwardIosIcon',type:'button'},
            {number:5, name:'makePrediction',icon:'ArrowForwardIosIcon',type:'button'},
        ],
        stats:{
            currentEpoch:0,
            currentLoss:0,
            percentage:0,
        },
        ratios:[
            {name:'movingAverage',value:7,values:[],chart:'priceChart'},
            {name:'movingAverageSet',value:7,values:[],chart:'priceChart'},
            {name:'pe',normalize:true,values:[],chart:'ratioChart'},
            {name:'volume',normalize:true,values:[],chart:'ratioChart'},
            {name:'oscillator',normalize:true,values:[],chart:'ratioChart'}, 
            {name:'MACD',normalize:true,values:[],chart:'ratioChart'}, 
            {name:'pb',normalize:true,values:[],chart:'ratioChart'}, 
            {name:'ps',normalize:true,values:[],chart:'ratioChart'}, 
            {name:'pfcf',normalize:true,values:[],chart:'ratioChart'}, 
            {name:'divYield',normalize:true,values:[],chart:'ratioChart'}, 
        ],
        selectedRatios:[],
        options:{
            trainingPercentage:{ 
                value:70, step:1, max:100
            },
            epochs:{ 
                value:5, step:1
            },
            learningRate:{ 
                value:0.01, step:0.002,max:1
            },
            hiddenLayers:{ 
                value:2, step:1, max:20
            },
        }
    }
    this.filterByDate = (key,options) => calculateFilterByDate(this,key,options)
    this.getPriceRatio = (ratioName,options) => handleGetPriceRatio(this,ratioName,options)
    this.addTraininData = ()=>addTraininData(this)
    this.trainModel = (setState) => trainModel(this,setState)
    this.validateModel = () => validateModel(this)
    this.predictModel = () => predictModel(this)
    this.init = () => handleInit(this)
}

function handleInit(ticker){
    addMovingAverages(ticker)
    addFinancialRatios(ticker)
    addAnalytics(ticker)
    ticker.ml.stage = 1
    return ticker
}

function addTraininData(ticker){

    let { priceData } = ticker
    const { selectedRatios } = ticker.ml
    let trainingData = []

    priceData.forEach((item,index) =>{
        let set=[]
        selectedRatios.forEach(ratio => {
            switch(ratio.name){
                case 'movingAverage':
                    const simpleMovingAverage = createMovingAverage(priceData,index,ratio.value).sma
                    set.push(simpleMovingAverage)
                    item[ratio.id] = simpleMovingAverage
                    ratio.values.push(simpleMovingAverage)
                    break
                case 'movingAverageSet':
                    const { days, sma } = createMovingAverage(priceData,index,ratio.value)
                    set.push(...days.map(i => i.price))
                    item[ratio.id] = sma
                    ratio.values.push(...days.map(i => i.price))
                    break
                default:  
                    set.push(priceData[index][ratio.name])
                    item[ratio.id] = priceData[index][ratio.name]     
                    ratio.values.push(priceData[index][ratio.name])      
                    break
            }
        });

        trainingData.unshift({
            set,
            price:item.close,
            date:item.date
        })
    })
 
    priceData = [...ticker.priceData].reverse()
    priceData = priceData.filter(item=> new Date(item.date).getFullYear()>=ticker.analytics.financialInputs.firstFullFinancialYear)
    trainingData = trainingData.filter(item=> new Date(item.date).getFullYear()>=ticker.analytics.financialInputs.firstFullFinancialYear)

    let nullValues = 0
    selectedRatios.forEach(item => {
        if(item.value&&item.value>nullValues){
            nullValues=item.value    
        }    
    })
    
    priceData.splice(0,nullValues)
    trainingData.splice(0,nullValues)

    let priceValues = priceData.map(item => item.close)
    let maxPrice = Math.max(...priceValues)
    trainingData.forEach(item => item.price=item.price/maxPrice)
    console.log(trainingData)
    selectedRatios.forEach((ratio,index) =>{
        let values = trainingData.map(item => item.set[index]).map(item => item||0)
        let min = Math.min(...values)
        let max = Math.max(...values)
        trainingData.forEach((item,i) => trainingData[i].set[index] = normalize(item.set[index],max,0))
        ratio.min = min
        ratio.max = max
    })
 
    const mlChartRatios=[...selectedRatios]
    
    mlChartRatios.push({label:'Price', name:'close', color:'black', chart:'priceChart'})
    const { priceChart, ratioChart } = createMLChart(mlChartRatios,priceData)
    
    ticker.chart={
        ...ticker.chart,
        priceChart,
        ratioChart
    }

    ticker.ml={
        ...ticker.ml,
        priceData,
        trainingData,
        mlChartRatios,
        stage: 2,
        maxPrice
    }

    return ticker
}

async function trainModel(ticker,setState){

    ticker.ml.stage = 3
    setState({...ticker}) 
    const { trainingData, options, maxPrice } = ticker.ml

    let inputs = trainingData.map(item => item.set)
    let outputs = trainingData.map(item => item.price)
    console.log(inputs)
    let epochs = options.epochs.value
    let learningRate = options.learningRate.value
    let hiddenLayers = options.hiddenLayers.value
    let trainingPercentage = options.trainingPercentage.value

    ticker.chart.lossChart.labels = [...Array(epochs).keys()].map(i => i+1)

    let callback = function(epoch, log,pred) {
        let stats = ticker.ml.stats
        epoch++
        stats={
            currentEpoch:epoch,
            currentLoss:log.loss.toFixed(5),
            percentage:((epoch/epochs)*100).toFixed(0)
        }
        ticker.ml={
            ...ticker.ml,
            stats,
        }
        ticker.chart.priceChart.datasets.push({
            label:'Prediction '+epoch,
            data:pred.map(item => item*maxPrice),
            borderColor:`rgba(227, 36, 36,${epoch/epochs})`,
            pointRadius:0,
            borderWidth:2,            
            fill:false,
        })

        let lossChartData =[...ticker.chart.lossChart.datasets[0].data]
        lossChartData.push(log.loss)
        ticker.chart.lossChart.datasets[0].data=lossChartData
        setState({...ticker})
    };

    let result = await train(inputs, outputs, inputs[0].length, epochs, learningRate, hiddenLayers,trainingPercentage, callback);

    ticker.ml={
        ...ticker.ml,
        inputs,
        outputs,
        result,
        stage:4
    }
    return ticker
}

function validateModel(ticker){

    const { inputs, result, options,priceData, mlChartRatios, maxPrice } = ticker.ml
    let trainingSize = options.trainingPercentage.value

    let trainX = inputs.slice(0, Math.floor(trainingSize / 100 * inputs.length));
    let trainY = makePredictions(trainX, result['model']);
    let unseenX = inputs.slice(Math.floor((trainingSize / 100) * inputs.length), inputs.length);
    let unseenY = makePredictions(unseenX, result['model']);

    trainY.forEach(i => unseenY.unshift(null))
    unseenY[trainY.length-1] = trainY[trainY.length-1]

    priceData.forEach((item,index)=>{
        item.trainY = trainY[index]
        item.unseenY = unseenY[index]
    })

    mlChartRatios.push({label:'Train', name:'trainY', color:'red', chart:'priceChart'})
    mlChartRatios.push({label:'Unseen', name:'unseenY', color:'purple', chart:'priceChart'})

    const { priceChart, ratioChart } = createMLChart(mlChartRatios,priceData, maxPrice)
    ticker.chart={
        ...ticker.chart,
        priceChart,
        ratioChart
    }

    ticker.ml.stage = 5
    return ticker
}

async function predictModel(ticker) {
    const { inputs, result, options, priceData,maxPrice } = ticker.ml

    let trainingsize = options.trainingPercentage.value

    let pred_X = [inputs[inputs.length-1]];
    pred_X = pred_X.slice(Math.floor(trainingsize / 100 * pred_X.length), pred_X.length);
    let pred_y = await makePredictions(pred_X, result['model']);

    let resultChartWeeks = 30;
    let resultPriceData = [...priceData]
    resultPriceData = resultPriceData.splice(resultPriceData.length-resultChartWeeks,resultPriceData.length-1 )
    let lastDate = new Date(resultPriceData[resultPriceData.length-1].date)
    let predictionDate = new Date(lastDate.setDate(lastDate.getDate() + 7)).toISOString()

    resultPriceData.push({
        prediction: pred_y[0]*maxPrice,
        date:predictionDate      
    })

    let priceChartOptions = [
       {label:'Price', name:'close', color:'black',chart:'predictionChart'},
       {label:'Prediction', name:'prediction', color:'red',pointRadius:5,chart:'predictionChart'},
    ]

    ticker.chart.predictionChart=createMLChart(priceChartOptions,resultPriceData).predictionChart

    return ticker
  }
  
function createMLChart(mlChartOptions,priceData,maxPrice){
    
    let labels = priceData.map(item => item.date.split('T')[0])
    
    let charts={
        priceChart:{
            datasets:[],
            labels          
        },
        ratioChart:{
            datasets:[],
            labels   
        },
        predictionChart:{
            datasets:[],
            labels  
        }
    }

    mlChartOptions.forEach((option,index) => {

        let data = priceData.map(i => i[option.id||option.name]||null)
        let dataLabels = data
        if(option.normalize){
            data = data.map(item => normalize(item,option.max,option.min))
        }

        if(['trainY','unseenY'].includes(option.name)){
            data = data.map(item => item?item*maxPrice:null)
        }
        
        if(option.name==='prediction'){
            data[data.length-2] = priceData[priceData.length-2].close
        }

        charts[option.chart].datasets.push({
            label: option.label || option.name+index,
            data: data,
            borderColor: option.color || colorArray(index),
            pointRadius: 0,
            borderWidth: 2,            
            pointRadius: option.pointRadius||0,
            dataLabels,
            fill: false,
        })        
    })
    return charts
}

function createMovingAverage(priceData,index,weeks){
    let totalsma=0
    let days = []
    for(let i=index;i<index+weeks;i++){
        if(!priceData[i]){
            totalsma=null
            break
        }
        days.push({
            date:priceData[i].date,
            price:priceData[i].close
        })
        totalsma+=priceData[i].close
    }
    let sma = totalsma/weeks||null
    return { days, sma }
}