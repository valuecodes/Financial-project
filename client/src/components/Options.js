import React from 'react'
import SetTimePeriod from './SetTimePeriod'
import { camelCaseToString } from '../utils/utils';

export default function Options(props){

    const {
        options,
        setOptions,
    } = props

    return (
        <div className='options'>
            <ul>
                {options.options.map(item =>
                    <li
                        key={item}
                        onClick={() => setOptions({...options,selected:item})}
                        style={{
                            backgroundColor:item===options.selected&&'rgba(0, 0, 0, 0.2)',
                            borderBottom:item===options.selected&&'0.2rem solid lightgreen'
                        }}
                        >{camelCaseToString(item)}
                    </li>
                )}
            </ul>
            <SetTimePeriod options={options} setOptions={setOptions}/>
        </div>
    )
}