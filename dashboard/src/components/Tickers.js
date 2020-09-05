import React,{useState,useEffect} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Line } from 'react-chartjs-2';
import { getTickerData } from '../actions/tickerActions';
import { SetTimePeriod } from './graphComponents';
import { getChartOptions } from '../utils/chartUtils';
import 'chartjs-plugin-datalabels';
import { calculateTickerPriceData, calculatePortfolioChart } from '../utils/portfolioUtils';

export default function Tickers({selectedPortfolio}){

    const [selectedTicker, setSelectedTicker] = useState({
        _id:null
    })
    const [mode,setMode] = useState('portfolio')
    const tickerPortfolioData = useSelector(state => state.tickerPortfolioData)
    const {loading:portfolioDataLoading, tickers:tickerData, error:portfolioDataError} = tickerPortfolioData
    useEffect(()=>{
        if(tickerData&&selectedPortfolio){
            console.log(tickerData)
            setSelectedTicker(selectedPortfolio.tickers[selectedPortfolio.tickers.length-1])
        }
    },[tickerData])

    return(
        <div className='tickerGraph card'>
            <div className='graphHeader'>
                    <div className='selectedPortfolio'>                        <div className='selectedPortfolioModes'>
                            <button style={{backgroundColor:mode==='tickers'&&'lightgreen'}} onClick={()=>setMode('tickers')}>Tickers</button>
                            <button style={{backgroundColor:mode==='portfolio'&&'lightgreen'}} onClick={()=>setMode('portfolio')}>Portfolio</button>
                        </div>
                        {selectedPortfolio&&
                            <div className='selectedPortfolioTickers'>
                                {selectedPortfolio.tickers.map(ticker =>
                                    <button
                                        key={ticker._id}
                                        onClick={e => setSelectedTicker(ticker)}
                                        style={{backgroundColor: ticker._id === selectedTicker._id? 'lightgreen':''}}
                                        >
                                    {ticker.ticker}</button>
                                )}
                            </div>                                
                        }

                    </div>
            </div>
            {mode==='portfolio'&&
                <PortfolioGraph tickerData={tickerData} selectedPortfolio={selectedPortfolio}/>
            }
            {mode==='tickers'&&
               <TickerGraph tickerData={tickerData} selectedTicker={selectedTicker} selectedPortfolio={selectedPortfolio}/> 
            }
        </div>
    )
}

function PortfolioGraph({tickerData,selectedPortfolio}){
    const dispatch = useDispatch()
    const [chartOptions, setChartOptions] = useState({        
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: false,
            },
        },
    })

    const [options, setOptions] = useState({
        events:{
            absolute:true,
            winLoss:false,
        },
        time:{
            timeValue:'',
            timeStart:'',
            timeEnd:'',            
        }
    })

    const [chart, setChart] = useState({
        type: 'line',
        datasets:[
            {
                data:[]
            }
        ],
        labels: [],
    })

    useEffect(()=>{
        if(tickerData&&selectedPortfolio){
            
            const {data,labels} = calculatePortfolioChart(tickerData,selectedPortfolio,options)

            let newData = {
                labels,
                datasets:[
                    {
                        data,
                        // pointBackgroundColor:pointColors,
                        // pointRadius:points,
                        // pointHitRadius:0,
                        // tooltipLabels,
                        // tooltipFooters
                    }
                ]
            }

            setChart(newData)
        }
    },[tickerData,selectedPortfolio,options])

    return(
        <div className='graphContainer'>
            <div className='graphActions'>
                <div className='eventOptions'>
                    {Object.keys(options.events).map(key =>
                        <button
                            key={key}
                            style={{backgroundColor:options.events[key]?'lightgreen':''}} 
                            onClick={() => setOptions({...options,events:{...options.events,[key]:!options.events[key]}})}>
                            {camelCaseToString(key)}
                        </button>
                    )}
                </div>
                <SetTimePeriod options={options} setOptions={setOptions} />
            </div>
            <Line
                data={chart}
                options={chartOptions}
            />            
        </div>
    )
}

function TickerGraph({tickerData,selectedTicker,selectedPortfolio}){

    const dispatch = useDispatch()
    const [chartOptions, setChartOptions] = useState({        
        responsive:true,
        maintainAspectRatio: false
    })

    const [options, setOptions] = useState({
        events:{
            userTrades:false,
            insiderTrades:false,
            dividends:false,
            userDividends:false,            
        },
        time:{
            timeValue:'',
            timeStart:'',
            timeEnd:'',            
        }
    })

    const [chart, setChart] = useState({
        type: 'line',
        datasets:[
            {
                data:[]
            }
        ],
        labels: [],
    })

    useEffect(()=>{            
        if(tickerData){
            let ticker = tickerData.find(item => item.profile.ticker===selectedTicker.ticker)
            if(ticker){

                let { 
                    labels, 
                    data, 
                    points, 
                    pointColors,
                    tooltipLabels, 
                    tooltipFooters 
                } = calculateTickerPriceData(ticker,selectedPortfolio,options)

                let newData = {
                    labels,
                    datasets:[
                        {
                            data,
                            pointBackgroundColor:pointColors,
                            pointRadius:points,
                            pointHitRadius:0,
                            tooltipLabels,
                            tooltipFooters
                        }
                    ]
                }

                setChart(newData)
                setChartOptions(getChartOptions(tooltipLabels,tooltipFooters))
            }            
        }

    },[tickerData,selectedTicker,options])

    return(
        <div className='graphContainer'>
            <div className='graphActions'>
                <div className='eventOptions'>
                    {Object.keys(options.events).map(key =>
                        <button
                            style={{backgroundColor:options.events[key]?'lightgreen':''}} 
                            onClick={() => setOptions({...options,events:{...options.events,[key]:!options.events[key]}})}>
                            {camelCaseToString(key)}
                        </button>
                    )}
                </div>
                <SetTimePeriod options={options} setOptions={setOptions} />
            </div>
            <Line
                data={chart}
                options={chartOptions}
            />            
        </div>
    )
}

function camelCaseToString(s) {
    return s.split(/(?=[A-Z])/).map(function(p) {
        return p.charAt(0).toUpperCase() + p.slice(1);
    }).join(' ');
}
