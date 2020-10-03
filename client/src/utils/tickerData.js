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
    calculateLatestPrice
} from "./calculations/inputCalculations";
import { Collection } from "mongoose";

export function TickerData(data){
    this.profile = data.profile?data.profile:{
        ticker:'',
        name:'',
        description:'',
        sector:'',
        stockExhange: '',
        industry:'',
        subIndustry:'',
        founded:'',
        address:'',
        website:'',
        employees:'',
        country:'',
        tickerCurrency:'',
        financialDataCurrency:'',
    }
    this.incomeStatement = data.incomeStatement?data.incomeStatement:[]
    this.balanceSheet = data.balanceSheet?data.balanceSheet:[]
    this.cashFlow = data.cashFlow?data.cashFlow:[]
    this.insiderTrading = data.insiderTrading?data.insiderTrading:[]
    this.dividendData = data.dividendData?data.dividendData:[]
    this.priceData = data.priceData?data.priceData:[]
    this.ratios = data.ratios?data.ratios:{
        pe:null,
        pb:null,
        divYield:null,
        payoutRatio:null,
        marketCap:null,
        currentRatio:null,
        operatingMargin:null,
        profitMargin:null,
        profitGrowth5Years:null,
        revenueGrowth5Years:null,
        peg:null,
        roe:null,
        roa:null,
    }
    this._id=data._id?data._id:null
    this.ratios = {}
    this.latestPrice = {}
    this.valueStatements = null
    this.updateMessages = []
    this.addUpdateMessage = (dataName,actions) => handleAddUpdateMessage(this,dataName,actions)
    this.addTickerSlimData = (tickerSlim) => handleAddTickerSlimData(this,tickerSlim)
    this.getValueStatements = () => calculateValueStatements(this)
    this.getRatio = (ratio) => calculateGetRatio(this,ratio)
    this.yearDivs = () => calculateYearDivs(this)
    this.financialKeysStatements = () => calculateFinancialKeysStatements(this)
    this.getFinancialNum = (key,year) => calculateGetFinancialNum(this,key,year)
    this.tickerRatios = () => calculateTickerRatios(this)
    this.update = () => calculateUpdate(this)
    this.updateFinancialValue = (value) => calculateUpdateFinancialValue(this,value)

    this.addData = (data) => setAddData(this,data)
    this.updateData = (dataName,newData) => setUpdateData(this,dataName,newData)
    this.addProfile = (data) => setAddProfile(this,data)
    this.addMacroTrendsAnnual = (array) => handleAddMacroTrendsAnnual(this,array)
    
    this.selectDataToTable = (key) => setSelectDataToTable(this,key) 
    this.modifyData = (newValue,item) => handleModifyData(this,newValue,item)
    this.addRow = (key) => setAddRow(this,key)
    this.deleteRow = (row) => handleDeleteRow(this,row)

    this.updateRatiosFromApi = (data) => handleUpdateRatiosFromApi(this,data)
    this.updatePriceFromApi = (data) => handleUpdatePriceFromApi(this,data)
    this.updateFinancialsFromApi = (data) => handleUpdateFinancialsFromApi(this,data)
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
            text = 'Ratios updated'
            break
    }

    let time = getTime()
    let newMessage = {color,ticker,time,text,dataName}
    tickerData.updateMessages.push(newMessage)
}

function handleAddTickerSlimData(tickerData,tickerSlim){
    tickerData.ratios = tickerSlim.ratios
    tickerData.latestPrice = tickerSlim.latestPrice
}

