import React from 'react'

export default function TickersFound(props) {
    
    const {
        tickersFound=0,
        total, 
        showTotal = false,
        className='',
        loading=false
    } = props

    const tickersFoundStyle = (count) =>{
        let color = 'rgba(0, 255, 128, 0.473)'
        if(count===0) color = 'rgba(255, 0, 0, 0.473)'
        if(count===0&&total===0) color = 'rgba(239, 255, 22, 0.801)'
        if(count===0&&loading) color = 'rgba(239, 255, 22, 0.801)'
        return {backgroundColor:color}
    }

    return (
        <div 
            className={'tickersFound '+className}
            style={tickersFoundStyle(tickersFound)}
        >
            <h3>Tickers found: </h3>
            <label>{tickersFound} {showTotal&&`/ ${total}`}</label>
        </div>    
    )
}
