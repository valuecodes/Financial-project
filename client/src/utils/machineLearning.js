import { tickerInit, calculateFilterByDate, handleGetPriceRatio, addMovingAverages, addFinancialRatios, addAnalytics } from './calculations/tickerCalculations';
import train, { makePredictions } from './calculations/model';
import { randomColor, colorArray } from './utils';

export default function MachineLearning(data){
    this.profile = data?data.profile:{}
    this.incomeStatement = data?data.incomeStatement:[]
    this.balanceSheet = data?data.balanceSheet:[]
    this.cashFlow = data?data.cashFlow:[]
    this.insiderTrading = data?data.insiderTrading:[]
    this.dividendData = data?data.dividendData:[]
    this.priceData = data?data.priceData:[]
    this.chart={
        data:{},
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
        predictionChart:{}
    }
    this.ml={
        stage:'selectTicker',
        stages:[
            {name:'selectTicker'},
            {name:'addTrainingData',icon:'ArrowForwardIosIcon',type:'button'},
            {name:'trainModel',icon:'ArrowForwardIosIcon',type:'button'},
            {name:'training',icon:'LoopIcon',spinning:true},
            {name:'validateModel',icon:'ArrowForwardIosIcon',type:'button'},
            {name:'makePrediction',icon:'ArrowForwardIosIcon',type:'button'},
        ],
        stats:[],
        ratios:[
            {name:'movingAverage',value:7},
            {name:'movingAverageSet',value:7},
            {name:'pe'},
            {name:'volume'},
            {name:'oscillator'}, 
        ],
        selectedRatios:[],
        options:{
            trainingPercentage:{ 
                value:70, step:1, max:100, stage:'trainModel'
            },
            epochs:{ 
                value:5, step:1, stage:'trainModel'
            },
            learningRate:{ 
                value:0.01, step:0.002,max:1, stage:'trainModel'
            },
            hiddenLayers:{ 
                value:2, step:1, max:20, stage:'trainModel'
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
    ticker.ml.stage = ticker.ml.stages[1].name
    return ticker
}

function addTraininData(ticker){

    let { priceData } = ticker
    const { selectedRatios } = ticker.ml
    let trainingData = []
    console.log(priceData)
    priceData.forEach((item,index) =>{
        let set=[]
        selectedRatios.forEach(ratio => {
            switch(ratio.name){
                case 'movingAverage':
                    const simpleMovingAverage = createMovingAverage(priceData,index,ratio.value).sma
                    set.push(simpleMovingAverage)
                    item[ratio.id] = simpleMovingAverage
                    break
                case 'movingAverageSet':
                    const { days, sma } = createMovingAverage(priceData,index,ratio.value)
                    set.push(...days.map(i => i.price))
                    item[ratio.id] = sma
                    break
                default:  
                    set.push(priceData[index][ratio.name])
                    item[ratio.id] = priceData[index][ratio.name]                   
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
    let max = 0
    selectedRatios.forEach(item => {
        if(item.value&&item.value>max){
            max=item.value    
        }    
    })
    
    priceData.splice(0,max)
    trainingData.splice(0,max)

    selectedRatios.push({label:'price', name:'close', color:'black'})
    ticker.chart.data=createMLChart(selectedRatios,priceData)

    ticker.ml={
        ...ticker.ml,
        priceData,
        trainingData,
        stage: ticker.ml.stages[2].name
    }

    return ticker
}

async function trainModel(ticker,setState){

    ticker.ml.stage = ticker.ml.stages[3].name
    setState({...ticker}) 
    const { trainingData, options } = ticker.ml

    let inputs = trainingData.map(item => item.set)
    let outputs = trainingData.map(item => item.price)

    let epochs = options.epochs.value
    let learningRate = options.learningRate.value
    let hiddenLayers = options.hiddenLayers.value

    let callback = function(epoch, log,pred) {
        let stats = ticker.ml.stats
        epoch++
        stats.push({loss:log.loss,epoch,totalEpochs:epochs})
        ticker.ml={
            ...ticker.ml,
            stats,
        }
        ticker.chart.data.datasets.push({
            label:'Prediction '+epoch,
            data:pred,
            borderColor:`rgba(227, 36, 36,${epoch/epochs})`,
            pointRadius:0,
            borderWidth:2,            
            fill:false,
        })
        setState({...ticker})
    };

    let result = await train(inputs, outputs, inputs[0].length, epochs, learningRate, hiddenLayers, callback);

    ticker.ml={
        ...ticker.ml,
        inputs,
        outputs,
        result,
        stage:ticker.ml.stages[4].name
    }
    return ticker
}

function validateModel(ticker){

    const { inputs, result, options,priceData, selectedRatios } = ticker.ml
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

    selectedRatios.push({label:'Train', name:'trainY', color:'red'})
    selectedRatios.push({label:'Unseen', name:'unseenY', color:'purple'})

    ticker.chart.data = createMLChart(selectedRatios,priceData)
    ticker.ml.stage = 'makePrediction'
    return ticker
}

async function predictModel(ticker) {
    const { inputs, result, options,priceData } = ticker.ml

    let trainingsize = options.trainingPercentage.value

    let pred_X = [inputs[inputs.length-1]];
    pred_X = pred_X.slice(Math.floor(trainingsize / 100 * pred_X.length), pred_X.length);
    let pred_y = await makePredictions(pred_X, result['model']);

    let resultChartWeeks = 30;
    let resultPriceData = [...priceData]
    resultPriceData = resultPriceData.splice(resultPriceData.length-resultChartWeeks,resultPriceData.length-1 )
    let lastDate = new Date(resultPriceData[resultPriceData.length-1].date)
    let predictionDate = new Date(lastDate.setDate(lastDate.getDate() + 7)).toISOString()

    resultPriceData[resultPriceData.length-1].prediction = resultPriceData[resultPriceData.length-1].close
    resultPriceData.push({
        prediction:pred_y[0],
        date:predictionDate      
    })

    let priceChartOptions = [
       {label:'Price', name:'close', color:'black'},
       {label:'Prediction', name:'prediction', color:'red',pointRadius:5},
    ]

    ticker.chart.predictionChart=createMLChart(priceChartOptions,resultPriceData)

    return ticker
  }
  
function createMLChart(selectedRatios,priceData){
    let chart={
        datasets:[],
        labels:priceData.map(item => item.date.split('T')[0])
    }

    selectedRatios.forEach((ratio,index) => {
        chart.datasets.push({
            label: ratio.label || ratio.name+index,
            data: priceData.map(i => i[ratio.id||ratio.name]||null),
            borderColor: ratio.color || colorArray(index),
            pointRadius: 0,
            borderWidth: 2,            
            pointRadius: ratio.pointRadius||0,
            fill: false,
        })        
    })
    return chart
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