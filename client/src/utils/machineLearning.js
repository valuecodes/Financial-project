import { calculateFilterByDate, handleGetPriceRatio, addMovingAverages, addAnalytics, getRollingFinancialNum, getTrailing12MonthsFinancials, addValueStatements, addPriceRatios, addForecastInputs } from './calculations/tickerCalculations';
import { train, makePredictions } from './calculations/machineLearningModel';
import { colorArray, normalize, uuidv4, normalizePercent } from './utils';
import { charts, createMLChart, addRatioChartCallback } from './charts/machineLearningCharts';
import { createTrainingData, addMeanAndAverage, addTrainingStats, createTrainingResultData } from './calculations/machineLearningCalculations';

export default function MachineLearning(data,macroData,quarterData){
    this.profile = data?data.profile:{}
    this.incomeStatement = data?data.incomeStatement:[]
    this.balanceSheet = data?data.balanceSheet:[]
    this.cashFlow = data?data.cashFlow:[]
    this.insiderTrading = data?data.insiderTrading:[]
    this.dividendData = data?data.dividendData:[]
    this.priceData = data?data.priceData:[]
    this.quarterData = quarterData?quarterData.quarterData:[]
    this.macroData = macroData||[]
    this.charts = charts
    this.ml = {
        stage:0,
        stages:[
            {
                number:0, name:'selectTicker',
                infoText:'Search ticker or press Quick Start'
            },
            {
                number:1, name:'addTrainingData',icon:'ArrowForwardIosIcon',type:'button',
                infoText:'Select how many weeks in the future the prediction is and add atleast one category for training.\n Press "Add Training Data" to continue'
            },
            {
                number:2, name:'trainModel',icon:'ArrowForwardIosIcon',type:'button',
                infoText:'Press train model to continue...'
            },
            {
                number:3, name:'training',icon:'LoopIcon',spinning:true,
                infoText:'Training model...'
            },
            {
                number:4, name:'validateModel',icon:'ArrowForwardIosIcon',type:'button',
                infoText:'Model trained, press "Validate model"'
            },
            {
                number:5, name:'makePrediction',icon:'ArrowForwardIosIcon',type:'button',
                infoText:'Model validated, press "Make prediction"'
            },
        ],
        stats:{
            currentEpoch:0,
            currentLoss:0,
            percentage:0,
            mean:0,
            variance:0,
            standardDeviation:0,
            maxDistance:0,
            maxDistanceDate:null,
            maxDistanceIndex:null,
            correctWeeks:0,
            totalWeeks:0,
            correctWeeksPercent:0
        },
        inputCategories:['macroRatios','priceRatios','quarterRatios','yearRatios'],
        selectedRatios:[],
        options:{
            trainingPercentage:{ 
                value:70, step:1, max:100,stage:2
            },
            epochs:{ 
                value:35, step:1,stage:2
            },
            learningRate:{ 
                value:0.01, step:0.002,max:1,stage:2
            },
            hiddenLayers:{ 
                value:2, step:1, max:20,stage:2
            },
            predictionWeeks:{ 
                value:20, step:1, max:100,stage:1
            },
        }
    }
    this.filterByDate = (key,options) => calculateFilterByDate(this,key,options)
    this.getPriceRatio = (ratioName,options) => handleGetPriceRatio(this,ratioName,options)
    this.addTraininData = ()=>addTraininData(this)
    this.trainModel = (setState) => trainModel(this,setState)
    this.validateModel = () => validateModel(this)
    this.predictModel = () => predictModel(this)
    this.trailing12MonthsFinancials = (date) => getTrailing12MonthsFinancials(this,date)
    this.rollingFinancialNum = (financialName,date) => getRollingFinancialNum(this,financialName,date)
    this.demoMode = (setState) => handleDemoMode(this,setState)
    this.init = () => handleInit(this)
}

function handleInit(ticker){
    addValueStatements(ticker)
    addMovingAverages(ticker)
    addPriceRatios(ticker)
    addAnalytics(ticker)
    addForecastInputs(ticker)       
    ticker.ml.stage = 1
    return ticker
}

