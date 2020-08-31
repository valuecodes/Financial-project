import React,{useState,useEffect} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Line } from 'react-chartjs-2';
import { getTickerData } from '../actions/tickerActions';
import { SetTimePeriod } from './graphComponents';
import { getChartOptions } from '../utils/chartUtils';
import 'chartjs-plugin-datalabels';
import { calculateTickerPriceData } from '../utils/portfolioUtils';

export default function Tickers({selectedPortfolio}){

    const [selectedTicker, setSelectedTicker] = useState({
        _id:null
    })
    const tickerPortfolioData = useSelector(state => state.tickerPortfolioData)
    const {loading:portfolioDataLoading, tickers:tickerData, error:portfolioDataError} = tickerPortfolioData
    useEffect(()=>{
        if(tickerData){
            setSelectedTicker(selectedPortfolio.tickers[selectedPortfolio.tickers.length-1])
        }
    },[tickerData])

    return(
        <div className='tickerGraph card'>
            <div className='graphHeader'>
                    <div className='selectedPortfolio'>
                        {selectedPortfolio&&
                            <>
                                {selectedPortfolio.tickers.map(ticker =>
                                    <button
                                        key={ticker._id}
                                        onClick={e => setSelectedTicker(ticker)}
                                        style={{backgroundColor: ticker._id === selectedTicker._id? 'lightgreen':''}}
                                        >
                                    {ticker.ticker}</button>
                                )}
                            </>                                
                        }
                    </div>
            </div>
            <TickerGraph tickerData={tickerData} selectedTicker={selectedTicker} selectedPortfolio={selectedPortfolio}/>
        </div>
    )
}

function TickerGraph({tickerData,selectedTicker,selectedPortfolio}){

    const dispatch = useDispatch()
    const [chartOptions, setChartOptions] = useState({        
        responsive:true,
        maintainAspectRatio: false
    })
    const [time, setTime] = useState({
        time:0
    })
    const [mode, setMode] = useState(null)

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
            let ticker = tickerData.find(item => item.ticker===selectedTicker.ticker)
            if(ticker){

                let { 
                    labels, 
                    data, 
                    points, 
                    pointColors,
                    tooltipLabels, 
                    tooltipFooters 
                } = calculateTickerPriceData(ticker,time,selectedPortfolio)

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

    },[tickerData,selectedTicker,time])

    return(
        <div className='graphContainer'>
            <div className='graphActions'>
                <div className='graphModes'>
                    <button>Buy/sell</button>
                    <button>Insider Trades</button>
                </div>
                <SetTimePeriod time={time} setTime={setTime}/>
            </div>
            
            <Line
                data={chart}
                options={chartOptions}
            />            
        </div>
    )
}