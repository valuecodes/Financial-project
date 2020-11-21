import { uuidv4, roundToTwoDecimal, monthShort } from "../../utils/utils";
import { tickerDataModel } from "../dataModels";

export function getReuterCurrency(data){
    return data[0].split('.')[0].split(', ')[1]
}

function getQuarterDates(data){
    let qDates = data[11].split('\t')
    qDates.pop()
    let array = qDates.map(item => item.split('-'))
    return array.map(item => new Date(Number(item[2])+2000,monthShort.findIndex(m => m===item[1]),item[0]))
}

export function calculateIncomeStatementReuters(data,quarter){
    let dates=data[11].split('\t')
    if(quarter){
        dates = getQuarterDates(data)
    }
    let keyData=calculateKeyData(data)
    let fData=[];
    for(var i=0;i<dates.length;i++){
        if(dates[i]){
            let namedDataBlock={
                'date':new Date(dates[i]),
                'revenue': calculateFinancialStatement('revenue',i,keyData),
                'costOfRevenue': calculateFinancialStatement('costOfRevenue',i,keyData),
                'grossProfit': calculateFinancialStatement('grossProfit',i,keyData),
                'sgaExpenses': calculateFinancialStatement('sgaExpenses',i,keyData),
                'depreciationAmortization': calculateFinancialStatement('depreciationAmortization',i,keyData),
                'otherOperatingExp': calculateFinancialStatement('otherOperatingExp',i,keyData),
                'totalOperationgExp': calculateFinancialStatement('totalOperationgExp',i,keyData),
                'operatingIncome': calculateFinancialStatement('operatingIncome',i,keyData),
                'interestIncome': calculateFinancialStatement('interestIncome',i,keyData),
                'otherNetIncome': calculateFinancialStatement('otherNetIncome',i,keyData),
                'ebit': calculateFinancialStatement('ebit',i,keyData),
                'incomeTaxProvision': calculateFinancialStatement('incomeTaxProvision',i,keyData),
                'netIncome': calculateFinancialStatement('netIncome',i,keyData),
                'sharesOutstanding': calculateFinancialStatement('sharesOutstanding',i,keyData),
                'dividendsPerShare': calculateFinancialStatement('dividendsPerShare',i,keyData),
                'eps': calculateFinancialStatement('eps',i,keyData),
                id: uuidv4() 
            }
            fData.push(namedDataBlock)
        }

    }
    return fData
}

function calculateFinancialStatement(key,i,keyData){
    let keys={
        revenue:['Revenue','Total Revenue'],
        costOfRevenue:['Cost of Revenue, Total'],
        grossProfit:['Gross Profit'],
        sgaExpenses:['Selling/General/Admin. Expenses, Total'],
        depreciationAmortization:['Depreciation/Amortization'],
        otherOperatingExp:['Other Operating Expenses, Total'],
        totalOperationgExp:['Total Operating Expense'],
        operatingIncome:['Operating Income'],
        interestIncome:['Interest Inc.(Exp.),Net-Non-Op., Total'],
        otherNetIncome:['Other, Net'],
        ebit:['Net Income Before Taxes'],
        incomeTaxProvision:['Provision for Income Taxes'],
        netIncome:['Net Income'],
        sharesOutstanding:['Diluted Weighted Average Shares'],
        dividendsPerShare:['DPS - Common Stock Primary Issue'],
        eps:['Diluted Normalized EPS'],
    }
    return calculateFinancialNumber(keys[key],i,keyData)
}

