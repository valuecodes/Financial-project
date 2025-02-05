import { roundFinancialNumber, getYear, uuidv4, getTime, roundToTwoDecimal, getNumberOfWeek } from "./utils";
import { tickerDataModel } from "./dataModels";
import { 
    calculateCompanyInfo, 
    calculateInsiderMarketBeat, 
    getKey, 
    getReuterCurrency, 
    calculateIncomeStatementReuters, 
    calculateYahooDividend, 
    calculateYahooPrice, 
    calculateInsiderData, 
    calculateBalanceSheetReuters, 
    calculateCashFlowReuters, 
    parseDate, 
    letterCounter, 
    calculateMacroTrendsIncome, 
    calculateMacroTrendsBalance, 
    calculateMacroTrendsCashflow, 
    alphaIncomeStatement,
    alphaBalanceStatement,
    alphaCashflowStatement,
    alphaProfile,
    calculateLatestPrice,
    calculateQuarterData,
    calculateMonthlyPrice,
    calculateYearlyData,
} from "./calculations/inputCalculations";
import { getRollingFinancialNum, calculateGetRatio, handleGetClosestPriceFromDate, handleGetYearlyDivsFromDate, addValueStatements } from "./calculations/tickerCalculations";

export function TickerData(data, tickerQuarter={}, tickerRatios={} ,exhangeRate=null){
    this.profile = data.profile || tickerDataModel.profile
    this.incomeStatement = data.incomeStatement || []
    this.balanceSheet = data.balanceSheet || []
    this.cashFlow = data.cashFlow || []
    this.insiderTrading = data.insiderTrading || []
    this.dividendData = data.dividendData || []
    this.priceData = data.priceData || []
    this.ratios = data.ratios || tickerDataModel.ratios
    this.quarterData = tickerQuarter.quarterData || []
    this.yearlyData = tickerRatios.yearlyData || []
    this.monthlyPrice = tickerRatios.monthlyPrice || []
    this.additionalRatios = data.additionalRatios || []
    this._id = data._id || null
    this.latestPrice = {}
    this.valueStatements = null
    this.updateMessages = []
    this.exhangeRate = exhangeRate
    this.selectedKey2 = null
    this.addUpdateMessage = (dataName,actions) => handleAddUpdateMessage(this,dataName,actions)
    this.addTickerSlimData = (tickerSlim) => handleAddTickerSlimData(this,tickerSlim)
    this.getValueStatements = () => addValueStatements(this)
    this.getRatio = (ratio) => calculateGetRatio(this,ratio)
    this.yearDivs = () => calculateYearDivs(this)
    this.financialKeysStatements = () => calculateFinancialKeysStatements(this)
    this.getFinancialNum = (key,year) => calculateGetFinancialNum(this,key,year)
    this.tickerRatios = () => calculateTickerRatios(this)
    this.update = () => calculateUpdate(this)
    this.updateFinancialValue = (value) => calculateUpdateFinancialValue(this,value)
    this.getRollingFinancialNum = (financialName,date) => getRollingFinancialNum(this,financialName,date)

    this.getClosestPriceFromDate = (date) => handleGetClosestPriceFromDate(this,date)
    this.getYearlyDivsFromDate = (date) => handleGetYearlyDivsFromDate(this,date)

    this.addData = (data) => setAddData(this,data)
    this.updateData = (dataName,newData) => setUpdateData(this,dataName,newData)
    this.addProfile = (data) => setAddProfile(this,data)
    this.addMacroTrendsAnnual = (array) => handleAddMacroTrendsAnnual(this,array)
    this.addMacroTrendsQuarter = (array) => handleAddMacroTrendsQuarter(this,array)
    
    this.selectDataToTable = (key,key2) => setSelectDataToTable(this,key,key2) 
    this.modifyData = (newValue,item) => handleModifyData(this,newValue,item)
    this.addRow = (key,key2,date) => setAddRow(this,key,key2,date)
    this.deleteRow = (row) => handleDeleteRow(this,row)

    this.updateRatiosFromApi = (data) => handleUpdateRatiosFromApi(this,data)
    this.updatePriceFromApi = (data) => handleUpdatePriceFromApi(this,data)
    this.updateFinancialsFromApi = (data) => handleUpdateFinancialsFromApi(this,data)

    this.updateMonthlyYearly = () => handleUpdateMonthlyYearly(this)
}

