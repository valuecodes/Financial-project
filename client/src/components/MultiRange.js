import React,{useState,useEffect} from 'react'
import { camelCaseToString, roundToTwoDecimal } from '../utils/utils';

export default function MultiRange({ input, screener, setScreenedTickers, setInputs }) {
    const [multiRange,setMultiRange] = useState({
        minValue:0,
        maxValue:0,
        key:'',
    })

    useEffect(()=>{
        let offSet = input.scaleTo<14?1.4:2
        let ticks = input.ticks
        setMultiRange({
            ...input,
            minValue:input.scaleFrom,
            maxValue:input.scaleTo,
            range:(input.scaleTo+offSet*ticks)-(input.scaleFrom-offSet*ticks),
            scaleFrom:input.scaleFrom-1*ticks,
            scaleTo:input.scaleTo+1*ticks,
        })
    },[])

    useEffect(()=>{
        if(multiRange.key){
            screener.updateInput(multiRange)
            let tickers = screener.screenTickers()
            setScreenedTickers(tickers)
        }
    },[multiRange])

    const handleChange = (e,inputName) =>{
        let value =  Number(e.target.value)
        if(multiRange.minValue>=multiRange.maxValue){
            let maxBack = inputName==='maxValue'||value>=multiRange.maxValue?0:1
            let minBack = inputName==='minValue'||value<=multiRange.minValue?0:1
            let updatedMax = multiRange.minValue+maxBack
            let updatedMin = multiRange.maxValue-minBack
            setMultiRange({...multiRange,minValue:updatedMin,maxValue:updatedMax})
        }else{
            setMultiRange({...multiRange,[inputName]:value})        
        }
    }

    const inputBarStyle = (range) =>{
        let startValue = range.minValue-range.scaleFrom
        let percentage = (startValue*100)/range.range
        let endValue = (range.scaleTo-range.maxValue)
        let length = ((range.range-endValue)*100)/range.range
        return{
            marginLeft:percentage+'%',
            width:length-percentage+'%'
        }
    }

    const resetMultiRange=()=>{
        setMultiRange({
            ...multiRange,
            minValue:multiRange.scaleFrom+1,
            maxValue:multiRange.scaleTo-1,
        })
    }

    const removeInput=(input)=>{
        screener.selectActiveInput(input)
        setInputs({...screener.inputs})
    }

    const {
        key,
        min,
        max,
        minValue,
        maxValue,
        range,
        scaleFrom,
        scaleTo,
        active,
        ticks
    } = multiRange

    return !input.active?null:
        <div className='multiRange'>
            <div className='multiRangeHeader'>
                <label>{camelCaseToString(multiRange.key)}</label>
                <button onClick={() => resetMultiRange()} className='button'>Reset</button>
                <button onClick={() => removeInput(multiRange.key)} className='button'>Remove</button>
            </div>
            <div className='inputContainer'>
                <input 
                    className='minInput'
                    onChange={e => handleChange(e,'minValue')}
                    min={multiRange.scaleFrom} 
                    max={multiRange.scaleTo} 
                    value={multiRange.minValue}
                    step={multiRange.ticks}
                    type='range'
                />
                <input
                    className='maxInput'
                    onChange={e => handleChange(e,'maxValue')}
                    min={multiRange.scaleFrom} 
                    max={multiRange.scaleTo} 
                    value={multiRange.maxValue}
                    step={multiRange.ticks}                     
                    type='range'
                />
                <div 
                    style={inputBarStyle(multiRange)}
                    className='inputBar'>
                        <label 
                            className='minInput'>
                            { minValue<=scaleFrom?(scaleFrom+1*ticks).toFixed(1)+'>':minValue.toFixed(1)}
                        </label>
                        <label
                            className='maxInput'>
                            {maxValue>=scaleTo?'< '+(scaleTo-1*ticks).toFixed(1):maxValue.toFixed(1)}
                        </label>  
                    </div>
            </div>
        </div>
}