export function calculateBalanceSheetReuters(data){
    let dates=data[11].split('\t')
    let keyData=calculateKeyData(data)
    let fData=[];
    for(var i=0;i<dates.length;i++){
        if(dates[i]){
            let namedDataBlock={
                'date':new Date(dates[i]),
                'cash':calculatebalanceSheet('cash',i,keyData),
                'netReceivables':calculatebalanceSheet('netReceivables',i,keyData),
                'totalReceivables':calculatebalanceSheet('totalReceivables',i,keyData),
                'inventory':calculatebalanceSheet('inventory',i,keyData),
                'prepaidExpenses':calculatebalanceSheet('prepaidExpenses',i,keyData),
                'otherCurrentAssets':calculatebalanceSheet('otherCurrentAssets',i,keyData),
                'currentAssets':calculatebalanceSheet('currentAssets',i,keyData),
                'propertyPlantEquiment':calculatebalanceSheet('propertyPlantEquiment',i,keyData),
                'accumalatedDepreciation':calculatebalanceSheet('accumalatedDepreciation',i,keyData),
                'goodwill':calculatebalanceSheet('goodwill',i,keyData),
                'intangibles':calculatebalanceSheet('intangibles',i,keyData),
                'noteReceivables':calculatebalanceSheet('noteReceivables',i,keyData),
                'otherLongTermAssets':calculatebalanceSheet('otherLongTermAssets',i,keyData),
                'totalAssets':calculatebalanceSheet('totalAssets',i,keyData),
                'accountsPayable':calculatebalanceSheet('accountsPayable',i,keyData),
                'accruedExpenses':calculatebalanceSheet('accruedExpenses',i,keyData),
                'shortTermDebt':calculatebalanceSheet('shortTermDebt',i,keyData),
                'capitalLeases':calculatebalanceSheet('capitalLeases',i,keyData),
                'otherCurrentLiabilities':calculatebalanceSheet('otherCurrentLiabilities',i,keyData),
                'currentLiabilities':calculatebalanceSheet('currentLiabilities',i,keyData),
                'longTermDebt':calculatebalanceSheet('longTermDebt',i,keyData),
                'capitalLeaseObligations':calculatebalanceSheet('capitalLeaseObligations',i,keyData),
                'totalLongTermDebt':calculatebalanceSheet('totalLongTermDebt',i,keyData),
                'totalDebt':calculatebalanceSheet('totalDebt',i,keyData),
                'otherLiabilities':calculatebalanceSheet('otherLiabilities',i,keyData),
                'totalLiabilities':calculatebalanceSheet('totalLiabilities',i,keyData),
                'apic':calculatebalanceSheet('apic',i,keyData),
                'retainedEarnigs':calculatebalanceSheet('retainedEarnigs',i,keyData),
                'totalEquity':calculatebalanceSheet('totalEquity',i,keyData),
                'bookValuePerShare':calculatebalanceSheet('bookValuePerShare',i,keyData),
                'treasuryStock':calculatebalanceSheet('treasuryStock',i,keyData),
                id: uuidv4() 
            }

            fData.push(namedDataBlock)            
        }

    }

    return fData
}

function calculatebalanceSheet(key,i,keyData){
    let keys={
        cash:['Cash','Cash & Equivalents'],
        netReceivables:['Accounts Receivable - Trade, Net'],
        totalReceivables:['Total Receivables, Net'],
        inventory:['Total Inventory'],
        prepaidExpenses:['Other Current Assets, Total'],
        otherCurrentAssets:['Other Operating Expenses, Total'],
        currentAssets:['Total Current Assets'],
        propertyPlantEquiment:['Property/Plant/Equipment, Total - Gross'],
        accumalatedDepreciation:['Accumulated Depreciation, Total'],
        goodwill:['Goodwill, Net'],
        intangibles:['Intangibles, Net'],
        noteReceivables:['Note Receivable - Long Term'],
        otherLongTermAssets:['Other Long Term Assets, Total'],
        totalAssets:['Total Assets'],
        accountsPayable:['Accounts Payable'],
        accruedExpenses:['Accrued Expenses'],
        shortTermDebt:['Notes Payable/Short Term Debt'],
        capitalLeases:['Current Port. of LT Debt/Capital Leases'],
        otherCurrentLiabilities:['Other Current liabilities, Total'],
        currentLiabilities:['Total Current Liabilities'],
        longTermDebt:['Long Term Debt'],
        capitalLeaseObligations:['Capital Lease Obligations'],
        totalLongTermDebt:['Total Long Term Debt'],
        totalDebt:['Total Debt'],
        otherLiabilities:['Other Liabilities, Total'],
        totalLiabilities:['Total Liabilities'],
        apic:['Additional Paid-In Capital'],
        retainedEarnigs:['Retained Earnings (Accumulated Deficit)'],
        totalEquity:['Total Equity'],
        bookValuePerShare:['Tangible Book Value per Share, Common Eq','Tangible Book Value per Share, Common Eq'],
        treasuryStock:['Treasury Stock - Common']
    }
    return calculateFinancialNumber(keys[key],i,keyData)
}

