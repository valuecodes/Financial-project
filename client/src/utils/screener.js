export function Screener(tickers){
    this.tickers = tickers
    this.inputs = {}
    this.selectActiveInput = (inputName) => calculatSelectActiveInput(this,inputName)
    this.updateInput = (input) => updateScreenerInput(this,input)
    this.screenTickers = () => calculateScreenTickers(this)
    this.init = () => initScreener(this)
}

function calculatSelectActiveInput(screener,inputName){
    let inputFound = screener.inputs[inputName].active
    screener.inputs[inputName].active = !inputFound
    return screener.inputs
}

function updateScreenerInput(screener,input){
    let key = input.key
    screener.inputs[key] = input 
}

function calculateScreenTickers(screener){

    const { tickers, inputs } = screener
    let screenedTickers = [...tickers]
    let activeInputs = Object.keys(inputs).filter(item => inputs[item]. active)

    activeInputs.forEach(input=>{
        let remove = []
        screenedTickers.forEach(ticker=>{

            let {
                minValue,
                maxValue,
                scaleFrom,
                scaleTo,
                min,
                max,
            } = inputs[input]

            let tickerRatio = ticker.ratios[input]

            if(minValue===scaleFrom){
                minValue = min
            }

            if(maxValue===scaleTo){
                maxValue = max
            }

            if(tickerRatio<minValue||tickerRatio>maxValue){
                remove.push(ticker.ticker)
            }
        })
        screenedTickers=screenedTickers.filter(item => !remove.includes(item.ticker))
    })
    return screenedTickers
}

function initScreener(screener){
    const { tickers } = screener
    if(screener.tickers[0]){
        let keys = Object.keys(screener.tickers[0].ratios)
        let inputs = {}
        keys.forEach(key=>{
            inputs[key]={
                key,
                min: Math.min(...tickers.map(item => Number(item.ratios[key]))),
                max: Math.max(...tickers.map(item => Number(item.ratios[key]))),
                inputMin:Math.min(...tickers.map(item => Number(item.ratios[key]))),
                inputMax: Math.max(...tickers.map(item => Number(item.ratios[key]))),
                scaleFrom:ratioOptions[key].scaleFrom,
                scaleTo:ratioOptions[key].scaleTo,
                ticks:ratioOptions[key].ticks,
                decimals:ratioOptions[key].decimals,
                textSign:ratioOptions[key].textSign,
                active:ratioOptions[key].activeFromInit
            }   
        })
        screener.inputs=inputs
    }
}

const ratioOptions={
    pe:{
        scaleFrom:0,
        scaleTo:50,
        ticks:1,
        decimals:1,
        textSign:null,
        activeFromInit:true
    },
    pb:{
        scaleFrom:0,
        scaleTo:5,
        ticks:0.1,
        decimals:2,
        textSign:null,
        activeFromInit:false
    },
    divYield:{
        scaleFrom:0,
        scaleTo:15,
        ticks:0.1,
        decimals:2,
        textSign:'%',
        activeFromInit:false
    },
    payoutRatio:{
        scaleFrom:0,
        scaleTo:200,
        ticks:2,
        decimals:2,
        textSign:null,
        activeFromInit:false
    },
    marketCap:{
        scaleFrom:0,
        scaleTo:100000,
        ticks:null,
        decimals:2,
        textSign:'M',
        activeFromInit:false
    },
    currentRatio:{
        scaleFrom:0,
        scaleTo:5,
        ticks:0.1,
        decimals:2,
        textSign:null,
        activeFromInit:false
    },
    profitMargin:{
        scaleFrom:0,
        scaleTo:50,
        ticks:1,
        decimals:2,
        textSign:'%',
        activeFromInit:false
    },
    operatingMargin:{
        scaleFrom:0,
        scaleTo:50,
        ticks:1,
        decimals:2,
        textSign:'%',
        activeFromInit:false
    },
    profitGrowth5Years:{
        scaleFrom:0,
        scaleTo:50,
        ticks:1,
        decimals:2,
        textSign:'%',
        activeFromInit:false
    },
    revenueGrowth5Years:{
        scaleFrom:0,
        scaleTo:50,
        ticks:1,
        decimals:2,
        textSign:'%',
        activeFromInit:false
    },
    peg:{
        scaleFrom:0,
        scaleTo:5,
        ticks:0.1,
        decimals:2,
        textSign:null,
        activeFromInit:false
    },
    roe:{
        scaleFrom:0,
        scaleTo:50,
        ticks:1,
        decimals:2,
        textSign:'%',
        activeFromInit:false
    },
    roa:{
        scaleFrom:0,
        scaleTo:50,
        ticks:1,
        decimals:2,
        textSign:'%',
        activeFromInit:false
    },
}