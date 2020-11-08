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
            }            
        }
    }
    this.ml={
        stage:'Select Ticker',
        stats:[]
    }
    this.filterByDate = (key,options) => calculateFilterByDate(this,key,options)
    this.getPriceRatio = (ratioName,options) => handleGetPriceRatio(this,ratioName,options)
    this.trainModel = (setState) => trainModel(this,setState)
    this.validateModel = () => validateModel(this)
    this.init = () => handleInit(this)
}

function handleInit(ticker){
    addMovingAverages(ticker)
    addFinancialRatios(ticker)
    addAnalytics(ticker)
    addTraininData(ticker)
    ticker.ml.stage = 'Train model'
    return ticker
}

function addTraininData(ticker){
    const { priceData } = ticker
    let trainingData = []
    priceData.forEach((item,index) =>{
        let total50=0
        let set = []
        for(let i=index;i<index+7;i++){
            if(!priceData[i]){
                total50=null
                break
            }
            set.push({
                date:priceData[i].date,
                price:priceData[i].close
            })
            total50+=priceData[i].close
        }
        if(total50>0){
            trainingData.unshift({
                set,
                avg:total50/7
            })            
        }
    })
    ticker.ml.trainingData = trainingData
    return ticker
}

async function trainModel(ticker,setState){

    ticker.ml.stage = 'Training model...'
    setState({...ticker}) 
    
    const trainingData = ticker.ml.trainingData
    let inputs = trainingData.map(item =>item.set.map(i=>i.price))
    let outputs = trainingData.map(item => item.avg)

    let epochs = 5
    let learningRate = 0.01
    let hiddenLayers = 2

    let callback = function(epoch, log) {
        let stats = ticker.ml.stats
        epoch++
        stats.push({loss:log.loss,epoch,totalEpochs:epochs})
        ticker.ml={
            ...ticker.ml,
            stats,
        }
        setState({...ticker})
    };

    let result = await train(inputs, outputs, 7, epochs, learningRate, hiddenLayers, callback);
    
    ticker.ml={
        ...ticker.ml,
        inputs,
        outputs,
        result,
        stage:'Validate model'
    }
    return ticker
}

function validateModel(ticker){

    const { inputs, result, trainingData } = ticker.ml
    let trainingSize = 80 
    let sma = trainingData.map(item => item.avg);
    let dates = ticker.priceData.map(item => item.dateShort).reverse()
    let trainX = inputs.slice(0, Math.floor(trainingSize / 100 * inputs.length));
    let trainY = makePredictions(trainX, result['model']);
    let unseenX = inputs.slice(Math.floor((trainingSize / 100) * inputs.length), inputs.length);

    let unseenY = makePredictions(unseenX, result['model']);
    let prices = ticker.priceData.map(item => item.close).reverse();
    
    for(var i=0;i<7;i++){
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
    ticker.ml.stage = 'Make prediction'
    return ticker
}