function handleAddUpdateMessage(tickerData,dataName,actions={new:1,found:0}){
    let ticker = tickerData.profile.ticker
    let text = ''
    let color='gray'
    switch(dataName){
        case 'incomeStatement':
        case 'balanceSheet':
        case 'cashFlow':
            if(actions.new > 0 && actions.found ===0){
                color = 'lightgreen'
            }else if(actions.new >= 0 && actions.found >0){
                color = 'yellow'
            }else{
                color = 'red'
            }
            text = `New: ${actions.new} found: ${actions.found}`
            break
        case 'priceData':
        case 'dividendData':
            if(actions.new > 0 && actions.found ===0){
                color = 'lightgreen'
            }else if(actions.new >= 0 && actions.found >0){
                color = 'yellow'
            }
            text = `New: ${actions.new} found: ${actions.found}`
            break
        case 'profile':
            color = 'lightgreen'
            text = 'Profile Added'
            break
        case 'ratios':
            color = 'lightgreen'
            text = `Ratios updated PE: ${actions.found} => ${actions.new}`
            break
        default: 
            color = 'red'
            text = 'Not found'
    }

    let time = getTime()
    let newMessage = {color,ticker,time,text,dataName}
    tickerData.updateMessages.push(newMessage)
}

function handleAddTickerSlimData(tickerData,tickerSlim){
    tickerData.ratios = tickerSlim.ratios
    if(!tickerSlim.ratios.brand){
        tickerSlim.ratios.brand = null
    }
    tickerData.latestPrice = tickerSlim.latestPrice
}

function calculateYearDivs(tickerData){
    const { dividendData } = tickerData
    if(dividendData[0]){
        let min = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        let max = new Date()
        let divs = dividendData.filter(item => new Date(item.date)>min&&new Date(item.date)<max)
        return divs.reduce((a,c) => a+c.dividend,0)
    }else{
        return null
    }
}

function calculateFinancialKeysStatements(tickerData){
    let keys={}
    if(tickerData.priceData){
        Object.keys(tickerData.incomeStatement[0]).forEach(item => keys[item]='incomeStatement' )
    }
    if(tickerData.incomeStatement[0]){
        Object.keys(tickerData.incomeStatement[0]).forEach(item => keys[item]='incomeStatement' )
    }
    if(tickerData.balanceSheet[0]){
        Object.keys(tickerData.balanceSheet[0]).forEach(item => keys[item]='balanceSheet' )
    }
    if(tickerData.cashFlow[0]){
        Object.keys(tickerData.cashFlow[0]).forEach(item => keys[item]='cashFlow')
    }
    return keys
}

export function calculateGetFinancialNum(tickerData,key,year=null){
    if(tickerData.valueStatements===null){
        tickerData.getValueStatements()
    }
    let keyStatements = tickerData.valueStatements
    let statement = keyStatements[key]

    if(statement){
        year = null
        let statementYear
        if(year){
            statementYear = tickerData[statement].find(item => item.date.split('-')[0]===year)            
        }else{
            statementYear = tickerData[statement].sort((a,b)=>new Date(b.date)-new Date(a.date))[0]
        }
        if(statementYear){
            let value = calculateExhangeRateModification(statementYear[key],key,tickerData)
            return value
        }
    }
    return null


}

export function calculateExhangeRateModification(value, key,tickerData){
    let financialDataCurrency = tickerData.profile.financialDataCurrency
    let exhangeRate = tickerData.exhangeRate
    let ticker = tickerData.profile.ticker
    
    if(ticker==='CIBUS'&&key==='close'){
        return value/exhangeRate.rates[tickerData.profile.tickerCurrency]
    }

    switch(financialDataCurrency){
        case 'RUB':
            if(key==='eps') return value/exhangeRate.rates[financialDataCurrency]
            if(key==='bookValuePerShare') return value/exhangeRate.rates[financialDataCurrency]
            return value
        default: 
            return value
    }
}