export function calculateCashFlowReuters(data){
    let dates=data[11].split('\t')
    let keyData=calculateKeyData(data)
    let fData=[];
    for(var i=0;i<dates.length;i++){
        if(dates[i]){
            let namedDataBlock={
                'date':new Date(dates[i]),
                'netIncome':calculateCashFlowStatement('netIncome',i,keyData),
                'depreciationDepletion':calculateCashFlowStatement('depreciationDepletion',i,keyData),
                'nonCashItems':calculateCashFlowStatement('nonCashItems',i,keyData),
                'cashTaxesPaid':calculateCashFlowStatement('cashTaxesPaid',i,keyData),
                'cashInterestPaid':calculateCashFlowStatement('cashInterestPaid',i,keyData),
                'changesInWorkingCapital':calculateCashFlowStatement('changesInWorkingCapital',i,keyData),
                'operatingCashFlow':calculateCashFlowStatement('operatingCashFlow',i,keyData),
                'capEx':calculateCashFlowStatement('capEx',i,keyData),
                'otherInvesting':calculateCashFlowStatement('otherInvesting',i,keyData),
                'investingCashFlow':calculateCashFlowStatement('investingCashFlow',i,keyData),
                'dividendsPaid':calculateCashFlowStatement('dividendsPaid',i,keyData),
                'issuanceRetirementOfDebt':calculateCashFlowStatement('issuanceRetirementOfDebt',i,keyData),
                'financingCashFlow':calculateCashFlowStatement('financingCashFlow',i,keyData),
                'foreignExchangeEffects':calculateCashFlowStatement('foreignExchangeEffects',i,keyData),
                'netChangeinCash':calculateCashFlowStatement('netChangeinCash',i,keyData),
                'issuanceRetirementOfStock':calculateCashFlowStatement('issuanceRetirementOfStock',i,keyData),
                id: uuidv4() 
            }

            fData.push(namedDataBlock)            
        }
    }

    return fData
}

function calculateCashFlowStatement(key,i,keyData){
    let keys={
        netIncome:['Net Income/Starting Line'],
        depreciationDepletion:['Depreciation/Depletion'],
        nonCashItems:['Non-Cash Items'],
        cashTaxesPaid:['Cash Taxes Paid'],
        cashInterestPaid:['Cash Interest Paid'],
        changesInWorkingCapital:['Changes in Working Capital'],
        operatingCashFlow:['Cash from Operating Activities'],
        capEx:['Capital Expenditures'],
        otherInvesting:['Other Investing Cash Flow Items, Total'],
        investingCashFlow:['Cash from Investing Activities'],
        dividendsPaid:['Total Cash Dividends Paid'],
        issuanceRetirementOfDebt:['Issuance (Retirement) of Debt, Net'],
        financingCashFlow:['Cash from Financing Activities'],
        foreignExchangeEffects:['Foreign Exchange Effects'],
        netChangeinCash:['Net Change in Cash'],
        issuanceRetirementOfStock:['Issuance (Retirement) of Stock, Net']
    }
    return calculateFinancialNumber(keys[key],i,keyData)
}

export function calculateCompanyInfo(data,info){
    data=data.split('\n')
    let newData={
        ticker:data[4].split(':')[0],
        name:data[0],
        description:data[1],
        sector:data[6],
        industry:data[8],
        subIndustry:data[10],
        founded:new Date(data[12]),
        address:data[14],
        website:data[18],
        employees:Number(data[20]),
        country:calculateTickerCountry(data),
        tickerCurrency:calculateTickerCurrency(data),
        financialDataCurrency:info.profile.financialDataCurrency,   
    }
    return newData
}

function calculateTickerCountry(data){
    if(data[14]){
        let array = data[14].split(' ')
        let country = array[array.length-1]
        if(country==='States'){
            country = `${array[array.length-2]} ${country}`
        }
        return country
    }
    return ''
}

function calculateTickerCurrency(data){
    if(data[4]){
        let currency= data[4].split('.')[1].replace(/[^A-Za-z]/g, '')
        if(currency){
            return currency.toUpperCase()
        }
    }
    return null
}

export function calculateInsiderData(data){
    let newData={
        name: data.split('Name:')[1].split('\n')[0].trim(),
        position: data.split('Position:')[1].split('\n')[0].trim(),
        date: new Date(data.split('Transaction date:')[1].split('\n')[0].trim()),
        type: calculateTransactionType(data.split('Nature of the transaction:')[1].split('\n')[0].trim()),
        instrument: data.split('Instrument type:')[1].split('\n')[0].trim(),
        price:Number(data.split('Volume weighted average price:')[1].split('\n')[0].split(' ')[1]),
        volume: Number(data.split('Aggregated transactions')[1].split('Volume')[1].replace(/[:, ]/g, "")),
        id: uuidv4() 
    }

    return newData
}

function calculateTransactionType(text){
    if(text==='ACQUISITION'){
        return 'Buy'
    }else if(text==='RECEIPT OF A SHARE-BASED INCENTIVE OR REMUNERATION'){
        return 'Incentive/Remuneration'
    }else if(text==='DISPOSAL'){
        return 'Sell'
    }else{
        return text
    }

}

