import { getMeanAndVariance, getStandardDeviation } from "../utils";

export function createTrainingData(ticker){

    let { priceData } = ticker
    const { selectedRatios, options } = ticker.ml

    let lastFullFinancialYear = ticker.analytics.financialInputs.lastFullFinancialYear
    let firstFullFinancialYear = ticker.analytics.financialInputs.firstFullFinancialYear
    let yearlyData = ticker.analytics.yearlyData
    const predictionWeeks = options.predictionWeeks.value
    let trainingData=[]

    priceData.forEach((item,index) =>{
        let set=[]
        selectedRatios.forEach(ratio => {
            switch(ratio.category){
                case 'priceRatio':
                    let priceRatio = priceData[index][ratio.name]
                    if(!isFinite(priceRatio)) priceRatio=null
                    set.push(priceRatio)  
                    item[ratio.id] = priceRatio    
                    ratio.values.push(priceRatio)      
                    break
                case 'yearRatio':
                    let years = new Date(item.date).getMonth()<1?2:1
                    let year = new Date(item.date).getFullYear()-years 
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
                case 'macroRatio':
                    let ratioName = ratio.name.split('_')[0]
                    let macroIndex = ticker.macroData.findIndex(data => data.name===ratioName)  
                    let macroRatio = ticker.macroData[macroIndex].data.find(i =>
                        new Date(i.date) < new Date(item.date)
                    )
                    let macroName = ratio.name.replace(ratioName,'value')
                    let macroValue = macroRatio?Number(macroRatio[macroName]):null
                    if(!isFinite(macroValue)) macroValue=null             
                    set.push(macroValue)
                    item[ratio.id] = macroValue    
                    ratio.values.push(macroValue) 
                default:  
            }
        });
        
        let currentPrice = priceData[index]?priceData[index].close:null
        let futurePrice = priceData[index-predictionWeeks]?priceData[index-predictionWeeks].close:null
        let priceChange = null

        if(currentPrice&&futurePrice){
            priceChange = ((futurePrice-currentPrice)/currentPrice)
        }

        trainingData.unshift({
            set,
            price:futurePrice,
            priceChange,
            currentPrice,
            MA12:item.MA12,
            date:item.date
        })            
    })
    return trainingData
}


export function createTrainingResultData(pred,trainingData,predictionWeeks){
    [...Array(predictionWeeks).keys()].map( i => pred.unshift(null));
    return pred.map((item,index) => item?(item+1)*trainingData[index-predictionWeeks].currentPrice:null)
}

export function addTrainingStats(ticker,data,epoch,epochs,log){

    let { trainingData, options } = ticker.ml
    const predictionWeeks = options.predictionWeeks.value

    let comparison=[]
    let maxDistance=0
    let maxDistanceDate=null
    let maxDistanceIndex=null

    data.forEach((item,index) =>{
        if(item){
            let training = trainingData[index-predictionWeeks]
            let change = Math.abs(item-training.price)
            if(change>maxDistance){
                maxDistance=change
                maxDistanceDate=trainingData[index]?trainingData[index].date:''
                maxDistanceIndex=index
            }
            comparison.push(change)
        }
    })
  
    const{ mean, variance } = getMeanAndVariance(comparison);
    const standardDeviation = getStandardDeviation(comparison)

    ticker.ml.stats={
        currentEpoch:epoch,
        currentLoss:log.loss.toFixed(5),
        percentage:((epoch/epochs)*100).toFixed(0),        
        mean,
        variance,
        standardDeviation,
        maxDistance,
        maxDistanceDate,
        maxDistanceIndex
    }

    return ticker
}