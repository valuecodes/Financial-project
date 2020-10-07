import React,{useState,useEffect} from 'react'
import { useSelector } from 'react-redux'
import { Screener } from '../utils/screener';
import { camelCaseToString } from '../utils/utils';
import MultiRange from '../components/MultiRange'
import Icon from '@material-ui/core/Icon';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { height, width } from '@material-ui/system';
import Table from '../components/Table'

export default function ScreenerScreen() {

    const [screener,setScreener]=useState(new Screener())
    const tickerListData = useSelector(state => state.tickerListData)
    const { loading, tickers, error } = tickerListData

    useEffect(()=>{
        if(tickers){
            let screener = new Screener(tickers)
            screener.init()
            setScreener(screener)
        }
    },[tickers])
    
    const tickersFoundStyle = () =>{
        let color = 'rgba(0, 255, 128, 0.473)'
        if(screener.screenedTickers.length===0) color = 'rgba(255, 0, 0, 0.473)'
        if(screener.screenedTickers.length===0&&loading) color = 'rgba(239, 255, 22, 0.801)'
        return {backgroundColor:color}
    }
 
    return (
        <div className='screenerScreen container'>
            {error&&<div>Error</div>}
            <div className='screenerInputContainer'>                
                <div className='tickersFound' style={tickersFoundStyle()}>
                    <h2>Tickers found: </h2>
                    <label>{screener.screenedTickers.length}</label>
                </div>
                <div className='screenerOptions'>
                    <ScreenerOptions 
                        screener={screener} 
                        setScreener={setScreener}
                    />
                </div>
                {Object.keys(screener.inputs).map(input=>
                    input!=='date'?                
                    <MultiRange 
                        key={input} 
                        input={screener.inputs[input]} 
                        screener={screener} 
                        setScreener={setScreener}
                    />:null
                )}
            </div>
            <ScreenerList screener={screener} setScreener={setScreener}/>            
        </div>
    )
}

function ScreenerOptions({screener, setScreener}){

    const selectInput=(input)=>{
        let updated = screener.selectActiveInput(input)
        setScreener({...updated})
    }

    return(
        <div className='screenerOptions'>
            <h3>Select ratios...</h3>
            <div className='activeInputs'>
                {Object.keys(screener.inputs).map((input,index) =>
                    <button 
                    key={index}
                    style={{backgroundColor:screener.inputs[input].active&&'lightgreen'}}
                    onClick={() => selectInput(input)}>{input}</button>
                )}
            </div>
        </div>
    )
}

function ScreenerList({screener, setScreener}){

    const setSortOrder = (value) => {
        let updated = screener.setSortOrder(value)
        setScreener({...updated})
    }

    return(
        <div className='screenerList'>
            <Table
                headers={screener.ratios}
                currentHeader={screener.sortOrder.value}
                setCurrentHeader={setSortOrder}
                tbody={screener.screenedTickers}
                tbodyHead={'ticker'}
                tbodyItems={'ratios'}
            />
        </div>
    )
}