export function calculateInsiderMarketBeat(data){

    let array = data.split('\n')
    let insiderData=[]

    for(var i=2;i<array.length;i++){
        let newData={
            name: array[i].split('\t')[1],
            position: array[i].split('\t')[2],
            date: new Date(array[i].split('\t')[0]),
            type:  array[i].split('\t')[3],
            instrument: 'SHARE',
            price: array[i].split('\t')[5].replace(/[$,]/g, ""),
            volume: array[i].split('\t')[4].replace(/[$,]/g, ""),
            id: uuidv4() 
        }
        insiderData.push(newData)
    }
    return insiderData
}

export function calculateYahooDividend(data){
    let divData=[]
    for(var i=1;i<data.length;i++){
        let row = data[i].split(',')
        if(new Date(row[0]).getFullYear()>=2000){
            divData.push({
                date:new Date(row[0]),
                dividend:Number(row[1]),
                id: uuidv4() 
            })
        }
    }
    divData.sort((a,b)=> a.date-b.date)
    return divData
}

export function calculateYahooPrice(data){

    let priceData=[]
    for(var i=data.length-1;i>0;i--){
        let row=data[i].split(',')
        if(row[1]==='null') continue
        if(new Date(row[0]).getFullYear()>=2000){
            priceData.push({
                date:new Date(row[0]),
                high:row[2],
                low:row[3],
                close:row[4],
                volume:row[6],
                id: uuidv4()   
            })            
        }
    }
    return priceData
}

function calculateFinancialNumber(keys,index,keyData){
    if(keys){
        for(var i=0;i<keys.length;i++){
            if(keyData[keys[i]]){
                return parseNumber(keyData[keys[i]][index])
            }
        }        
    }
    return NaN
}

function parseNumber(number){
    number= number.replace(/[,]/g,'')
    if(number.match(/([(),])/)){
        number= number.replace(/[()]/g,'')
        number = Number(number)
        number*=-1
    }
    if(number==='--') return null
    return Number(number)
}

function calculateKeyData(data){
    let fData={}
    for(var i=14;i<data.length;i++){
        let row=data[i].split('\t')
        if(!row[0]) break
        fData[row[0]]=row
        fData[row[0]].shift()
    }
    return fData
}   

export function calculateMacroTrendsAnnual(data,companyInfo,setCompanyInfo){

    data.shift()
    let numberOfYears=0
    let key=''

    for(var i=1;i<data.length;i++){
        if(letterCounter(data[i])>5){
            numberOfYears=i
            key=data[i]
            break
        }
    }

    switch(key){
        case 'Revenue':
            setCompanyInfo({
                ...companyInfo,
                profile:{...companyInfo.profile,financialDataCurrency:'USD'},         
                incomeStatement:calculateMacroTrendsIncome(numberOfYears,data)}) 
            break
        case 'Cash On Hand':
            setCompanyInfo({
                ...companyInfo,
                profile:{...companyInfo.profile,financialDataCurrency:'USD'},              
                balanceSheet:calculateMacroTrendsBalance(numberOfYears,data)}) 
            break
        case 'Net Income/Loss':
                setCompanyInfo({
                    ...companyInfo,
                    profile:{...companyInfo.profile,financialDataCurrency:'USD'},        
                    cashFlow:calculateMacroTrendsCashflow(numberOfYears,data)
                }) 
            break
        default: return
    }
    
}

export function calculateMacroTrendsCashflow(numberOfYears,data){
    let fData=[]
    for(var a=1;a<=numberOfYears;a++){
        let namedDataBlock={
            'date':new Date(data[a]),
            'netIncome':parseMacroNumber(data[a+(numberOfYears*1)]),
            'depreciationDepletion':parseMacroNumber(data[a+(numberOfYears*2)]),
            'nonCashItems':parseMacroNumber(data[a+(numberOfYears*4)]),
            'cashTaxesPaid':parseMacroNumber('-'),
            'cashInterestPaid':parseMacroNumber('-'),
            'changesInWorkingCapital':parseMacroNumber('-'),
            'operatingCashFlow':parseMacroNumber(data[a+(numberOfYears*10)]),
            'capEx':parseMacroNumber(data[a+(numberOfYears*11)]),
            'otherInvesting':parseMacroNumber(data[a+(numberOfYears*17)]),
            'investingCashFlow':parseMacroNumber(data[a+(numberOfYears*18)]),
            'dividendsPaid':parseMacroNumber(data[a+(numberOfYears*24)]),
            'issuanceRetirementOfDebt':parseMacroNumber('-'),
            'financingCashFlow':parseMacroNumber(data[a+(numberOfYears*26)]),
            'foreignExchangeEffects':parseMacroNumber('-'),
            'netChangeinCash':parseMacroNumber(data[a+(numberOfYears*27)]),
            'issuanceRetirementOfStock':parseMacroNumber('-'),
            'id': uuidv4()
        }
        fData.push(namedDataBlock)  
    } 
    fData.pop()
    return fData
}

