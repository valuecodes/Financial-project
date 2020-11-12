import { tickerInit, calculateFilterByDate, handleGetPriceRatio, addMovingAverages, addFinancialRatios, addAnalytics } from './calculations/tickerCalculations';
import train, { makePredictions } from './calculations/model';

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
        options:{
            movingAverageWeeks:{ 
                value:7, step:1, max:50, stage:'addTrainingData'
            },
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
    const { priceData } = ticker
    const movingAverageWeeks = ticker.ml.options.movingAverageWeeks.value
    let trainingData = []
    priceData.forEach((item,index) =>{
        let totalsma=0
        let set = []
        for(let i=index;i<index+movingAverageWeeks;i++){
            if(!priceData[i]){
                totalsma=null
                break
            }
            set.push({
                date:priceData[i].date,
                price:priceData[i].close
            })
            totalsma+=priceData[i].close
        }
        if(totalsma>0){
            trainingData.unshift({
                set,
                avg:totalsma/movingAverageWeeks
            })            
        }
        item.sma = totalsma/movingAverageWeeks || null
    })

    let dates = priceData.map(item => item.date.split('T')[0]).reverse()
    let prices = priceData.map(item => item.close).reverse()
    let sma =  priceData.map(item => item.sma).reverse()
    let chart = {
        datasets:[
            {
                label:'Price',
                data:prices,
                borderColor:'black',
                pointRadius:0,
                borderWidth:2,            
                fill:false,
            },
            {
                label:'SMA',
                data:sma,
                borderColor:'yellow',
                pointRadius:0,
                borderWidth:2,            
                fill:false,
            },
        ],
        labels:dates 
    }
    ticker.chart.data=chart

    ticker.ml.trainingData = trainingData
    ticker.ml.stage = ticker.ml.stages[2].name
    return ticker
}

async function trainModel(ticker,setState){

    ticker.ml.stage = 'training'
    setState({...ticker}) 
    const { trainingData, options } = ticker.ml
    let inputs = trainingData.map(item =>item.set.map(i=>i.price))
    let outputs = trainingData.map(item => item.avg)

    let epochs = options.epochs.value
    let learningRate = options.learningRate.value
    let hiddenLayers = options.hiddenLayers.value
    let movingAverageWeeks = options.movingAverageWeeks.value
    let callback = function(epoch, log,pred) {
        let stats = ticker.ml.stats
        epoch++
        stats.push({loss:log.loss,epoch,totalEpochs:epochs})
        ticker.ml={
            ...ticker.ml,
            stats,
        }
        for(var i=0;i<movingAverageWeeks;i++){
            pred.unshift(null)
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

    let result = await train(inputs, outputs, movingAverageWeeks, epochs, learningRate, hiddenLayers, callback);

    ticker.ml={
        ...ticker.ml,
        inputs,
        outputs,
        result,
        stage:'validateModel'
    }
    return ticker
}

function validateModel(ticker){

    const { inputs, result, trainingData, options } = ticker.ml
    let trainingSize = options.trainingPercentage.value
    let movingAverageWeeks = options.movingAverageWeeks.value

    let sma = trainingData.map(item => item.avg);
    let dates = ticker.priceData.map(item => item.dateShort).reverse()
    let trainX = inputs.slice(0, Math.floor(trainingSize / 100 * inputs.length));
    let trainY = makePredictions(trainX, result['model']);
    let unseenX = inputs.slice(Math.floor((trainingSize / 100) * inputs.length), inputs.length);

    let unseenY = makePredictions(unseenX, result['model']);
    let prices = ticker.priceData.map(item => item.close).reverse();
    
    for(var i=0;i<movingAverageWeeks;i++){
        sma.unshift(null)
        trainY.unshift(null)
    }

    trainY.forEach(i => unseenY.unshift(null))
    unseenY[trainY.length-1] = trainY[trainY.length-1]

    let chart = {
        datasets:[
            {
                label:'Price',
                data:prices,
                borderColor:'black',
                pointRadius:0,
                borderWidth:2,            
                fill:false,
            },
            {
                label:'SMA',
                data:sma,
                borderColor:'yellow',
                pointRadius:0,
                borderWidth:2,            
                fill:false,
            },
            {
                label:'Train',
                data:trainY,
                borderColor:'red',
                pointRadius:0,
                borderWidth:2,            
                fill:false,
            },
            {
                label:'Unseen',
                data:unseenY,
                borderColor:'purple',
                pointRadius:0,
                borderWidth:2,            
                fill:false,
            },
        ],
        labels:dates 
    }
    ticker.chart.data=chart
    ticker.ml.stage = 'makePrediction'
    return ticker
}

async function predictModel(ticker) {
    const { inputs, result, trainingData, options } = ticker.ml

    let trainingsize = options.trainingPercentage.value
    let movingAverageWeeks = options.movingAverageWeeks.value

    let pred_X = [inputs[inputs.length-1]];
    pred_X = pred_X.slice(Math.floor(trainingsize / 100 * pred_X.length), pred_X.length);
    let pred_y = await makePredictions(pred_X, result['model']);

    let resultChartWeeks = 30;
    let priceData = [...ticker.priceData]
    priceData = priceData.splice(0, resultChartWeeks)
    let lastDate = new Date(priceData[0].date)
    
    priceData.unshift({
        close:pred_y[0],
        date:new Date(lastDate.setDate(lastDate.getDate() + movingAverageWeeks)).toISOString()       
    })

    priceData = priceData.reverse()
    let dates = priceData.map(item => item.date.split('T')[0])
    let prices=[]
    let predictidPrice=[]
    priceData.forEach((price,index) =>{
        if(index<priceData.length-1){
            prices.push(price.close)
            predictidPrice.push(null)
        }else{
            prices.push(null)
            predictidPrice.push(price.close)
        }
    })
    predictidPrice[predictidPrice.length-2] = prices[prices.length-2]

    let predictionChart = {
        datasets:[
            {
                label:'Price',
                data:prices,
                borderColor:'black',
                pointRadius:0,
                borderWidth:2,            
                fill:false,
            },
            {
                label:'Predicted Price',
                data:predictidPrice,
                borderColor:'red',
                pointRadius:5,
                borderWidth:2,            
                fill:false,
            },
        ],
        labels:dates 
    }

    ticker.chart.predictionChart=predictionChart

    return ticker
  }