function addTraininData(ticker){

    let { priceData } = ticker
    const { selectedRatios, options } = ticker.ml
    const predictionWeeks = options.predictionWeeks.value

    let trainingData = createTrainingData(ticker)

    priceData = [...ticker.priceData].reverse()
    priceData = priceData.filter(item=> new Date(item.date).getFullYear()>=ticker.analytics.financialInputs.firstFullFinancialYear+2)
    trainingData = trainingData.filter(item=> new Date(item.date).getFullYear()>=ticker.analytics.financialInputs.firstFullFinancialYear+2)

    let fullData = [...trainingData]
    let futureData = trainingData.splice(trainingData.length-predictionWeeks,predictionWeeks)

    let MAWeeks = 29

    priceData.splice(0,MAWeeks)
    trainingData.splice(0,MAWeeks)

    selectedRatios.forEach((ratio,index) =>{
        let values = fullData.map(item => item.set[index]).map(item => item||0)
        let min = Math.min(...values)
        let max = Math.max(...values)
        
        if((max>500||min<-100)&&!ratio.normalize&&ratio.category==='priceRatio'){
            ratio.normalize=true
            ratio.percent=false
        }        
        if(ratio.normalize){
            trainingData.forEach((item,i) => trainingData[i].set[index] = normalize(item.set[index],max,0))
            futureData.forEach((item,i) => futureData[i].set[index] = normalize(item.set[index],max,0))
        }
        if(ratio.percent){
            trainingData.forEach((item,i) => trainingData[i].set[index] = normalizePercent(item.set[index]))   
            futureData.forEach((item,i) => futureData[i].set[index] = normalizePercent(item.set[index]))
        }
        if(ratio.scale){
            trainingData.forEach((item,i) => trainingData[i].set[index] = item.set[index]/max)
            futureData.forEach((item,i) => futureData[i].set[index] = Number.isInteger(item.set[index])?item.set[index]/max:null)
        }
        ratio.min = min
        ratio.max = max
    })

    const mlChartRatios=[...selectedRatios];

    mlChartRatios.push({label:'Price', name:'close', color:'black', chart:'priceChart'})
    const { priceChart, ratioChart } = createMLChart(mlChartRatios,priceData)
    
    ticker.charts={
        ...ticker.charts,
        priceChart,
        ratioChart
    }
 
    ticker.ml={
        ...ticker.ml,
        priceData,
        trainingData,
        mlChartRatios,
        stage: 2,
        futureData
    }

    return ticker
}

async function trainModel(ticker,setState){

    ticker.ml.stage = 3
    setState({...ticker}) 
    const { trainingData, options } = ticker.ml

    let inputs = trainingData.map(item => item.set)
    let outputs = trainingData.map(item => item.priceChange)
    let epochs = options.epochs.value
    let learningRate = options.learningRate.value
    let hiddenLayers = options.hiddenLayers.value
    let trainingPercentage = options.trainingPercentage.value
    const predictionWeeks = options.predictionWeeks.value

    ticker.charts.lossChart.labels = [...Array(epochs).keys()].map(i => i+1)

    let trainingStatus = function(epoch, log,pred) {
        
        let trainingResultData = createTrainingResultData(pred,trainingData,predictionWeeks) 
        addTrainingStats(ticker,trainingResultData,pred,epoch,epochs,log)

        let pointRadius = createMaxDistanceStyle(trainingResultData,ticker,5,0)
        let borderColor = createMaxDistanceStyle(trainingResultData,ticker,`rgba(27, 36, 36,${epoch/epochs})`,`rgba(227, 36, 36,${epoch/epochs})`)
        
        ticker.charts.priceChart.datasets.push({
            label:'Prediction '+epoch,
            data:trainingResultData,
            borderColor,
            pointRadius,
            borderWidth:2,            
            fill:false,
        })

        let lossChartData =[...ticker.charts.lossChart.datasets[0].data]
        lossChartData.push(log.loss)
        ticker.charts.lossChart.datasets[0].data=lossChartData
        setState({...ticker})
    };

    let result = await train(inputs, outputs, inputs[0].length, epochs, learningRate, hiddenLayers,trainingPercentage, trainingStatus);

    ticker.ml={
        ...ticker.ml,
        inputs,
        outputs,
        result,
        stage:4
    }
    return ticker
}

