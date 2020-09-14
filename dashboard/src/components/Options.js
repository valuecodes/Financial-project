import React from 'react'
import { camelCaseToString } from '../utils/utils';
import {SetTimePeriod} from './graphComponents'

export default function Options({options,setOptions}) {
    console.log(options)
    return (
        <div className='options'>
            <div className='modes optionContainer'>
                <label>Charts</label>
                {options.modes.map(mode => 
                    <button
                        className='optionHeader'
                        onClick={() => setOptions({...options,selectedMode:mode})}
                        style={{backgroundColor:options.selectedMode===mode&&'lightgreen'}}
                    >{camelCaseToString(mode)}</button>
                )}                
            </div>
            {options.selectedMode&&
                <SubOptions subOptions={options[options.selectedMode]} options={options} setOptions={setOptions} mode={options.selectedMode}/>
            }
            <div className='timeOptions optionContainer'>
                <label>Period</label>
                <SetTimePeriod options={options} setOptions={setOptions}/>
            </div>
        </div>
    )
}

function SubOptions({subOptions,options,setOptions,mode}){
    return(
        <>
         {Object.keys(subOptions).map(subOption =>
            <div className='subOptions optionContainer'>
                <label>{camelCaseToString(subOption)}</label>
                {subOptions[subOption].optionType==='single'?
                    <SubOptionSingle 
                        subOption={subOptions[subOption]} 
                        optionName={subOption}
                        mode={mode}
                        options={options}
                        setOptions={setOptions}
                    />:
                    <SubOptionMulti                         
                        subOption={subOptions[subOption]} 
                        optionName={subOption}
                        mode={mode}
                        options={options}
                        setOptions={setOptions}
                    />
                }
            </div>  
        )}
        </>
    )
}

function SubOptionSingle({subOption,optionName,mode,options,setOptions}){
    return subOption.options.map(option =>
        <button
        onClick={() => setOptions({
            ...options,
            [mode]:{
                ...options[mode],[optionName]:{
                    ...options[mode][optionName],selectedOption:option
                    }
                }
        })}
        style={{backgroundColor:options[mode][optionName].selectedOption===option&&'lightgreen'}}
    >{camelCaseToString(option)}</button>
    )
}

function SubOptionMulti({subOption,optionName,mode,options,setOptions}){
    console.log(options)
    return Object.keys(subOption.options).map(option =>
        <button
        onClick={() => setOptions({
            ...options,
            [mode]:{
                ...options[mode],[optionName]:{
                    ...options[mode][optionName],options:{
                        ...options[mode][optionName].options,
                        [option]:!options[mode][optionName].options[option]
                    }
                    }
                }
        })}
        style={{backgroundColor:options[mode][optionName].options[option]&&'lightgreen'}}
    >{camelCaseToString(option)}</button>
    )
}