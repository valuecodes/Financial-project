import React,{useEffect,useState } from 'react'
import { useSelector,useDispatch } from 'react-redux'
import { listTickers, getPortfolioTickersData } from '../actions/tickerActions';
import { listUserPortfolios } from '../actions/portfolioActions';
import { Link} from 'react-router-dom'
import { Portfolio } from '../utils/portfolio';
import { roundToTwoDecimal } from '../utils/utils';
import { TickerSlim } from '../utils/tickerSlim';

export default function HomeScreen() {

    const tickerList = useSelector(state => state.tickerList)
    const { tickers } = tickerList
    
    return (
        <div className='homeScreen container'>
            <MainSide tickers={tickers} />
            <TickerTable tickers={tickers}/>
        </div>
    )
}

function TickerTable({tickers}){
    return(
        <div className='tickerTable'>
            {tickers&&
                tickers.map(ticker =>
                    <TickerTableTicker ticker={ticker}/>
                )           
            }
        </div>
    )
}

function TickerTableTicker({ticker}){
    const tickerSlim = new TickerSlim(ticker)
    return(
        <Link to={'/ticker/'+tickerSlim.ticker} className='tickerTableTicker'>
            <h3>{tickerSlim.ticker} </h3>
            <p            style={{
                color:tickerSlim.percentageChangeColor(),
            }}>{tickerSlim.percentageChange()}%</p>
        </Link>
    )
}

function calculateTickerPercentage(ticker){
    return roundToTwoDecimal(((ticker[3]-ticker[4])/ticker[3])*100)
}

function MainSide({tickers}){

    const [portfolio,setPortfolio] = useState(null)
    const userSignin = useSelector(state => state.userSignin)
    const { loading, userInfo, error } = userSignin
    const portfolioSelected = useSelector(state => state.portfolioSelected)
    const { selectedPortfolio } = portfolioSelected
    const tickerPortfolioData = useSelector(state => state.tickerPortfolioData)
    const { loading1, portfolioData, error1 } = tickerPortfolioData

    return(
        <section className='card portfolioSection'>
            {!userInfo?<div><h2>Hello visitor</h2></div>:
                <>
                <h1 className='mainHeader'>Hello {userInfo.name}</h1>
                <div className='portfolioListTickers'>
                    {selectedPortfolio&&
                        <>
                        <h2>Portfolio: <Link to={'/portfolio/'+selectedPortfolio._id}>{selectedPortfolio.name}</Link></h2>
                        {selectedPortfolio.tickers.map(ticker =>
                            <div key={ticker._id} className='portfolioListTicker'>
                                <Link to={'/ticker/'+ticker.ticker}>{ticker.ticker}</Link>   
                                <p>{ticker.name}</p>
                                <TickerPrice ticker={ticker} tickers={tickers}/>
                            </div>
                        )}         
                    </>  
                    }             
                </div>   
                </>         
            }
        </section> 
    ) 
}

function TickerPrice({ticker,tickers}){
    const price = getTickerPriceFromList(ticker,tickers)
    return(
        <p className='tickerPrice'>
        {price}
        </p>
    )
}

function getTickerPriceFromList(ticker,tickers){
    if(tickers){
        return roundToTwoDecimal(tickers.find(item => item[1]===ticker.ticker)[3])
    }
}