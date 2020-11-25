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
                case 'macroRatio':
                    let macroIndex = ticker.macroData.findIndex(data => data.name===ratio.name)   
                    let macroRatio = ticker.macroData[macroIndex].data.find(i =>
                        new Date(i.date) < new Date(item.date)
                    )
                    let macroValue = macroRatio?Number(macroRatio.value):null
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