function calculateGetRatio(tickerData,ratio){
    
    const { incomeStatement } = tickerData
    
    let stockPrice = tickerData.getFinancialNum('close')
    let yearDivs = tickerData.yearDivs()
    let eps =  tickerData.getFinancialNum('eps')
    let operatingIncome = tickerData.getFinancialNum('operatingIncome')
    let revenue = tickerData.getFinancialNum('revenue')
    let netIncome = tickerData.getFinancialNum('netIncome')
    let sharesOutstanding = tickerData.getFinancialNum('sharesOutstanding')
    let currentAssets = tickerData.getFinancialNum('currentAssets')
    let currentLiabilities = tickerData.getFinancialNum('currentLiabilities')
    let bookValuePerShare =  tickerData.getFinancialNum('bookValuePerShare')
    let totalEquity = tickerData.getFinancialNum('totalEquity')
    let totalAssets = tickerData.getFinancialNum('totalAssets')

    let value = null

    switch(ratio){
        case 'pe':
                value = stockPrice/eps
            break
        case 'pb':
                value = stockPrice/bookValuePerShare
            break
        case 'divYield':
                value = (yearDivs/stockPrice)*100
            break
        case 'payoutRatio':
                value = (yearDivs/eps)*100
            break
        case 'marketCap':
                value = stockPrice*sharesOutstanding
            break
        case 'currentRatio':
                value = currentAssets/currentLiabilities
            break
        case 'operatingMargin':
                value = (operatingIncome/revenue)*100
            break
        case 'profitMargin':
                value = (netIncome/revenue)*100
            break
        case 'profitGrowth5Years':
            if(incomeStatement[0]){
                let length = incomeStatement.length;
                if(length<5){
                    let startingNetIncome = incomeStatement[length-1].netIncome
                    value = (((netIncome/startingNetIncome)**(1/length))-1)*100
                }else{
                    let startingNetIncome = incomeStatement[4].netIncome                   
                    value = (((netIncome/startingNetIncome)**(1/5))-1)*100
                } 
            }
            break
        case 'revenueGrowth5Years':
            if(incomeStatement[0]){
                let length = incomeStatement.length;
                if(length<5){
                    let startingRevenue = incomeStatement[length-1].revenue
                    value = (((revenue/startingRevenue)**(1/length))-1)*100
                }else{
                    let startingRevenue = incomeStatement[4].revenue                  
                    value = (((revenue/startingRevenue)**(1/5))-1)*100
                } 
            }
            break
        case 'peg':
                let pe = tickerData.getRatio('pe')
                let growthRate = tickerData.getRatio('profitGrowth5Years')
                value = pe / growthRate
            break
        case 'roe':
                value = (netIncome/totalEquity)*100
            break
        case 'roa':
                value = (netIncome/totalAssets)*100
            break
        default:return null
    }
    return roundFinancialNumber(value)
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

function calculateValueStatements(tickerData){
    let keys = {}
    Object.keys(tickerDataModel).forEach(statement =>{
        Object.keys(tickerDataModel[statement]).forEach(value =>{
            keys[value] = statement
        })
    })
    tickerData.valueStatements = keys
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

function calculateGetFinancialNum(tickerData,key,year=null){
    
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
            return statementYear[key]  
        }
    }
    return null
}

function calculateTickerRatios(tickerData){
    return{
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
}

function setAddData(tickerData,data){

    let array=data.split('\n') 
    if(array.length<2) return tickerData
    let key = getKey(array,data)
    let newData=[]
    switch (key){
        case 'reutersIncome':
            tickerData.profile.financialDataCurrency = getReuterCurrency(array)
            newData = calculateIncomeStatementReuters(array)
            tickerData.updateData('incomeStatement',newData)
            break
        case 'reutersBalance':
            tickerData.profile.financialDataCurrency = getReuterCurrency(array)
            newData = calculateBalanceSheetReuters(array)
            tickerData.updateData('balanceSheet',newData)
            break
        case 'reutersCash':
            tickerData.profile.financialDataCurrency = getReuterCurrency(array)
            newData = calculateCashFlowReuters(array)
            tickerData.updateData('cashFlow',newData)
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
            break
        case 'dividends':
            newData = calculateYahooDividend(array)
            tickerData.updateData('dividendData',newData)
            break
        case 'macroTrendsAnnual':      
            tickerData.addMacroTrendsAnnual(array)
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
        let startingDate = tickerData.priceData.length>0?new Date(tickerData.priceData[0].date):new Date(2000,0) 
        switch(dataName){
            case 'incomeStatement':
            case 'balanceSheet':
            case 'cashFlow':
                return new Date(item.date).getFullYear() === new Date(newItem.date).getFullYear()
            case 'priceData':
                return startingDate.getTime()>(new Date(newItem.date).getTime()-304800000)
            case 'dividendData':
                return startingDate.getTime()>(new Date(newItem.date).getTime()-1000000000)
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

function setAddRow(tickerData,key){
    let template = Object.assign({}, tickerDataModel[key]);
    template.id = uuidv4()
    tickerData[key].push(template)
    return tickerData
}

function handleDeleteRow(tickerData,row){
    const { key, id } = row
    let index = tickerData[key].findIndex(item => item._id === id||item.id===id)
    tickerData[key].splice(index,1)
    return tickerData
}

function setSelectDataToTable(tickerData,key){

    let selectedData = tickerData[key].sort((a,b)=>new Date(b.date)-new Date(a.date))

    let headers =[]
    let body = []
    let direction = ''

    if(!selectedData[0]){
        return { headers, body, direction }
    }  

    switch(key){
        case 'incomeStatement':
        case 'balanceSheet':
        case 'cashFlow':
            headers = calculateTickerDataRowHeaders(selectedData,key)
            body = calculateTickerDataRowBody(selectedData,key)
            direction = 'row'
            break
        case 'priceData':
        case 'dividendData':
        case 'insiderTrading':
            headers = calculateTickerDataColHeaders(selectedData,key)
            body = calculateTickerDataColBody(selectedData,key)
            direction = 'col'
            break
        default:break
    }
    return { headers, body, direction }
}

function calculateTickerDataRowHeaders(selectedData,key){
    return selectedData.map(item =>{ 
        let date = parseDate(item.date)
        return{
            value:date.split('-')[0],
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

    tickerData.ratios={
        ...tickerData.ratios,
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
    tickerData.addUpdateMessage('ratios')
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