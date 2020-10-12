import React from 'react'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { camelCaseToString } from '../utils/utils';

export default function Table(props){

    const {
        headers,
        currentHeader,
        setCurrentHeader,
        tbody,
        tbodyHead,
        tbodyItems
    } = props

    return(
        <table className='table'>
            <thead>
                <tr>
                    {headers.map(item => 
                        <th key={item}
                            style={{color:item===currentHeader&&'lightgreen'}}
                            onClick={() => setCurrentHeader(item)}
                        >
                        {camelCaseToString(item)}
                        <KeyboardArrowDownIcon
                            style={{
                                height:'20px',
                                width:'20px'
                            }}
                        /></th>
                    )}
                </tr>
            </thead>
            <tbody>
                {tbody.map(item => 
                    <tr key={item[tbodyHead]}>
                        <td>{item[tbodyHead]}</td>
                        {Object.keys(item[tbodyItems]).map(td =>
                            td!=='date'?<td 
                            style={{backgroundColor:td===currentHeader&&'rgb(173, 173, 173)'}}
                            key={td}
                            >{item[tbodyItems][td]}</td>:null
                        )}
                    </tr>
                )}                                     
            </tbody>
        </table>
    )
}