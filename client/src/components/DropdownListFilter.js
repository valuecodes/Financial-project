import React from 'react'
import { camelCaseToString } from '../utils/utils';

export default function DropdownListFilter(props){

    const {
        header,
        label,
        listData,
        setFilter,
        selectAll
    } = props

    return(
        <div className='dropdownListFilter'>
            <div className='dropdownListFilterContainer'>
                <div className='dropdownListFilterHeader'>
                    <h3>{camelCaseToString(header)}</h3>  
                    <label>{label}</label>    
                </div>
                <button onClick={()=>selectAll(header)}>Select All</button>
                {Object.keys(listData).map(item =>
                    <div
                        style={{backgroundColor:listData[item].selected&&'rgb(177, 177, 177)'}} 
                        key={item} 
                        className='dropdownListFilterInput'
                    >
                        <input 
                            onChange={()=>setFilter(listData[item])}
                            type='checkbox' 
                            checked={listData[item].selected}
                        >
                        </input>
                        <label>{item}</label>
                        <p>{listData[item].count}</p>
                    </div>
                )}    
            </div>       
        </div>
    )
}
