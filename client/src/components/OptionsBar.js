import React from 'react'
import { camelCaseToString } from '../utils/utils';

export default function OptionsBar(props){

    const {
        options, 
        selected, 
        format=null, 
        selectOption
    } = props

    const getStyle=(option,selected)=>{
        let color = ''
        let borderColor=''
        switch(format){
            case 'y/x':
                const { y, x } = selected
                if(y===option.y&&x===option.x){
                    color='rgba(0, 0, 0, 0.2)'
                    borderColor='0.2rem solid lightgreen'
                } 
                break
            default: return option
        }
        return{
            backgroundColor:color,
            borderBottom:borderColor
        }
    }

    const formatOption=(option,format)=>{
        switch(format){
            case 'y/x':
                return `${camelCaseToString(option.y)} / ${camelCaseToString(option.x)}`
            default: return option
        }
    }

    return(
        <div className='options'>
            <ul>
            {options && options.map((option,index) =>
                <li 
                    key={index}
                    style={getStyle(option,selected)}
                    onClick={()=>selectOption(option)}
                >
                    {formatOption(option,format)}
                </li>
            )}                
            </ul>
        </div>  
    )
}