export function calculateMacroTrendsBalance(numberOfYears,data){
    let fData=[]
    for(var a=1;a<=numberOfYears;a++){
        let namedDataBlock={
            'date':new Date(data[a]),
            'cash':parseMacroNumber(data[a+(numberOfYears*1)]),
            'netReceivables':parseMacroNumber('-'),
            'totalReceivables':parseMacroNumber(data[a+(numberOfYears*2)]),
            'inventory':parseMacroNumber(data[a+(numberOfYears*3)]),
            'prepaidExpenses':parseMacroNumber(data[a+(numberOfYears*4)]),
            'otherCurrentAssets':parseMacroNumber(data[a+(numberOfYears*5)]),
            'currentAssets':parseMacroNumber(data[a+(numberOfYears*6)]),
            'propertyPlantEquiment':parseMacroNumber(data[a+(numberOfYears*7)]),
            'accumalatedDepreciation':parseMacroNumber('-'),
            'goodwill':parseMacroNumber(data[a+(numberOfYears*9)]),
            'intangibles':parseMacroNumber('-'),
            'noteReceivables':parseMacroNumber('-'),
            'otherLongTermAssets':parseMacroNumber(data[a+(numberOfYears*10)]),
            'totalAssets':parseMacroNumber(data[a+(numberOfYears*12)]),
            'accountsPayable':parseMacroNumber('-'),
            'accruedExpenses':parseMacroNumber('-'),
            'shortTermDebt':parseMacroNumber('-'),
            'capitalLeases':parseMacroNumber('-'),
            'otherCurrentLiabilities':parseMacroNumber('-'),
            'currentLiabilities':parseMacroNumber(data[a+(numberOfYears*13)]),
            'longTermDebt':parseMacroNumber(data[a+(numberOfYears*14)]),
            'capitalLeaseObligations':parseMacroNumber('-'),
            'totalLongTermDebt':parseMacroNumber('-'),
            'totalDebt':parseMacroNumber('-'),
            'otherLiabilities':parseMacroNumber('-'),
            'totalLiabilities':parseMacroNumber(data[a+(numberOfYears*17)]),
            'apic':parseMacroNumber('-'),
            'retainedEarnigs':parseMacroNumber(data[a+(numberOfYears*19)]),
            'totalEquity':parseMacroNumber(data[a+(numberOfYears*22)]),
            'bookValuePerShare':parseMacroNumber('-'),
            'treasuryStock':parseMacroNumber('-'),
            'id': uuidv4()
        }
        fData.push(namedDataBlock)  
    } 
    fData.pop()
    return fData
}

export function calculateMacroTrendsIncome(numberOfYears,data){
    let fData=[]

    for(var a=1;a<=numberOfYears;a++){
        let namedDataBlock={
            'date':new Date(data[a]),
            'revenue': parseMacroNumber(data[a+(numberOfYears*1)]),
            'costOfRevenue': parseMacroNumber(data[a+(numberOfYears*2)]),
            'grossProfit': parseMacroNumber(data[a+(numberOfYears*3)]),
            'r&d': parseMacroNumber(data[a+(numberOfYears*4)]),
            'sgaExpenses': parseMacroNumber(data[a+(numberOfYears*5)]),
            'depreciationAmortization': parseMacroNumber('-'),
            'otherOperatingExp': parseMacroNumber(data[a+(numberOfYears*6)]),
            'totalOperationgExp': parseMacroNumber(data[a+(numberOfYears*7)]),
            'operatingIncome': parseMacroNumber(data[a+(numberOfYears*8)]),
            'interestIncome': parseMacroNumber('-'),
            'otherNetIncome': parseMacroNumber(data[a+(numberOfYears*9)]),
            'ebit': parseMacroNumber(data[a+(numberOfYears*18)]),
            'incomeTaxProvision': parseMacroNumber('-'),
            'netIncome': parseMacroNumber(data[a+(numberOfYears*16)]),
            'sharesOutstanding': parseMacroNumber(data[a+(numberOfYears*20)]),
            'dividendsPerShare': parseMacroNumber('-'),
            'eps': parseMacroNumber(data[a+(numberOfYears*22)]),
            'id': uuidv4()
        }
        fData.push(namedDataBlock)
    }

    fData.pop()
    return fData
}

function parseMacroNumber(text){
    let num = Number(text.replace(/[,$ ]/g,''))
    if(text.charAt(1)==='−') num = Number(text.replace(/[,$− ]/g,''))*-1
    return Number.isNaN(num)?null:num
}

