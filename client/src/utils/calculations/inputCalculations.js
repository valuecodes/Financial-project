import { uuidv4 } from "../../utils/utils";

export function getReuterCurrency(data){
    return data[0].split('.')[0].split(', ')[1]
}

export function calculateIncomeStatementReuters(data){
    let dates=data[11].split('\t')
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
                'bookValuePerShare':calculatebalanceSheet('tangibleBookValuePerShare',i,keyData),
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
        bookValuePerShare:['Tangible Book Value per Share, Common Eq'],
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
    console.log(data)
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
    if(key==='Annual Data | Millions of US $ except per share data') key = 'macroTrendsAnnual'
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

        let keyFound=null;
        if(incomeKeys.find(item => item===key)){
            keyFound='reutersIncome'
        }else if(balanceKeys.find(item => item===key)){
            keyFound='reutersBalance'
        }else if(cashflowKeys.find(item => item===key)){
            keyFound='reutersCash'
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
