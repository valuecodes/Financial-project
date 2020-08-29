import React,{useEffect,useState} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getPortfolioTickersData } from '../actions/tickerActions';
import { Line } from 'react-chartjs-2'
import { SetTimePeriod } from './graphComponents';
import { calculateDividendTransactions, transactionsToMonths } from '../utils/portfolioUtils';

export default function DividendGraph() {

    
    const [selectedPortfolio, setSelectedPortfolio] = useState(null)    
    const [selectedTicker, setSelectedTicker] = useState({
        _id:null
    })

    const portfolioUserList = useSelector(state => state.portfolioUserList)
    const { loading, portfolios,error } = portfolioUserList

    useEffect(()=>{
        if(portfolios){
            if(portfolios.length!==0){
                setSelectedPortfolio(portfolios[0])
            }
        }
    },[portfolios])



    return (
        <div className='dividendGraph card'>
            <div className='graphHeader'>
                {portfolios && 
                    <div>{portfolios.map(portfolio => 
                        <button 
                            key={portfolio._id}
                            style={{backgroundColor:selectedPortfolio?portfolio._id===selectedPortfolio._id?'lightgreen':'':''}} className='button' 
                            onClick={e => {setSelectedPortfolio(portfolio);setSelectedTicker({_id:null})}}
                            >{portfolio.name}</button>
                    )}</div>                
                }
                {selectedPortfolio&&
                    <div className='selectedPortfolio'>
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
            <MainGraph selectedPortfolio={selectedPortfolio}/>
        </div>
    )
}

function MainGraph({selectedPortfolio}){

    const dispatch = useDispatch()
    const tickerPortfolioData = useSelector(state => state.tickerPortfolioData)
    const {loading:portfolioDataLoading, tickers:tickerData, error:portfolioDataError} = tickerPortfolioData

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
        if(selectedPortfolio){
            dispatch(getPortfolioTickersData(selectedPortfolio._id))
        }
    },[selectedPortfolio])

    useEffect(()=>{
        if(tickerData){
            let dividendTransactions = calculateDividendTransactions(selectedPortfolio,tickerData)

            if(dividendTransactions.length>0){
                let monthlyTransactions = transactionsToMonths(dividendTransactions)
                let labels = monthlyTransactions.labels
                let data = monthlyTransactions.values
                let newData = {
                    labels,
                    datasets:[
                        {
                            data
                        }
                    ]
                }
                setChart(newData)                
            }else{
                let newData = {
                    
                    datasets:[
                        {
                        
                        }
                    ]
                }
                setChart(newData)   
            }
            
        }
    },[tickerData])   

    return(
        <div className='graphContainer'>
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