export function letterCounter (x) {
    return x.replace(/[^a-zA-Z]/g, '').length;
}

export function getKey(array,data){

    if(array[1].split('\t')[0]==='Trend'){
        array.splice(1,2)
    }
    let key = array[1].split('\t')[0]
    
    if(array[2]==='CURRENT PRICE') key = 'companyInfo'
    if(checkInsider(data)) key = 'insider'
    if(array[0]==='Date,Open,High,Low,Close,Adj Close,Volume') key = 'yahooPrice'
    if(key==='Transaction Date') key='insiderMarketBeat'
    if(array[0]==="Date,Dividends") key='dividends'
    if(key==='Annual Data | Millions of US $ except per share data'){
        return 'macroTrendsAnnual'
    } 
    if(key==="Quarterly Data | Millions of US $ except per share data"){
        return 'macroTrendsQuarter'
    }
    
    let reuterKey = checkReuters(array)
    if(reuterKey){
        key=reuterKey
    } 

    return key
}

export function checkReuters(array){

    if(array[14]){
        let incomeKeys=['Revenue','Total Premiums Earned','Interest Income, Bank']
        let balanceKeys=['Cash','Cash & Due from Banks','Cash & Equivalents']
        let cashflowKeys=['Net Income/Starting Line','Cash Taxes Paid','Cash Receipts']

        let key = array[14].split('\t')[0]
        let dates = array[11].split('\t').map(item => item.split('-')[1])
        let quarterDate = dates.find(item => item==='Jun'||item==='Mar'||item==='Sep')

        let keyFound=null;
        if(incomeKeys.find(item => item===key)){
            keyFound='reutersIncome'
        }else if(balanceKeys.find(item => item===key)){
            keyFound='reutersBalance'
        }else if(cashflowKeys.find(item => item===key)){
            keyFound='reutersCash'
        }

        if(quarterDate){
            keyFound+='.quarter'
        }

        return keyFound
    }else{
        return null
    }
}

function checkInsider(data){
    return data.split("This news release was distributed by Company News System, www.nasdaqomxnordic.com/news").length===2
}

export function parseDate(date){
    function isIsoDate(str) {
        if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)){
            return false;
        } 
        var d = new Date(str); 
        return d.toISOString()===str;
      }
    if(isIsoDate(date)){
        return date
    }else{
        return date.toISOString()
    }                  
}

export function alphaIncomeStatement(data){
    console.log(data)
    let apiDataIncome = data.incomeStatement.annualReports
    let apiDataBalance = data.balanceSheet.annualReports
    let incomeStatements=[]

    for(var i=0;i<apiDataIncome.length;i++){

        let statement = apiDataIncome[i]
        let balanceStatement = apiDataBalance[i]
        
        let newStatement={
            'date':new Date(statement.fiscalDateEnding),
            'revenue': convertAlphaNum(statement.totalRevenue),
            'costOfRevenue': convertAlphaNum(statement.costOfRevenue),
            'grossProfit': convertAlphaNum(statement.grossProfit),
            'sgaExpenses': convertAlphaNum(statement.sellingGeneralAdministrative),
            'depreciationAmortization': null,
            'otherOperatingExp': convertAlphaNum(statement.otherOperatingExpense),
            'totalOperationgExp': convertAlphaNum(statement.totalOperatingExpense),
            'operatingIncome': convertAlphaNum(statement.operatingIncome),
            'interestIncome': convertAlphaNum(statement.interestIncome),
            'otherNetIncome': null,
            'ebit': convertAlphaNum(statement.ebit),
            'incomeTaxProvision': convertAlphaNum(statement.incomeTaxExpense),
            'netIncome': convertAlphaNum(statement.netIncome),
            'sharesOutstanding': convertAlphaNum(balanceStatement.commonStockSharesOutstanding),
            'dividendsPerShare': null,
            'eps': roundToTwoDecimal(Number(statement.netIncome)/Number(balanceStatement.commonStockSharesOutstanding)),
            id: uuidv4() 
        }
        incomeStatements.push(newStatement)            
    }

    return incomeStatements
}

