export function Screener(tickers){
    this.tickers = tickers
    this.inputs = {}
    this.screenedTickers = []
    this.ratios = []
    this.sortOrder = {value:'Tickers',min:true}
    this.selectActiveInput = (inputName) => calculatSelectActiveInput(this,inputName)
    this.resetInput = (inputName) => calculateResetInput(this,inputName)
    this.updateInput = (input,type,value) => updateScreenerInput(this,input,type,value)
    this.screenTickers = () => calculateScreenTickers(this)
    this.setSortOrder = (value) => handleSetSortOrder(this,value)
    this.init = () => initScreener(this)
}

function calculatSelectActiveInput(screener,inputName){
    let inputFound = screener.inputs[inputName].active
    screener.inputs[inputName].active = !inputFound
    if(inputFound){
        screener.resetInput(inputName)
    }
    return screener
}

function calculateResetInput(screener,inputName){
    let ticks = screener.inputs[inputName].ticks
    screener.inputs[inputName].minValue = screener.inputs[inputName].scaleFrom+ticks
    screener.inputs[inputName].maxValue = screener.inputs[inputName].scaleTo-ticks
    return screener.inputs[inputName]
}

function updateScreenerInput(screener,input,type,value){
    let inputName = input.key
    const {
        minValue,
        maxValue
    } = screener.inputs[inputName]
    
    if(minValue>=maxValue){
        let maxBack = type==='maxValue'||value>=maxValue?0:1
        let minBack = type==='minValue'||value<=minValue?0:1
        let updatedMax = minValue+maxBack
        let updatedMin = maxValue-minBack
        screener.inputs[inputName].minValue = updatedMin
        screener.inputs[inputName].maxValue = updatedMax
    }else{
        screener.inputs[inputName][type] = value
    }
    return screener.inputs[inputName]
}

function calculateScreenTickers(screener){

    const { tickers, inputs } = screener
    let screenedTickers = [...tickers]
    let activeInputs = Object.keys(inputs).filter(item => inputs[item].active)

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
    let sortedTickers = []
    let sortOrder = screener.sortOrder.value
    let min = screener.sortOrder.min
    switch(sortOrder){
        case 'Tickers':
            sortedTickers = screenedTickers.sort((a,b)=>
                min?a.ticker-b.ticker:b.ticker-a.ticker  
            )
            break
        default: screenedTickers.sort((a,b)=>
            min?a.ratios[sortOrder]-b.ratios[sortOrder]:
            b.ratios[sortOrder]-a.ratios[sortOrder]
        )
    }
    screener.screenedTickers = screenedTickers
    return screener
}

function handleSetSortOrder(screener,value){
    let min = !screener.sortOrder.min
    screener.sortOrder={ value, min }
    screener.screenTickers()
    return screener
}

function initScreener(screener){

    const { tickers } = screener
    if(screener.tickers[0]){
        let keys = Object.keys(screener.tickers[0].ratios).filter(item => item!=='date')

        let inputs = {}
        keys.forEach(key=>{
            
            const{
                scaleFrom,scaleTo,ticks
            } = ratioOptions[key]
            
            let offSet = scaleTo < 14 ? 1.4 : 2

            inputs[key]={
                key,
                ...ratioOptions[key],
                min: Math.min(...tickers.map(item => Number(item.ratios[key]))),
                max: Math.max(...tickers.map(item => Number(item.ratios[key]))),
                minValue:scaleFrom, 
                maxValue:scaleTo,
                range:(scaleTo+offSet*ticks)-(scaleFrom-offSet*ticks),
                scaleFrom:scaleFrom-1*ticks,
                scaleTo: scaleTo+1*ticks
            }   
        })
        const ratios = Object.keys(tickers[0].ratios)
            .filter(item => item!=='date')
        ratios.unshift('Tickers')   
        
        screener.ratios = ratios
        screener.inputs = inputs
    }
}

const ratioOptions={
    pe:{
        scaleFrom:0,
        scaleTo:50,
        ticks:1,
        decimals:1,
        textSign:null,
        active:true
    },
    pb:{
        scaleFrom:0,
        scaleTo:5,
        ticks:0.1,
        decimals:2,
        textSign:null,
        active:false
    },
    divYield:{
        scaleFrom:0,
        scaleTo:15,
        ticks:0.1,
        decimals:2,
        textSign:'%',
        active:false
    },
    payoutRatio:{
        scaleFrom:0,
        scaleTo:200,
        ticks:2,
        decimals:2,
        textSign:null,
        active:false
    },
    marketCap:{
        scaleFrom:0,
        scaleTo:100000,
        ticks:null,
        decimals:2,
        textSign:'M',
        active:false
    },
    currentRatio:{
        scaleFrom:0,
        scaleTo:5,
        ticks:0.1,
        decimals:2,
        textSign:null,
        active:false
    },
    profitMargin:{
        scaleFrom:0,
        scaleTo:50,
        ticks:1,
        decimals:2,
        textSign:'%',
        active:false
    },
    operatingMargin:{
        scaleFrom:0,
        scaleTo:50,
        ticks:1,
        decimals:2,
        textSign:'%',
        active:false
    },
    profitGrowth5Years:{
        scaleFrom:0,
        scaleTo:50,
        ticks:1,
        decimals:2,
        textSign:'%',
        active:false
    },
    revenueGrowth5Years:{
        scaleFrom:0,
        scaleTo:50,
        ticks:1,
        decimals:2,
        textSign:'%',
        active:false
    },
    peg:{
        scaleFrom:0,
        scaleTo:5,
        ticks:0.1,
        decimals:2,
        textSign:null,
        active:false
    },
    roe:{
        scaleFrom:0,
        scaleTo:50,
        ticks:1,
        decimals:2,
        textSign:'%',
        active:false
    },
    roa:{
        scaleFrom:0,
        scaleTo:50,
        ticks:1,
        decimals:2,
        textSign:'%',
        active:false
    },
}