function calculateTickerRatios(tickerData){
    tickerData.addUpdateMessage('ratios',{new:tickerData.getRatio('pe'),found:tickerData.ratios.pe})    
    return{
        date: new Date().toISOString(),
        pe: tickerData.getRatio('pe'),
        pb: tickerData.getRatio('pb'),
        divYield: tickerData.getRatio('divYield'),
        payoutRatio: tickerData.getRatio('payoutRatio'),
        marketCap: tickerData.getRatio('marketCap'),
        currentRatio: tickerData.getRatio('currentRatio'),
        profitMargin: tickerData.getRatio('profitMargin'),
        operatingMargin: tickerData.getRatio('operatingMargin'),
        profitGrowth5Years: tickerData.getRatio('profitGrowth5Years'),
        revenueGrowth5Years: tickerData.getRatio('revenueGrowth5Years'),
        peg: tickerData.getRatio('peg'),
        roe: tickerData.getRatio('roe'),
        roa: tickerData.getRatio('roa'),
    }
}

function calculateUpdate(tickerData){
    if(tickerData.balanceSheet[0]){
        if(!tickerData.balanceSheet[0].bookValuePerShare){
            tickerData.updateFinancialValue('bookValue')
        }
    }
    tickerData.ratios = tickerData.tickerRatios()
    return tickerData
}

function calculateUpdateFinancialValue(tickerData,value){
    switch(value){
        case 'bookValue':
            tickerData.balanceSheet.forEach(item => {
                let year = getYear(item.date)
                let sharesOutstanding = tickerData.getFinancialNum('sharesOutstanding',year)
                let bookValuePerShare = item.totalEquity / sharesOutstanding
                item.bookValuePerShare = roundFinancialNumber(bookValuePerShare)
            });
            break
        default:
    }
    return tickerData
}

function setAddData(tickerData,data){

    let array=data.split('\n') 
    if(array.length<2) return tickerData
    let key = getKey(array,data)
    let newQuarterData
    let newData=[]
    console.log(array)
    switch (key){
        case 'reutersIncome':
            tickerData.profile.financialDataCurrency = getReuterCurrency(array)
            newData = calculateIncomeStatementReuters(array)
            tickerData.updateData('incomeStatement',newData)
            break
        case 'reutersIncome.quarter':
            newData = calculateIncomeStatementReuters(array,true)
            newQuarterData= calculateQuarterData(newData,tickerData,'income')
            tickerData.quarterData = newQuarterData
            break
        case 'reutersBalance':
            tickerData.profile.financialDataCurrency = getReuterCurrency(array)
            newData = calculateBalanceSheetReuters(array)
            tickerData.updateData('balanceSheet',newData)
            break
        case 'reutersBalance.quarter':
            newData = calculateBalanceSheetReuters(array,true)
            newQuarterData = calculateQuarterData(newData,tickerData,'balance')
            tickerData.quarterData = newQuarterData
            break
        case 'reutersCash':
            tickerData.profile.financialDataCurrency = getReuterCurrency(array)
            newData = calculateCashFlowReuters(array)
            tickerData.updateData('cashFlow',newData)
            break
        case 'reutersCash.quarter':
            newData = calculateCashFlowReuters(array,true)
            newQuarterData = calculateQuarterData(newData,tickerData,'cash')
            tickerData.quarterData = newQuarterData
            break        
        case 'companyInfo':
            tickerData.addProfile(data)
            break
        case 'insider':
            newData = calculateInsiderData(data)
            tickerData.updateData('insiderTrading',[newData])
            break
        case 'insiderMarketBeat':
            newData = calculateInsiderMarketBeat(data)
            tickerData.updateData('insiderTrading',newData)
            break
        case 'yahooPrice':
            newData = calculateYahooPrice(array)
            tickerData.updateData('priceData',newData)
            tickerData.latestPrice = calculateLatestPrice(tickerData)
            break
        case 'dividends':
            newData = calculateYahooDividend(array)
            tickerData.updateData('dividendData',newData)
            break
        case 'macroTrendsAnnual':      
            tickerData.addMacroTrendsAnnual(array)
            break
        case 'macroTrendsQuarter':
            tickerData.addMacroTrendsQuarter(array)
            break
        default: 
    }
    tickerData.update()
    return tickerData
}

