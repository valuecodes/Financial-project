import { tickerInit, calculateFilterByDate, handleGetPriceRatio } from './calculations/tickerCalculations';

export default function MachineLearning(data){
    this.profile = data?data.profile:{}
    this.incomeStatement = data?data.incomeStatement:[]
    this.balanceSheet = data?data.balanceSheet:[]
    this.cashFlow = data?data.cashFlow:[]
    this.insiderTrading = data?data.insiderTrading:[]
    this.dividendData = data?data.dividendData:[]
    this.priceData = data?data.priceData:[]
    this.chart={
        data:{},
        options:{
            responsive:true,
            maintainAspectRatio: false,            
        }
    } 
    this.filterByDate = (key,options) => calculateFilterByDate(this,key,options)
    this.getPriceRatio = (ratioName,options) => handleGetPriceRatio(this,ratioName,options)
    this.init = () => tickerInit(this)
}