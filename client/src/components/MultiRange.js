import React,{useState,useEffect} from 'react'
import { camelCaseToString, roundToTwoDecimal } from '../utils/utils';

export default function MultiRange({ input, screener, setScreenedTickers, setInputs }) {

    const [multiRange,setMultiRange] = useState({
        minValue:0,
        maxValue:0,
        key:'',
    })

    useEffect(()=>{
        setMultiRange(input)
        let screenedTickers = screener.screenTickers()                     
        setScreenedTickers(screenedTickers)               
    },[])

    const handleChange = (e,inputName) =>{
        let value =  Number(e.target.value)
        let updatedInput = screener.updateInput(multiRange,inputName,value)
        setMultiRange({...updatedInput})    
        let screenedTickers = screener.screenTickers()             
        setScreenedTickers(screener.screenTickers())       
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

    const resetMultiRange=(key)=>{
        let updatedInput = screener.resetInput(key)
        setMultiRange({...updatedInput})
        let screenedTickers = screener.screenTickers()
        setScreenedTickers(screenedTickers)               
    }

    const removeInput=(key)=>{
        let updatedInputs = screener.selectActiveInput(key)
        setInputs({...updatedInputs})
        let screenedTickers = screener.screenTickers()
        setScreenedTickers(screenedTickers)
    }

    const {
        key,min,max,minValue,maxValue,
        range,scaleFrom,scaleTo,active,ticks
    } = multiRange

    return !input.active?null:
        <div className='multiRange'>
            <div className='multiRangeHeader'>
                <label>{camelCaseToString(key)}</label>
                <button onClick={() => resetMultiRange(key)} className='button'>Reset</button>
                <button onClick={() => removeInput(key)} className='button'>Remove</button>
            </div>
            <div className='inputContainer'>
                <input 
                    className='minInput'
                    onChange={e => handleChange(e,'minValue')}
                    min={scaleFrom} 
                    max={scaleTo} 
                    value={minValue}
                    step={ticks}
                    type='range'
                />
                <input
                    className='maxInput'
                    onChange={e => handleChange(e,'maxValue')}
                    min={scaleFrom} 
                    max={scaleTo} 
                    value={maxValue}
                    step={ticks}                     
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