function setUpdateData(tickerData,dataName,newData){

    let currentData = [...tickerData[dataName]]
    
    let actions = {
        new:0,
        found:0
    }

    const compare = (newItem,item,dataName) => {
        let startingPriceDate = tickerData.priceData.length>0?new Date(tickerData.priceData[0].date):new Date(2000,0) 
        let startingDivDate = tickerData.dividendData.length>0?new Date(tickerData.dividendData[0].date):new Date(2000,0) 

        switch(dataName){
            case 'incomeStatement':
            case 'balanceSheet':
            case 'cashFlow':
                return new Date(item.date).getFullYear() === new Date(newItem.date).getFullYear()
            case 'priceData':
                return startingPriceDate.getTime()>(new Date(newItem.date).getTime()-304800000)
            case 'dividendData':
                return startingDivDate.getTime()>(new Date(newItem.date).getTime()-1004800000)
            case 'quarterData':
            case 'insiderTrading':
                return new Date(item.date).getTime() === new Date(newItem.date).getTime()&&
                    item.name ===newItem.name
            default: return true
        }
    }

    newData.forEach(newItem =>{
        let found = currentData.find(item => compare(newItem,item,dataName))
        if(!found){
            currentData.push(newItem)
            actions.new++
        }else{
            actions.found++
        }
    })

    currentData = currentData.sort((a,b)=> new Date(b.date)-new Date(a.date))
    tickerData[dataName] = currentData
    tickerData.addUpdateMessage(dataName,actions)
    return tickerData
}

function setAddProfile(tickerData,data){
    tickerData.profile = calculateCompanyInfo(data,tickerData)
    tickerData.addUpdateMessage('profile')
    return tickerData
}

function handleAddMacroTrendsAnnual(tickerData,array){

    array.shift()
    let numberOfYears=0
    let key=''
    
    for(var i=1;i<array.length;i++){
        if(letterCounter(array[i])>5){
            numberOfYears=i
            key=array[i]
            break
        }
    }
    array = array.map(item => item.split(',')?item.split(',')[0]:item)
 
    let newData=[]
    tickerData.profile.financialDataCurrency='USD'  
    switch(key){
        case 'Revenue': 
            newData = calculateMacroTrendsIncome(numberOfYears,array)       
            tickerData.updateData('incomeStatement',newData)            
            break
        case 'Cash On Hand':
            newData = calculateMacroTrendsBalance(numberOfYears,array)       
            tickerData.updateData('balanceSheet',newData)  
            break
        case 'Net Income/Loss':      
            newData = calculateMacroTrendsCashflow(numberOfYears,array)       
            tickerData.updateData('cashFlow',newData)  
            break
        default:
    }

    return tickerData
}

function handleAddMacroTrendsQuarter(tickerData,array){
    
    array.shift()
    let numberOfYears=0
    let key=''
    
    for(var i=1;i<array.length;i++){
        if(letterCounter(array[i])>5){
            console.log(array[i],i)
            numberOfYears=i
            key=array[i]
            break
        }
    }
    array = array.map(item => item.split(',')?item.split(',')[0]:item)
    console.log(array,key,numberOfYears)

    let newData=[]
    tickerData.profile.financialDataCurrency='USD'  
    switch(key){
        case 'Revenue': 
            newData = calculateMacroTrendsIncome(numberOfYears,array)       
            tickerData.quarterData = calculateQuarterData(newData,tickerData,'income')
            // tickerData.updateData('quarterData',newData)            
            break
        case 'Cash On Hand':
            newData = calculateMacroTrendsBalance(numberOfYears,array)       
            tickerData.quarterData = calculateQuarterData(newData,tickerData,'balance')
            break
        case 'Net Income/Loss':      
            newData = calculateMacroTrendsCashflow(numberOfYears,array)       
            tickerData.quarterData = calculateQuarterData(newData,tickerData,'cash')
            break
        default:
    }
    
    console.log(newData)
    return tickerData
}