function createMaxDistanceStyle(data,ticker,option1,option2){
    return data.map((item,index)=> index===ticker.ml.stats.maxDistanceIndex?option1:option2)
}

function validateModel(ticker){

    const { inputs, result, options,priceData, mlChartRatios,trainingData } = ticker.ml
    let trainingSize = options.trainingPercentage.value
    const predictionWeeks = options.predictionWeeks.value

    let trainX = inputs.slice(0, Math.floor(trainingSize / 100 * inputs.length));
    let trainY = makePredictions(trainX, result['model']);
    let unseenX = inputs.slice(Math.floor((trainingSize / 100) * inputs.length), inputs.length);
    let unseenY = makePredictions(unseenX, result['model']);

    trainY.forEach(i => unseenY.unshift(null))
    unseenY[trainY.length-1] = trainY[trainY.length-1]
    
    let pred = [...unseenY]
    let trainingResultData = createTrainingResultData(pred,trainingData,predictionWeeks) 
    addTrainingStats(ticker,trainingResultData,pred)


    priceData.forEach((item,index)=>{
        item.trainY = trainY[index]
        item.unseenY = unseenY[index]
    })

    mlChartRatios.push({label:'Train', name:'trainY', color:'red', chart:'priceChart',predictionWeeks})
    mlChartRatios.push({label:'Unseen', name:'unseenY', color:'purple', chart:'priceChart',predictionWeeks})

    const { priceChart, ratioChart } = createMLChart(mlChartRatios,priceData)
    ticker.charts={
        ...ticker.charts,
        priceChart,
        ratioChart
    }

    ticker.ml.stage = 5
    return ticker
}

async function predictModel(ticker) {

    const { result, options, priceData, futureData } = ticker.ml

    const predictionWeeks = options.predictionWeeks.value    
    let resultChartWeeks = 200;
    let resultPriceData = [...priceData]
    resultPriceData = resultPriceData.splice(resultPriceData.length-resultChartWeeks,resultPriceData.length-1 )

    let lastDate = new Date(resultPriceData[resultPriceData.length-1].date)

    await futureData.forEach(async(data,index) =>{
        let predX = [data.set]
        let pred_y = await makePredictions(predX, result['model']);     
        let dateCopy = new Date(lastDate)
        let predictionDate = new Date(dateCopy.setDate(dateCopy.getDate() + ((index+1)*7))).toISOString()
        resultPriceData.push({  
            prediction: (pred_y[0]+1)*data.currentPrice,
            date:predictionDate      
        })
    })

    let priceChartOptions = [
       {label:'Price', name:'close', color:'black',chart:'predictionChart'},
       {label:'Prediction', name:'prediction', color:'red',borderWidth:2,pointRadius:5,chart:'predictionChart',predictionWeeks},
    ]

    ticker.charts.priceChart = createMLChart(priceChartOptions,resultPriceData).predictionChart

    return ticker
}

async function handleDemoMode(ticker,setState){

    const { macroRatios, priceRatios, quarterRatios } = ticker.analytics
    let ratios = [...macroRatios,...priceRatios,...quarterRatios]
    macroRatios.forEach(item =>{
        let newRatio = createRatio(item,'macroRatio')
        ticker.ml.selectedRatios.push(newRatio)
    })
    priceRatios.forEach(item =>{
        let newRatio = createRatio(item,'priceRatio')
        ticker.ml.selectedRatios.push(newRatio)
    })

    let updated = ticker.addTraininData()
    setState({...updated})
    updated = await ticker.trainModel(setState)
    setState({...updated})
}

export function createRatio(ratio,category,normalize=true){
    let percent = ratio.split('_')[1]?true:false
    if(ratio.split('_')[1]==='quarter') percent=false
    return{
        name:ratio,
        category:category,
        chart:'ratioChart',
        normalize:!percent,
        id:uuidv4(),
        values:[],
        percent
    }
}