export function alphaBalanceStatement(data){

    let apiData = data.annualReports
    let newData = []

    apiData.forEach(statement =>{
        let newStatement={
            'date': new Date(statement.fiscalDateEnding),
            'cash': convertAlphaNum(statement.cash),
            'netReceivables':convertAlphaNum(statement.netReceivables),
            'totalReceivables':null,
            'inventory':convertAlphaNum(statement.inventory),
            'prepaidExpenses':null,
            'otherCurrentAssets':convertAlphaNum(statement.otherCurrentAssets),
            'currentAssets':convertAlphaNum(statement.totalCurrentAssets),
            'propertyPlantEquiment':convertAlphaNum(statement.propertyPlantEquipment),
            'accumalatedDepreciation':convertAlphaNum(statement.accumulatedDepreciation),
            'goodwill':convertAlphaNum(statement.goodwill),
            'intangibles':convertAlphaNum(statement.intangibleAssets),
            'noteReceivables':null,
            'otherLongTermAssets':null,
            'totalAssets':convertAlphaNum(statement.totalAssets),
            'accountsPayable':convertAlphaNum(statement.accountsPayable),
            'accruedExpenses':null,
            'shortTermDebt':convertAlphaNum(statement.shortTermDebt),
            'capitalLeases':convertAlphaNum(statement.capitalLeaseObligations),
            'otherCurrentLiabilities':convertAlphaNum(statement.otherCurrentLiabilities),
            'currentLiabilities':convertAlphaNum(statement.totalCurrentLiabilities),
            'longTermDebt':convertAlphaNum(statement.longTermDebt),
            'capitalLeaseObligations':convertAlphaNum(statement.capitalLeaseObligations),
            'totalLongTermDebt':convertAlphaNum(statement.totalLongTermDebt),
            'totalDebt':null,
            'otherLiabilities':convertAlphaNum(statement.otherLiabilities),
            'totalLiabilities':convertAlphaNum(statement.totalLiabilities),
            'apic':convertAlphaNum(statement.additionalPaidInCapital),
            'retainedEarnigs':convertAlphaNum(statement.retainedEarnings),
            'totalEquity':convertAlphaNum(statement.liabilitiesAndShareholderEquity),
            'bookValuePerShare': roundToTwoDecimal(Number(statement.totalShareholderEquity) /Number(statement.commonStockSharesOutstanding)),
            'treasuryStock':convertAlphaNum(statement.treasuryStock),
            id: uuidv4() 
        }        
        newData.push(newStatement)          
    })
    return newData
}

export function alphaCashflowStatement(data){
    let apiData = data.annualReports
    let newData = []

    apiData.forEach(statement =>{
        let newStatement={
            'date': new Date(statement.fiscalDateEnding),
            'netIncome': convertAlphaNum(statement.netIncome),
            'depreciationDepletion': convertAlphaNum(statement.depreciation),
            'nonCashItems': null,
            'cashTaxesPaid': null,
            'cashInterestPaid': null,
            'changesInWorkingCapital': null,
            'operatingCashFlow': convertAlphaNum(statement.operatingCashflow),
            'capEx': convertAlphaNum(statement.capitalExpenditures),
            'otherInvesting': null,
            'investingCashFlow': convertAlphaNum(statement.cashflowFromInvestment),
            'dividendsPaid': convertAlphaNum(statement.dividendPayout),
            'issuanceRetirementOfDebt': null,
            'financingCashFlow': convertAlphaNum(statement.cashflowFromFinancing),
            'foreignExchangeEffects': null,
            'netChangeinCash': convertAlphaNum(statement.changeInCash),
            'issuanceRetirementOfStock': null,
            id: uuidv4() 
        }        
        newData.push(newStatement)          
    })
    return newData
}

export function alphaProfile(data){
    let profile = data.profile
    let newData={
        ticker:profile.Symbol,
        name:profile.Name,
        description:profile.Description,
        sector:profile.Sector,
        industry:profile.Industry,
        subIndustry:null,
        founded:null,
        address:profile.Address,
        website:null,
        employees:profile.FullTimeEmployees,
        country:'United States',
        tickerCurrency:'USD',
        financialDataCurrency:'USD',   
    }
    return newData
}

export function calculateLatestPrice(tickerData){
    if(tickerData.priceData[1]){
        let price1 = tickerData.priceData[0].close
        let price2 = tickerData.priceData[1].close
        return{
            date:new Date(tickerData.priceData[0].date).toISOString(),
            close:roundToTwoDecimal(price1),
            change:roundToTwoDecimal(price1-price2),
            percentageChange:roundToTwoDecimal(((price1-price2)/price2)*100),
        }
    }else{
        return tickerDataModel.latestPrice
    }
}

function convertAlphaNum(num){
    return Number((Number(num)/1000000).toFixed(1))
}

export function getApiSymbol(country,symbol){

    let exlude = ['NDA','FODELIA','700','NWH-U']
    if(exlude.includes(symbol)){
        return null
    }

    if(symbol==='CTY1S') return 'TY2B.XFRA'
    if(symbol==='BRK') return 'BRK.B'

    switch(country){
        case 'Finland':
            return symbol+='.XHEL'
        case 'Sweden':
            return symbol+='.XSTO'
        case 'Russia':
            return symbol+='.XETRA'
        case 'Canada':
            symbol = symbol.split('-')[0]
            return symbol+='.UN.XTSE'
        default: return symbol
    }
}

