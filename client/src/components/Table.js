import React,{useEffect,useState} from 'react'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { camelCaseToString } from '../utils/utils';

export default function Table(props){

    const [table,setTable] = useState({
        headers:[],
        tbody:[],
        tbodyHead:'',
        tbodyItems:'',
        sortOrder:{value:'',ascending:true}
    })

    useEffect(()=>{

        const {
            headers,
            tbody,
            tbodyHead,
            tbodyItems
        } = props   

        setTable({
            ...table,
            headers,
            tbody,
            tbodyHead,
            tbodyItems
        })

    },[props])

    const formatNumber=(number)=>{
        if(!number) return''
        return number
    }

    const getTextColor = (number) =>{
        if(!number) return''
        if(number<0) return '#a51414'
        if(typeof number === 'number') return
        if(number.substring(0,1)==='+') return 'green'
    }

    const sortItemsBy = (newValue) => {
        const updatedTable = {...table}
        const { ascending } = updatedTable.sortOrder
        const oldValue = updatedTable.sortOrder.value
        
        updatedTable.sortOrder.value = newValue
        updatedTable.sortOrder.ascending = oldValue===newValue?!ascending:ascending

        updatedTable.tbody.sort((a,b)=>
            updatedTable.sortOrder.ascending?
            b[newValue]-a[newValue]:
            a[newValue]-b[newValue]
        )

        setTable({...updatedTable})
    }

    const {
        headers,
        tbody,
        sortOrder
    } = table
    
    return(
        <table className='table'>
            <thead>
                <tr>
                    {headers.map(item => 
                        <th key={item}
                            style={{color:item===sortOrder.value&&'lightgreen'}}
                            onClick={() => sortItemsBy(item)}
                        >
                        {camelCaseToString(item)}
                        {sortOrder.value===item?
                            sortOrder.ascending?
                            <KeyboardArrowUpIcon
                                style={{
                                    height:'20px',
                                    width:'20px'
                                }}
                            />:
                            <KeyboardArrowDownIcon
                            style={{
                                height:'20px',
                                width:'20px'
                            }}
                            />
                            :null                    
                        }
                        </th>
                    )}
                </tr>
            </thead>
            <tbody>
                {tbody.map((item,index) => 
                    <tr key={index}>
                        {Object.keys(item).map(td =>
                            td!=='date'?<td 
                            key={td}
                            style={{
                                backgroundColor:td===sortOrder.value&&'rgba(173, 173, 173,0.8)',
                                color: getTextColor(item[td])
                            }}    
                                key={td}
                            >{formatNumber(item[td])}</td>:null
                        )}
                    </tr>
                )}                                     
            </tbody>
        </table>
    )
}