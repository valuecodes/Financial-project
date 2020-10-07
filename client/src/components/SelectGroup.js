import React from 'react'
import { camelCaseToString } from '../utils/utils';


export default function SelectGroup(props){

    const {
        data,
        selected='',
        selectValue,
        className='',
        selectKey='',
        addOptgroup=false
    } = props

    return(
        <select 
            className={className}
            value={selected}
            onChange={(e)=>selectValue(e.target.value,selectKey)}
        >
            {data.map(item =>
                <optgroup key={item.optgroup} label={camelCaseToString(item.optgroup)}>
                    {item.options.map(value =>
                        <option 
                            value={addOptgroup?item.optgroup+'.'+value:value}
                            key={value}
                        >
                            {camelCaseToString(value)}
                        </option>
                    )}
                </optgroup>
            )}
        </select>
    )
}
