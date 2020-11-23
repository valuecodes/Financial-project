import { calculateFilterByDate, handleGetPriceRatio, addMovingAverages, addFinancialRatios, addAnalytics, addFinancialCategories, getRollingFinancialNum, getTrailing12MonthsFinancials, addValueStatements } from './calculations/tickerCalculations';
import train, { makePredictions } from './calculations/model';
import { colorArray, normalize } from './utils';

export default function MachineLearning(data,quarterData){
    this.profile = data?data.profile:{}
    this.incomeStatement = data?data.incomeStatement:[]
    this.balanceSheet = data?data.balanceSheet:[]
    this.cashFlow = data?data.cashFlow:[]
    this.insiderTrading = data?data.insiderTrading:[]
    this.dividendData = data?data.dividendData:[]
    this.priceData = data?data.priceData:[]
    this.quarterData = quarterData?quarterData.quarterData:[]
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
            legend:{
                display:false
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
        priceRatios:[
            {name:'movingAverage',category:'movingAverage',value:7,values:[],chart:'priceChart'},
            {name:'pe',category:'priceRatio',normalize:true,values:[],chart:'ratioChart'},
            {name:'volume',category:'priceRatio',normalize:true,values:[],chart:'ratioChart'},
            {name:'oscillator',category:'priceRatio',normalize:true,values:[],chart:'ratioChart'}, 
            {name:'pb',category:'priceRatio',normalize:true,values:[],chart:'ratioChart'}, 
            {name:'ps',category:'priceRatio',normalize:true,values:[],chart:'ratioChart'}, 
            {name:'pfcf',category:'priceRatio',normalize:true,values:[],chart:'ratioChart'}, 
            {name:'divYield',category:'priceRatio',normalize:true,values:[],chart:'ratioChart'}, 
        ],
        selectedRatios:[],
        options:{
            trainingPercentage:{ 
                value:70, step:1, max:100,stage:2
            },
            epochs:{ 
                value:5, step:1,stage:2
            },
            learningRate:{ 
                value:0.01, step:0.002,max:1,stage:2
            },
            hiddenLayers:{ 
                value:2, step:1, max:20,stage:2
            },
            predictionWeeks:{ 
                value:2, step:1, max:50,stage:1
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
    this.init = () => handleInit(this)
}

function handleInit(ticker){
    addValueStatements(ticker)
    addMovingAverages(ticker)
    addFinancialRatios(ticker)
    addAnalytics(ticker)
    addFinancialCategories(ticker)
    ticker.ml.stage = 1
    return ticker
}

function addTraininData(ticker){

    let { priceData } = ticker
    const { selectedRatios, options } = ticker.ml
    let trainingData = []
    let lastFullFinancialYear = ticker.analytics.financialInputs.lastFullFinancialYear
    let firstFullFinancialYear = ticker.analytics.financialInputs.firstFullFinancialYear
    let yearlyData = ticker.analytics.yearlyData
    const predictionWeeks = options.predictionWeeks.value
    priceData.forEach((item,index) =>{
        let set=[]
        selectedRatios.forEach(ratio => {
            switch(ratio.category){
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
                case 'priceRatio':
                    let priceRatio = priceData[index][ratio.name]
                    if(!isFinite(priceRatio)) priceRatio=null
                    set.push(priceRatio)  
                    item[ratio.id] = priceRatio    
                    ratio.values.push(priceRatio)      
                    break
                case 'financialRatio':
                    let year = new Date(item.date).getFullYear()-1 
                    if(year>lastFullFinancialYear) year=lastFullFinancialYear
                    if(year<firstFullFinancialYear) break
                    let value = yearlyData[year][ratio.name]
                    if(!isFinite(value)) value=null                
                    set.push(value)
                    item[ratio.id] = value    
                    ratio.values.push(value)      
                    break
                case 'quarterRatio':
                    let quarterRatio = ticker.quarterData.find(i =>{
                        let startDate = new Date(item.date)
                        let endDate = new Date(item.date)
                        endDate.setMonth(endDate.getMonth() + 3);
                        return new Date(i.date).getTime()<=startDate.getTime()      
                    })
                    let quarterValue = quarterRatio?quarterRatio[ratio.name.slice(0,-8)]:null
                    if(!isFinite(quarterValue)) quarterValue=null             
                    set.push(quarterValue)
                    item[ratio.id] = quarterValue    
                    ratio.values.push(quarterValue)  
                    break                        
                default:  
            }
        });
        trainingData.unshift({
            set,
            price:priceData[index-predictionWeeks]?priceData[index-predictionWeeks].close:null,
            date:item.date
        })            
    })
    
    priceData = [...ticker.priceData].reverse()
    priceData = priceData.filter(item=> new Date(item.date).getFullYear()>=ticker.analytics.financialInputs.firstFullFinancialYear+2)
    trainingData = trainingData.filter(item=> new Date(item.date).getFullYear()>=ticker.analytics.financialInputs.firstFullFinancialYear+2)
    let futureData = trainingData.splice(trainingData.length-predictionWeeks,predictionWeeks)
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
    futureData.forEach(item => item.price=item.price/maxPrice)

    selectedRatios.forEach((ratio,index) =>{
        let values = trainingData.map(item => item.set[index]).map(item => item||0)
        let min = Math.min(...values)
        let max = Math.max(...values)
        if(ratio.normalize){
            trainingData.forEach((item,i) => trainingData[i].set[index] = normalize(item.set[index],max,0))
            futureData.forEach((item,i) => trainingData[i].set[index] = normalize(item.set[index],max,0))
        }
        if(ratio.scale){
            trainingData.forEach((item,i) => trainingData[i].set[index] = item.set[index]/max)
            futureData.forEach((item,i) => trainingData[i].set[index] = Number.isInteger(item.set[index])?item.set[index]/max:null)
        }
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
        maxPrice,
        futureData
    }

    return ticker
}

async function trainModel(ticker,setState){

    ticker.ml.stage = 3
    setState({...ticker}) 
    const { trainingData, options, maxPrice } = ticker.ml

    let inputs = trainingData.map(item => item.set)
    let outputs = trainingData.map(item => item.price)
    let epochs = options.epochs.value
    let learningRate = options.learningRate.value
    let hiddenLayers = options.hiddenLayers.value
    let trainingPercentage = options.trainingPercentage.value
    const predictionWeeks = options.predictionWeeks.value

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
        };
        
        [...Array(predictionWeeks).keys()].map( i => pred.unshift(null));
        
        ticker.chart.priceChart.datasets.push({
            label:'Prediction '+epoch,
            data:pred.map(item => item?item*maxPrice:null),
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
    const predictionWeeks = options.predictionWeeks.value

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

    mlChartRatios.push({label:'Train', name:'trainY', color:'red', chart:'priceChart',predictionWeeks})
    mlChartRatios.push({label:'Unseen', name:'unseenY', color:'purple', chart:'priceChart',predictionWeeks})

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
    const { result, options, priceData,maxPrice, futureData } = ticker.ml

    const predictionWeeks = options.predictionWeeks.value    
    let resultChartWeeks = 100;
    let resultPriceData = [...priceData]
    resultPriceData = resultPriceData.splice(resultPriceData.length-resultChartWeeks,resultPriceData.length-1 )
    let lastDate = new Date(resultPriceData[resultPriceData.length-1].date)
    
    await futureData.forEach(async(data,index) =>{
        let predX = [data.set]
        let pred_y = await makePredictions(predX, result['model']);     
        let dateCopy = new Date(lastDate)
        let predictionDate = new Date(dateCopy.setDate(dateCopy.getDate() + ((index+1)*7))).toISOString()
        resultPriceData.push({  
            prediction: pred_y[0]*maxPrice,
            date:predictionDate      
        })
    })

    let priceChartOptions = [
       {label:'Price', name:'close', color:'black',chart:'predictionChart'},
       {label:'Prediction', name:'prediction', color:'red',pointRadius:5,chart:'predictionChart',predictionWeeks},
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

        if(option.scale){
            data = data.map(item => item/option)            
        }

        if(['trainY','unseenY'].includes(option.name)){
            data = data.map(item => item?item*maxPrice:null)
        }

        if(option.name==='prediction'){
            console.log(priceData,priceData.length-option.predictionWeeks-1,priceData.length,option.predictionWeeks)
            data[data.length-option.predictionWeeks-1] = priceData[priceData.length-option.predictionWeeks-1].close
        }
        
        if(option.predictionWeeks&&option.name!=='prediction'){
            [...Array(option.predictionWeeks).keys()].map( i => data.unshift(null));
        }

        charts[option.chart].datasets.push({
            label: option.label || option.name+index,
            data: data,
            borderColor: option.color || colorArray(index),
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