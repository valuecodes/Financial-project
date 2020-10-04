import React,{useState,useEffect} from 'react'
import { useSelector } from 'react-redux'
import { Screener } from '../utils/screener';
import { camelCaseToString } from '../utils/utils';
import MultiRange from '../components/MultiRange'

export default function ScreenerScreen() {

    const [screener,setScreener]=useState(null)
    const [screenedTickers,setScreenedTickers]=useState([])
    const [inputs,setInputs]=useState([])
    const tickerListData = useSelector(state => state.tickerListData)
    const { loading, tickers, error } = tickerListData

    useEffect(()=>{
        if(tickers){
            let screener = new Screener(tickers)
            screener.init()
            setScreener(screener)
            setInputs({...screener.inputs})
        }
    },[tickers])
    
    const tickersFoundStyle = () =>{
        let color = 'rgba(0, 255, 128, 0.473)'
        if(screenedTickers.length===0) color = 'rgba(255, 0, 0, 0.473)'
        if(screenedTickers.length===0&&loading) color = 'rgba(239, 255, 22, 0.801)'
        return {backgroundColor:color}
    }
 
    return (
        <div className='screenerScreen container'>
            {error&&<div>Error</div>}
            <div className='screenerInputContainer'>                
                <div className='tickersFound' style={tickersFoundStyle()}>
                    <h2>Tickers found: </h2>
                    <label>{screenedTickers.length}</label>
                </div>
                <div className='screenerOptions'>
                <ScreenerOptions 
                    screener={screener} 
                    inputs={inputs} 
                    setInputs={setInputs}
                />
                </div>
                {Object.keys(inputs).map(input=>
                    input!=='date'?                
                    <MultiRange 
                        key={input} 
                        input={inputs[input]} 
                        screener={screener} 
                        screenedTickers={screenedTickers} 
                        setScreenedTickers={setScreenedTickers} 
                        setInputs={setInputs}
                    />:null
                )}
            </div>
            <ScreenerList screenedTickers={screenedTickers}/>            
        </div>
    )
}

function ScreenerOptions({screener, inputs, setInputs}){

    const [inputList,setInputList]=useState({})

    useEffect(()=>{
        if(screener){
            setInputList(screener.inputs)
        }
    },[screener])

    const selectInput=(input)=>{
        screener.selectActiveInput(input)
        setInputs({...screener.inputs})
    }

    return(
        <div className='screenerOptions'>
            <h3>Select ratios...</h3>
            <div className='activeInputs'>
                {Object.keys(inputList).map((input,index) =>
                    <button 
                    key={index}
                    style={{backgroundColor:inputs[input].active&&'lightgreen'}}
                    onClick={() => selectInput(input)}>{input}</button>
                )}
            </div>
        </div>
    )
}

function ScreenerList({screenedTickers}){

    const [table,setTable]=useState({
        thead:[],
        tbody:[]
    })

    useEffect(()=>{
        if(screenedTickers[0]){
            const ratios = Object.keys(screenedTickers[0].ratios).filter(item => item!=='date')
            ratios.unshift('Tickers')
            const tickers = screenedTickers
            setTable({thead:ratios,tbody:tickers})
        }
    },[screenedTickers])

    return(
        <div className='screenerList'>
            <table>
                <thead>
                    <tr>
                        {table.thead.map(item => 
                            <th key={item}>{camelCaseToString(item)}</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {screenedTickers.map(ticker => 
                        <tr className='screenerTableTicker' key={ticker.ticker}>
                            <td>{ticker.ticker}</td>
                            {Object.keys(ticker.ratios).map(ratio =>
                                ratio!=='date'?<td key={ratio}>{ticker.ratios[ratio]}</td>:null
                            )}
                        </tr>
                    )}                                     
                </tbody>
            </table>
        </div>
    )
}