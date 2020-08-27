export function calculateFinancialIncomeData(data){
    let newData={}
    let dates=data[0].split('\t')
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
                'weightedAverageShares': calculateFinancialStatement('weightedAverageShares',i,keyData),
                'dividendsPerShare': calculateFinancialStatement('dividendsPerShare',i,keyData),
                'eps': calculateFinancialStatement('eps',i,keyData),
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
        weightedAverageShares:['Diluted Weighted Average Shares'],
        dividendsPerShare:['DPS - Common Stock Primary Issue'],
        eps:['Diluted Normalized EPS']
    }
    return calculateFinancialNumber(keys[key],i,keyData)
}

export function calculateFinancialBalanceSheetData(data){
    let newData={}
    let dates=data[0].split('\t')
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
                'sharesOutstanding':calculatebalanceSheet('sharesOutstanding',i,keyData),
                'tangibleBookValuePerShare':calculatebalanceSheet('tangibleBookValuePerShare',i,keyData),
                'treasuryStock':calculatebalanceSheet('treasuryStock',i,keyData),
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
        sharesOutstanding:['Total Common Shares Outstanding'],
        tangibleBookValuePerShare:['Tangible Book Value per Share, Common Eq'],
        treasuryStock:['Treasury Stock - Common'],
    }
    return calculateFinancialNumber(keys[key],i,keyData)
}

export function calculateFinancialCashFlowData(data){
    let newData={}
    let dates=data[0].split('\t')
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
        issuanceRetirementOfStock:['Issuance (Retirement) of Stock, Net'],
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
        founded:data[12],
        address:data[14],
        phone:data[16],
        website:data[18],
        employees:data[20],        
    }
    return newData
}

export function calculateInsiderData(data){
    let newData={
        name: data.split('Name:')[1].split('\n')[0].trim(),
        position: data.split('Position:')[1].split('\n')[0].trim(),
        date: data.split('Transaction date:')[1].split('\n')[0].trim(),
        type: data.split('Nature of the transaction:')[1].split('\n')[0].trim(),
        instrument: data.split('Instrument type:')[1].split('\n')[0].trim(),
        price:Number(data.split('Volume weighted average price:')[1].split('\n')[0].split(' ')[1]),
        volume: Number(data.split('Aggregated transactions')[1].split('Volume')[1].replace(/[:, ]/g, ""))
    }
    // newData.price=Number(newData.price)?newData.price:NaN
    return newData
}

export function calculateInsiderMarketBeat(data){

    let array = data.split('\n')
    let insiderData=[]

    for(var i=2;i<array.length;i++){
        let newData={
            name: array[i].split('\t')[1],
            position: array[i].split('\t')[2],
            date: array[i].split('\t')[0],
            type:  array[i].split('\t')[3],
            instrument: 'SHARE',
            price: array[i].split('\t')[5].replace(/[$,]/g, ""),
            volume: array[i].split('\t')[4].replace(/[$,]/g, ""),
        }
        insiderData.push(newData)
    }
    return insiderData
}

export function calculateYahooDividend(data){
    let divData=[]
    for(var i=1;i<data.length;i++){
        let row = data[i].split(',')
        divData.push({
            date:new Date(row[0]),
            dividend:Number(row[1])
        })
    }
    divData.sort((a,b)=> a.date-b.date)
    return divData
}

export function calculateYahooPrice(data){

    let priceData=[]
    for(var i=data.length-1;i>0;i--){
        let row=data[i].split(',')
        priceData.push({
            date:row[0],
            high:row[2],
            low:row[3],
            close:row[4],
            volume:row[6]
        })
    }
    return priceData
}

function calculateFinancialNumber(keys,index,keyData){

    for(var i=0;i<keys.length;i++){
        if(keyData[keys[i]]){
            return parseNumber(keyData[keys[i]][index])
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
    return Number(number)
}

function calculateKeyData(data){
    let fData={}
    for(var i=0;i<data.length;i++){
        let row=data[i].split('\t')
        fData[row[0]]=row
        fData[row[0]].shift()
    }
    return fData
}   
