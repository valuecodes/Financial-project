const mongoose = require('mongoose')

const insiderTradingSchema = new mongoose.Schema({
    date:{type:Date},
    instrument:{type:String},
    name:{type:String},
    position:{type:String},
    price:{type:Number},
    type:{type:String},
    volume:{type:Number}
})

const incomeStatementSchema = new mongoose.Schema({
    date:{type:Date, required:true},
    revenue:{type:Number},
    costOfRevenue:{type:Number},
    grossProfit:{type:Number},
    researchAndDevelopment:{type:Number},
    sgaExpenses:{type:Number},
    depreciationAmortization:{type:Number},
    otherOperatingExp:{type:Number},
    totalOperationgExp:{type:Number},
    operatingIncome:{type:Number},
    interestIncome:{type:Number},
    otherNetIncome:{type:Number},
    incomeTaxProvision:{type:Number},
    netIncome:{type:Number},
    sharesOutstanding:{type:Number},
    dividendsPerShare:{type:Number},
    eps:{type:Number},
})

const balanceSheetSchema = new mongoose.Schema({
    date:{type:Date, required:true},
    cash:{type:Number},
    netReceivables:{type:Number},
    totalReceivables:{type:Number},
    inventory:{type:Number},
    prepaidExpenses:{type:Number},
    otherCurrentAssets:{type:Number},
    currentAssets:{type:Number},
    propertyPlantEquiment:{type:Number},
    accumalatedDepreciation:{type:Number},
    goodwill:{type:Number},
    intangibles:{type:Number},
    noteReceivables:{type:Number},
    otherLongTermAssets:{type:Number},
    totalAssets:{type:Number},
    accountsPayable:{type:Number},
    accruedExpenses:{type:Number},
    shortTermDebt:{type:Number},
    capitalLeases:{type:Number},
    otherCurrentLiabilities:{type:Number},
    currentLiabilities:{type:Number},
    longTermDebt:{type:Number},
    capitalLeaseObligations:{type:Number},
    totalLongTermDebt:{type:Number},
    totalDebt:{type:Number},
    otherLiabilities:{type:Number},
    totalLiabilities:{type:Number},
    apic:{type:Number},
    retainedEarnigs:{type:Number},
    totalEquity:{type:Number},
    bookValuePerShare:{type:Number},
    treasuryStock:{type:Number},
})

const cashFlowSchema = new mongoose.Schema({
    date:{type:Date, required:true},
    netIncome:{type:Number},
    depreciationDepletion:{type:Number},
    nonCashItems:{type:Number},
    cashTaxesPaid:{type:Number},
    cashInterestPaid:{type:Number},
    changesInWorkingCapital:{type:Number},
    operatingCashFlow:{type:Number},
    capEx:{type:Number},
    otherInvesting:{type:Number},
    investingCashFlow:{type:Number},
    dividendsPaid:{type:Number},
    issuanceRetirementOfDebt:{type:Number},
    financingCashFlow:{type:Number},
    foreignExchangeEffects:{type:Number},
    netChangeinCash:{type:Number},
    issuanceRetirementOfStock:{type:Number},
})

const priceDataSchema = new mongoose.Schema({
    date:{type:Date, required:true},
    high:{type:Number},
    low:{type:Number},
    close:{type:Number},
    volume:{type:Number},
})

const dividendDataSchema = new mongoose.Schema({
    date:{type:Date, required:true},
    dividend:{type:Number, required:true}
})

const profileSchema = new mongoose.Schema({
    ticker:{type: String, required:true, unique:true},
    name:{type: String, required: true},
    description:{type: String},
    sector:{type: String, required: true},
    industry:{type: String, required: true},
    subIndustry:{type: String},
    stockExhange:{type: String},
    founded:{type:Date},
    address:{type: String},
    phone:{type: String},
    website:{type: String},
    employees:{type: Number},
    country:{type: String},
    tickerCurrency:{type: String},
    financialDataCurrency:{type:String}    
})

const additionalRatioSchema = new mongoose.Schema({
    date:{type:Date, required:true},
    value:{type:Number}
})

const additionalRatiosSchema=new mongoose.Schema({
    name:{type: String, required: true},
    period:{type: String, default:'yearly'},
    ratios:[additionalRatioSchema],
})

const tickerSchema = new mongoose.Schema({
    profile:profileSchema,
    incomeStatement:[incomeStatementSchema],
    balanceSheet:[balanceSheetSchema],
    cashFlow:[cashFlowSchema],
    priceData:[priceDataSchema],
    dividendData:[dividendDataSchema],
    insiderTrading:[insiderTradingSchema],
    additionalRatios:[additionalRatiosSchema]
})

const tickerModel = mongoose.model('Ticker', tickerSchema)

module.exports = tickerModel