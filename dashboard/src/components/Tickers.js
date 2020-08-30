import React,{useState,useEffect} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Line } from 'react-chartjs-2';
import { getTickerData } from '../actions/tickerActions';
import { SetTimePeriod } from './graphComponents';

export default function Tickers({portfolio}){

    const [selectedPortfolio, setSelectedPortfolio] = useState(null)
    const [selectedTicker, setSelectedTicker] = useState({
        _id:null
    })

    const portfolioUserList = useSelector(state => state.portfolioUserList)
    const { loading, portfolios,error } = portfolioUserList

    useEffect(() => {
        if(portfolios){
            setSelectedPortfolio(portfolios[0])
        }
    }, [portfolios])

    useEffect(()=>{
        if(selectedPortfolio){
            console.log(selectedPortfolio)
        }
    },[selectedPortfolio])

    return(
        <div className='tickerGraph card'>
            <div className='graphHeader'>
                {portfolios && 
                    <div>{portfolios.map(portfolio => 
                        <button 
                            style={{backgroundColor:selectedPortfolio?portfolio._id===selectedPortfolio._id?'lightgreen':'':''}} className='button' 
                            onClick={e => {setSelectedPortfolio(portfolio);setSelectedTicker({_id:null})}}
                            >{portfolio.name}</button>
                    )}</div>                
                }
                {selectedPortfolio&&
                    <div className='selectedPortfolio'>
                        {selectedPortfolio.tickers.map(ticker =>
                            <button
                                onClick={e => setSelectedTicker(ticker)}
                                style={{backgroundColor: ticker._id === selectedTicker._id? 'lightgreen':''}}
                                >
                            {ticker.ticker}</button>
                        )}
                    </div>
                }  
            </div>
            <TickerGraph selectedTicker={selectedTicker}/>
        </div>
    )
}

function TickerGraph({selectedTicker}){

    const dispatch = useDispatch()
    const [time, setTime] = useState({
        time:0
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
    const tickerData = useSelector(state => state.tickerData)
    const { loading, ticker, error } = tickerData
 
    useEffect(()=>{
        if(selectedTicker.ticker){
            dispatch(getTickerData(selectedTicker.ticker))
        }
    },[selectedTicker])

    useEffect(()=>{
        if(ticker){
            let priceData = ticker.priceData
            if(new Date(priceData[0].date)>new Date(priceData[1].date)){
                priceData = ticker.priceData.reverse()
            }
            priceData = priceData.filter(item => new Date(item.date)>time.time)
            const labels =  priceData.map(item => item.date.split('T')[0])
            const data = priceData.map(item => item.close)
            let newData = {
                labels,
                datasets:[
                    {
                        data
                    }
                ]
            }
            setChart(newData)
        }
    },[ticker,time])

    return(
        <div className='graphContainer'>
            <SetTimePeriod time={time} setTime={setTime}/>

            <Line
                data={chart}
                // width={20}
                // height={3}
                options={{
                    responsive:true,
                    maintainAspectRatio: false}}
                // options={this.state.chartOptions}
            />            
        </div>
    )
}