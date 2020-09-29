import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
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
                    <TickerTableTicker key={ticker._id} ticker={ticker}/>
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
            <p           
                style={{
                color:tickerSlim.percentageChangeColor(),
            }}>{tickerSlim.percentageChange()}%</p>
        </Link>
    )
}

function MainSide({tickers}){

    const userSignin = useSelector(state => state.userSignin)
    const { loading, userInfo, error } = userSignin
    const portfolioSelected = useSelector(state => state.portfolioSelected)
    const { selectedPortfolio } = portfolioSelected

    return(
        <section className='card portfolioSection'>
            {loading&&<div>Loading...</div>}
            {error&&<div>Error</div>}
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
        return roundToTwoDecimal(tickers.find(item => item.ticker===ticker.ticker).price[0].close)
    }
}