export const tickerDataModel={
    incomeStatement:{
        date:new Date().toISOString(),
        revenue:null,
        costOfRevenue:null,
        grossProfit:null,
        researchAndDevelopment:null,
        sgaExpenses:null,
        depreciationAmortization:null,
        otherOperatingExp:null,
        totalOperationgExp:null,
        operatingIncome:null,
        interestIncome:null,
        otherNetIncome:null,
        incomeTaxProvision:null,
        netIncome:null,
        sharesOutstanding:null,
        dividendsPerShare:null,
        eps:null,
    },
    balanceSheet:{
        date:new Date().toISOString(),
        cash:null,
        netReceivables:null,
        totalReceivables:null,
        inventory:null,
        prepaidExpenses:null,
        otherCurrentAssets:null,
        currentAssets:null,
        propertyPlantEquiment:null,
        accumalatedDepreciation:null,
        goodwill:null,
        intangibles:null,
        noteReceivables:null,
        otherLongTermAssets:null,
        totalAssets:null,
        accountsPayable:null,
        accruedExpenses:null,
        shortTermDebt:null,
        capitalLeases:null,
        otherCurrentLiabilities:null,
        currentLiabilities:null,
        longTermDebt:null,
        capitalLeaseObligations:null,
        totalLongTermDebt:null,
        totalDebt:null,
        otherLiabilities:null,
        totalLiabilities:null,
        apic:null,
        retainedEarnigs:null,
        totalEquity:null,
        bookValuePerShare:null,
        treasuryStock:null,
    },
    cashFlow:{
        date:new Date().toISOString(),
        netIncome:null,
        depreciationDepletion:null,
        nonCashItems:null,
        cashTaxesPaid:null,
        cashInterestPaid:null,
        changesInWorkingCapital:null,
        operatingCashFlow:null,
        capEx:null,
        otherInvesting:null,
        investingCashFlow:null,
        dividendsPaid:null,
        issuanceRetirementOfDebt:null,
        financingCashFlow:null,
        foreignExchangeEffects:null,
        netChangeinCash:null,
        issuanceRetirementOfStock:null,
    },
    priceData:{
        date:new Date().toISOString(),
        high:null,
        low:null,
        close:null,
        volume:null,
    },
    dividendData:{
        date:new Date().toISOString(),
        dividend:null,
    },
    insiderTrading:{
        name:"",
        position:"",
        date:new Date().toISOString(),
        type:"",
        instrument:"",
        price:null,
        volume:null,   
    },
    latestPrice:{
        date:new Date().toISOString(),
        close:null,
        change:null,
        percentageChange:null,
    },
    ratios:{
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
        brand:null,
        esg:null
    },
    quarterData:{
        date:new Date().toISOString(),
        revenue:null,
        netIncome:null,
        operatingIncome:null,
        eps:null,
        currentAssets:null,
        currentLiabilities:null,
        operatingCashFlow:null,
        investingCashFlow:null,
        financingCashFlow:null,
        totalEquity:null,
        totalDebt:null,
        totalAssets:null, 
        sharesOutstanding:null,  
    },
    monthlyData:{
        date:new Date().toISOString(),
        revenue:null,
        netIncome:null,
        eps:null,
        currentAssets:null,
        currentLiabilities:null,
        bookValuePerShare:null,
        operatingCashFlow:null,
        investingCashFlow:null,
        financingCashFlow:null,
        divYield:null,
        operatingMargin:null,
        profitMargin:null,
        roe:null,
        roa:null,
        payoutRatio:null,
        sharesOutstanding:null,
        price:null,
        dividends:null
    },
    monthlyPrice:{
        date:new Date().toISOString(),
        price:null
    },
    additionalRatios:{
        name:null,
        period:'yearly',
        ratios:[]
    },
    additionalRatio:{
        date:new Date().toISOString(),
        value:null
    },
    profile:{
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
}

export const macroDataModel={
    ratio:{
        name:null,
        frequence:'weekly',
        data:[]
    },
    data:{
        date:new Date().toISOString(),
        value:null
    }
}