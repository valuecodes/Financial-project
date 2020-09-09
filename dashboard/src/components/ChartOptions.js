import React from 'react'
import {SetTimePeriod} from './graphComponents'
import { camelCaseToString } from '../utils/utils';

export default function ChartOptions({options,setOptions}) {
    return (
        <div className='chartOptions'>
                <div className='chartTypeOptions'>
                    <button
                        onClick={()=>setOptions({...options,type:'price'})}
                        style={{backgroundColor:options.type==='price'&&'lightgreen'}}
                    >Price Chart</button>
                    <button 
                        onClick={()=>setOptions({...options,type:'return'})}
                        style={{backgroundColor:options.type==='return'&&'lightgreen'}}
                    >Return Chart</button>                
                </div>       
                <div>
                    {options.values.select.map(key =>
                        <button
                            key={key}
                            style={{backgroundColor:options.values.selected===key?'lightgreen':''}} 
                            onClick={() => setOptions({...options,values:{select:[...options.values.select],selected:key}})}>
                            {camelCaseToString(key)}
                        </button>
                    )}
                </div>         
                <SetTimePeriod options={options} setOptions={setOptions} />
        </div>
    )
}