function handleModifyData(tickerData, newValue, item){

    if(typeof item ==='string'){
        tickerData.profile[item] = newValue
        return tickerData
    }
    
    const { dataKey, key, id } = item

    if(newValue!==''){
        switch(key){
            case 'date':
                newValue = new Date(newValue).toISOString()
                break
            case 'name':
            case 'position':
            case 'type':
            case 'instrument':
            case 'period':
                break
            default:
                newValue = Number(newValue)
        } 
    }

    let index = tickerData[dataKey].findIndex(item => item._id === id||item.id===id)

    if(index>=0){
        tickerData[dataKey][index][key] = newValue         
    }
    return tickerData
}

function setAddRow(tickerData,key,key2=null,date=null){
    console.log(date)
    let template = Object.assign({}, tickerDataModel[key]);
    template.id = uuidv4()
    if(key==='additionalRatios'&&key2){
        template =Object.assign({}, tickerDataModel.additionalRatio);
        template.id = uuidv4()
        if(date) template.date = date
        let index = tickerData[key].findIndex(item => item.name===key2)
        tickerData[key][index].ratios.push(template)
    }else if(key==='additionalRatios'){
        template = {name:null,period:'yearly',ratios:[],id:uuidv4()}
        tickerData[key].push(template)
    }else{
        tickerData[key].push({...template})
    }
    return tickerData
}

function handleDeleteRow(tickerData,row){
    const { key, id } = row
    let index = tickerData[key].findIndex(item => item._id === id||item.id===id)
    tickerData[key].splice(index,1)
    return tickerData
}

function setSelectDataToTable(tickerData,key,key2){

    let selectedData = tickerData[key].sort((a,b)=>new Date(b.date)-new Date(a.date))

    let headers =[]
    let body = []
    let headers2 =[]
    let body2 = []
    let direction = ''

    if(!selectedData[0]){
        return { headers, body, direction, headers2, body2 }
    }    
      
    switch(key){
        case 'incomeStatement':
        case 'balanceSheet':
        case 'cashFlow':
        case 'quarterData':
        case 'yearlyData':
            headers = calculateTickerDataRowHeaders(selectedData,key)
            body = calculateTickerDataRowBody(selectedData,key)
            direction = 'row'
            break
        case 'priceData':
        case 'dividendData':
        case 'insiderTrading':
        case 'monthlyPrice':
        case 'additionalRatios':
            headers = calculateTickerDataColHeaders(selectedData,key)
            body = calculateTickerDataColBody(selectedData,key)
            direction = 'col'
            break
        default:break
    }

    if(key==='additionalRatios'&&key2){
        let index = tickerData.additionalRatios.findIndex(item => item.name === key2)
        let  additionalData=tickerData.additionalRatios[index].ratios
            .sort((a,b)=>new Date(b.date)-new Date(a.date))

        if(additionalData.length>0){
            headers2 = calculateTickerDataRowHeaders(additionalData,key)
            body2 = calculateTickerDataRowBody(additionalData,key)            
        }
    }


    return { headers, body, direction, headers2,body2 }
}

function calculateTickerDataRowHeaders(selectedData,key){
    return selectedData.map(item =>{ 
        let date = parseDate(item.date)
        return{
            value:date.split('-')[0]+'/'+date.split('-')[1],
            key,
            id:item._id?item._id:item.id
        }
    })
}

function calculateTickerDataRowBody(selectedData,key){
    let dataKeys = Object.keys(selectedData[0]).filter(item => item!=='_id'&&item!=='id')
    let body = []
    dataKeys.forEach(item =>{
        let data=selectedData.map(data =>{
            let value = item==='date'?parseDate(data[item]).split('T')[0]:data[item]  
            return{
            dataKey:key,
            key:item,
            value:value,
            date:data.date,
            id:data._id?data._id:data.id
        }})
        body.push({
            key:item,
            data:data,
            id:data._id?data._id:data.id
        })
    })
    return body
}

function calculateTickerDataColHeaders(selectedData,key){
    let headers = Object.keys(selectedData[0]).filter(item => item!=='_id'&&item!=='id')
    headers = headers.map(item =>{
        return{
            value:item
        }
    })
    return headers
}

