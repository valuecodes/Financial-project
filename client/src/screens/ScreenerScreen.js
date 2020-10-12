import React,{useState,useEffect} from 'react'
import { useSelector } from 'react-redux'
import { Screener } from '../utils/screener';
import MultiRange from '../components/MultiRange'
import Table from '../components/Table'
import TickersFound from '../components/TickersFound'

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
 
    return (
        <div className='screenerScreen container'>
            {error&&<div>Error</div>}
            <div className='screenerInputContainer'>                
                <TickersFound
                    tickersFound={screener.screenedTickers.length} 
                    loading={loading}
                    className={'tickersFoundBig'}
                />
                <ScreenerOptions 
                    screener={screener} 
                    setScreener={setScreener}
                />
                {Object.keys(screener.inputs).map(input=>     
                    <MultiRange 
                        key={input} 
                        input={screener.inputs[input]} 
                        screener={screener} 
                        setScreener={setScreener}
                    />
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
