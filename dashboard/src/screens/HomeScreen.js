import React,{useEffect, useState } from 'react'
import { useSelector,useDispatch } from 'react-redux'
import { listTickers, getPortfolioTickersData } from '../actions/tickerActions';
import { listUserPortfolios } from '../actions/portfolioActions';
import Tickers from '../components/Tickers'
import Dividends from '../components/Dividends'
import { calculatePortfolioTotal, calculateTickerTotal, calculateTickerCurrentValue } from '../utils/portfolioUtils';
import { Link} from 'react-router-dom'

export default function HomeScreen() {

    const dispatch = useDispatch()
    const userSignin = useSelector(state => state.userSignin)
    const { userInfo } = userSignin
    
    useEffect(()=>{
        dispatch(listTickers())
        dispatch(listUserPortfolios())
    },[])
    
    return (
        <div className='homeScreen container'>
            {userInfo&&
            <>
                <MainSide userInfo={userInfo}/>
                <Main/>
            </>
            }
        </div>
    )
}

function Main(){

    const dispatch=useDispatch()
    const [selectedPortfolio, setSelectedPortfolio] = useState(null)  

    const portfolioUserList = useSelector(state => state.portfolioUserList)
    const { loading, portfolios,error } = portfolioUserList


    
    useEffect(()=>{
        if(selectedPortfolio){
            console.log(selectedPortfolio)
            dispatch(getPortfolioTickersData(selectedPortfolio._id))
        }
    },[selectedPortfolio])

    useEffect(()=>{
        if(portfolios){
            if(portfolios.length!==0){
                setSelectedPortfolio(portfolios[0])
            }
        }
    },[portfolios])

    return(
        <div className='card mainGraphs'>
            {portfolios && 
                <div>{portfolios.map(portfolio => 
                    <button 
                        key={portfolio._id}
                        style={{backgroundColor:selectedPortfolio?portfolio._id===selectedPortfolio._id?'lightgreen':'':''}} className='button' 
                        onClick={e => {setSelectedPortfolio(portfolio)}}
                        >{portfolio.name}</button>
                )}</div>                
            }
            <Tickers selectedPortfolio={selectedPortfolio}/>
            <Dividends selectedPortfolio={selectedPortfolio}/>                        
        </div>
    )

}

function MainSide({userInfo}){

    const dispatch = useDispatch()
    const portfolioUserList = useSelector(state => state.portfolioUserList)
    const { loading, portfolios,error } = portfolioUserList
    const tickerPortfolioData = useSelector(state => state.tickerPortfolioData)
    const {loading:portfolioDataLoading, tickers:tickerData, error:portfolioDataError} = tickerPortfolioData

    return(
        <div className='card sidePortfolios'>
            <h1>Hello {userInfo.name}</h1>
            {portfolios&& portfolios.map(portfolio =>
                <div key={portfolio._id} className='portfolioMain'>
                    <div className='portfolioMainHead'>
                        <h3>{portfolio.name}</h3>
                        <p>Type: Investing</p>  
                        <h3><b>{calculatePortfolioTotal(portfolio)} $</b></h3>  
                    </div>
                    <div className='portfolioMainBody'>
                        {portfolio.tickers.map(ticker => 
                            <div key={ticker._id} className='portfolioMainTicker'>
                                <Link to={'/ticker/'+ticker.ticker}>{ticker.ticker}</Link>    
                                <p>{ticker.name}</p>
                                {/* <p className='textRight'>{calculateTickerShareCount(ticker)} pcs</p>
                                <p className='textRight'><b>{calculateTickerTotal(ticker)}$</b></p> */}
                                {tickerData &&
                                    <>
                                    <p>
                                        {(calculateTickerCurrentValue(ticker,tickerData)-calculateTickerTotal(ticker)).toFixed(2)+'$'}
                                    </p>   
                                    <p className='textRight'>
                                        {
                                            Number(((calculateTickerCurrentValue(ticker,tickerData)-calculateTickerTotal(ticker))/calculateTickerTotal(ticker))*100).toFixed(2)+'%'
                                        }
                                    </p>                                    
                                    <p className='textRight'><b>{calculateTickerCurrentValue(ticker,tickerData)}$</b></p>  
                                    </>       
                                }
                            </div>
                        )}
                    </div>
                    <div className='portfolioMainFooter'>

                    </div>
                </div>
                
            )}
        </div> 
    ) 
}