function calculateTickerDataColBody(selectedData,key){
    let body = []
    selectedData.forEach(item =>{
        let data = Object.keys(item).map(data => {
            let value = data==='date'?parseDate(item[data]).split('T')[0]:item[data]
            return{
                dataKey:key,
                key:data,
                value:value,
                date:item.date,
                id:item._id?item._id:item.id
            }
        })
        data = data.filter(item => item.key!=='_id'&&item.key!=='id')
        body.push({
            key:key,
            data:data,
            id:item._id?item._id:item.id
        })
    })

    return body
}

function handleUpdateRatiosFromApi(tickerData,data){

    const { 
        PERatio, 
        PriceToBookRatio, 
        DividendYield,
        PayoutRatio,
        MarketCapitalization,
        ProfitMargin,
        OperatingMarginTTM,
        PEGRatio,
        ReturnOnEquityTTM,
        ReturnOnAssetsTTM
    } = data

    tickerData.addUpdateMessage('ratios',{new:roundToTwoDecimal(PERatio),found:tickerData.ratios.pe}) 
    
    tickerData.ratios={
        ...tickerData.ratios,
        date: new Date().toISOString(),
        pe: roundToTwoDecimal(PERatio),
        pb:roundToTwoDecimal(PriceToBookRatio),
        divYield: roundToTwoDecimal(DividendYield*100),
        payoutRatio: roundToTwoDecimal(PayoutRatio*100),
        marketCap: roundToTwoDecimal(MarketCapitalization/1000000),
        profitMargin: roundToTwoDecimal(ProfitMargin*100),
        operatingMargin: roundToTwoDecimal(OperatingMarginTTM*100),
        peg: roundToTwoDecimal(PEGRatio),
        roe: roundToTwoDecimal(ReturnOnEquityTTM*100),
        roa: roundToTwoDecimal(ReturnOnAssetsTTM*100)
    }

    return tickerData
}

function handleUpdatePriceFromApi(tickerData,data){

    if(data['Weekly Adjusted Time Series']){

        let apiData = data['Weekly Adjusted Time Series']
        let newData = []            
        let dividends = []
        let startingDate = tickerData.priceData[0]?new Date(tickerData.priceData[0].date):new Date(2000,0)
        Object.keys(apiData).forEach(key =>{
            let date = new Date(key)
            if(startingDate.getTime()<date.getTime()){
                newData.push({
                    date:date.toISOString(),
                    high:Number(apiData[key]['2. high']),
                    low:Number(apiData[key]['3. low']),
                    close:Number(apiData[key]['4. close']),
                    volume:Number(apiData[key]['6. volume']),
                })       
                if(Number(apiData[key]["7. dividend amount"])){
                    dividends.push({
                        date:date.toISOString(),
                        dividend:Number(apiData[key]["7. dividend amount"])
                    })
                }                            
            }                

        })
        tickerData.updateData('dividendData',dividends)
        tickerData.updateData('priceData',newData)
    }else if(data.data){
        let apiData = data.data
        let newData = []
        let weeks = []
        apiData.forEach(item =>{
            let week = getNumberOfWeek(item.date)
            if(!weeks.find(num => num===week)){
                newData.push({
                    date:new Date(item.date).toISOString(),
                    high:Number(item.high),
                    low:Number(item.low),
                    close:Number(item.close),
                    volume:Number(item.volume),
                })  
                weeks.push(week)
            }     
        })
        tickerData.updateData('priceData',newData)
    }
    
    return tickerData
}

function handleUpdateFinancialsFromApi(tickerData,data){
    let newIncomeStatements =  alphaIncomeStatement(data)
    let newBalanceSheets =  alphaBalanceStatement(data.balanceSheet)
    let newCashflows =  alphaCashflowStatement(data.cashFlow)
    if(tickerData.profile.ticker===''){
        tickerData.profile = alphaProfile(data)
    }
    tickerData.updateData('incomeStatement',newIncomeStatements)
    tickerData.updateData('balanceSheet',newBalanceSheets)
    tickerData.updateData('cashFlow',newCashflows)
    tickerData.updateRatiosFromApi(data.profile)
    return tickerData
}

function handleUpdateMonthlyYearly(tickerData){
    let monthlyPrice = calculateMonthlyPrice(tickerData)
    tickerData.monthlyPrice = monthlyPrice
    let yearlyData = calculateYearlyData(tickerData)
    tickerData.yearlyData = yearlyData
    return tickerData
}