function getDateName(date){
    date = new Date(date)
    return `${date.getFullYear()}/${date.getMonth()+1}`
}

export function calculateQuarterData(newQuarterData ,tickerData ,statement){

    let quarterData = tickerData.quarterData

    newQuarterData.forEach(item =>{
        let index = quarterData.findIndex(data => new Date(data.date).getTime()===new Date(item.date).getTime())
        if(index===-1){
            quarterData.push({...tickerDataModel.quarterData,date:item.date,dateName:getDateName(item.date)})
        }
    })

    switch(statement){
        case'income':
            newQuarterData.forEach(item =>{
                let index = quarterData.findIndex(data => new Date(data.date).getTime()===new Date(item.date).getTime())
                quarterData[index]={
                    ...quarterData[index],
                    revenue: item.revenue,
                    netIncome: item.netIncome,
                    operatingIncome: item.operatingIncome,
                    eps: item.eps,
                    sharesOutstanding: item.sharesOutstanding,
                }
            })
            break
        case'balance':
            newQuarterData.forEach(item =>{
                let index = quarterData.findIndex(data => new Date(data.date).getTime()===new Date(item.date).getTime())
                quarterData[index]={
                    ...quarterData[index],
                    currentAssets: item.currentAssets,
                    currentLiabilities: item.currentLiabilities,
                    totalEquity: item.totalEquity,
                    totalDebt: item.totalDebt||item.longTermDebt,
                    totalAssets: item.totalAssets,
                }
            })
        break
        case'cash':
            newQuarterData.forEach(item =>{
                let index = quarterData.findIndex(data => new Date(data.date).getTime()===new Date(item.date).getTime())
                quarterData[index]={
                    ...quarterData[index],
                    operatingCashFlow: item.operatingCashFlow,
                    investingCashFlow: item.investingCashFlow,
                    financingCashFlow: item.financingCashFlow
                }
            })
        break
        default: break
    }

    return quarterData
}

export function calculateMonthlyPrice(tickerData){

    const { priceData } = tickerData
    let filteredData = priceData.filter(item => new Date(item.date).getFullYear()>=2015)

    const copy = JSON.parse(JSON.stringify(filteredData))

    copy.forEach(item =>{
        let year = new Date(item.date).getFullYear()
        let month = new Date(item.date).getMonth()+1
        item.date = year+'.'+month
    }) 

    let monthly = []

    copy.forEach(item => {
        let found = monthly.findIndex(i => i.date === item.date)
        if(found<=-1){
            let newData = {
                date: item.date,
                close: item.close
            }
            monthly.push(newData)
        }
        return null
    })

    monthly.forEach(item => item.date=new Date(item.date.split('.')))
    return monthly
}

export function calculateYearlyData(tickerData){

    const { incomeStatement, balanceSheet, cashFlow } = tickerData

    let yearlyData = []

    incomeStatement.forEach(income =>{
        let balance = balanceSheet.find(item => new Date(item.date).getTime()===new Date(income.date).getTime())
        let cash = cashFlow.find(item => new Date(item.date).getTime()===new Date(income.date).getTime())
        
        if(new Date(income.date).getFullYear()>=2010){
            yearlyData.push({
                date: income.date,
                revenue: income?income.revenue:null,
                netIncome: income?income.netIncome:null,
                eps: income?income.eps:null,
                currentAssets: balance?balance.currentAssets:null,
                currentLiabilities: balance?balance.currentLiabilities:null,
                bookValuePerShare: balance?balance.bookValuePerShare:null,
                operatingCashFlow: cash?cash.operatingCashFlow:null,
                investingCashFlow: cash?cash.investingCashFlow:null,
                financingCashFlow: cash?cash.financingCashFlow:null,
                operatingMargin: income?roundToTwoDecimal((income.operatingIncome/income.revenue)*100):null,
                profitMargin: income?roundToTwoDecimal((income.netIncome/income.revenue)*100):null,
                roe: income&&balance?roundToTwoDecimal((income.netIncome/balance.totalEquity)*100):null,
                roa: income&&balance?roundToTwoDecimal((income.netIncome/balance.totalAssets)*100):null,
                sharesOutstanding: income?income.sharesOutstanding:null,
                price:tickerData.getClosestPriceFromDate(income.date),
                dividends: tickerData.getYearlyDivsFromDate(income.date)
            })            
        }
    })

    return yearlyData
}