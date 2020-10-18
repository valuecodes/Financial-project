import React,{ useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { TickerList } from '../utils/tickerList';
import { listTickers } from '../actions/tickerActions';

export default function HomeScreen() {
    const dispatch = useDispatch()
    const [tickerList, setTickerList] = useState(new TickerList())
    const tickerListData = useSelector(state => state.tickerListData)
    const { tickers } = tickerListData

    useEffect(()=>{
        dispatch(listTickers())
    },[])

    useEffect(() => {
        if(tickers){
            let newTickerList = new TickerList(tickers) 
            setTickerList(newTickerList)
        }
    }, [tickers])
    
    return (
        <div className='homeScreen container'>
            <MainSide tickerList={tickerList} />
            <TickerTable tickerList={tickerList}/>
        </div>
    )
}

function TickerTable({tickerList}){
    return(
        <div className='tickerTable'>
            {tickerList.tickers.map(ticker =>
                <Link key={ticker.ticker} to={'/ticker/'+ticker.ticker} className='tickerTableTicker'>
                    <h3>{ticker.ticker} </h3>
                    <p           
                        style={{
                        color:ticker.percentageChangeColor(),
                    }}>{ticker.latestPrice.percentageChange}%</p>
                </Link>                
            )}
        </div>
    )
}

function MainSide({tickerList}){

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
                                <p>{tickerList.getLatestPrice(ticker.ticker)}</p>
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
