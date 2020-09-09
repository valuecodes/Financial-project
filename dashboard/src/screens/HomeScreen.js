import React,{useEffect, useState } from 'react'
import { useSelector,useDispatch } from 'react-redux'
import { listTickers, getPortfolioTickersData } from '../actions/tickerActions';
import { listUserPortfolios } from '../actions/portfolioActions';
import Tickers from '../components/Tickers'
import Dividends from '../components/Dividends'
// import { calculateTickerTotal, calculateTickerCurrentValue, calculatePortfolioPurchasePrice } from '../utils/portfolioUtils';
import PortfolioChart from '../components/PortfolioChart'
import { Link} from 'react-router-dom'
import { Portfolio } from '../utils/portfolioUtils';

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
    const [portfolio, setPortfolio] = useState(null)

    const portfolioUserList = useSelector(state => state.portfolioUserList)
    const { loading, portfolios,error } = portfolioUserList
    const tickerPortfolioData = useSelector(state => state.tickerPortfolioData)
    const { loading:tickerDataLoading, tickers:tickerData, portfolio:portfolioData, error:tickerDataError } = tickerPortfolioData
    
    // useEffect(()=>{
    //     if(selectedPortfolio){
    //         dispatch(getPortfolioTickersData(selectedPortfolio._id))
    //     }
    // },[selectedPortfolio])

    useEffect(()=>{
        if(portfolio===null&&portfolios){
            if(portfolios.length){
                let portfolioId = portfolios[0]._id
                dispatch(getPortfolioTickersData(portfolioId))                 
            }           
        }
    },[portfolios])

    useEffect(()=>{
        console.log(tickerData,portfolioData)
        if(tickerData&&portfolioData){
            console.log(tickerData,portfolioData)
            setPortfolio(new Portfolio(tickerData,portfolioData))
        }
    },[tickerData,portfolioData])

    // useEffect(()=>{
    //     if(portfolios){
    //         if(portfolios.length!==0){
    //             setSelectedPortfolio(portfolios[0])
    //         }
    //     }
    // },[portfolios])
    console.log(portfolio)

    return(
        <div 
            className='mainGraphs'
            >
            {/* {portfolios && 
                <div>{portfolios.map(portfolio => 
                    <button 
                        key={portfolio._id}
                        style={{backgroundColor:selectedPortfolio?portfolio._id===selectedPortfolio._id?'lightgreen':'':''}} className='button' 
                        onClick={e => {setSelectedPortfolio(portfolio)}}
                        >{portfolio.name}</button>
                )}</div>                
            } */}
            <PortfolioChart portfolio={portfolio}/>
            {/* <Tickers selectedPortfolio={selectedPortfolio}/> */}
            {/* <Dividends selectedPortfolio={selectedPortfolio}/>                         */}
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
                        <Link to={'/portfolio/'+portfolio._id}><h3>{portfolio.name}</h3></Link> 
                        <p>Type: Investing</p>  
                        {/* <h3><b>{calculatePortfolioPurchasePrice(portfolio)} $</b></h3>   */}
                    </div>
                    <div className='portfolioMainBody'>
                        {portfolio.tickers.map(ticker => 
                            <div key={ticker._id} className='portfolioMainTicker'>
                                <Link to={'/ticker/'+ticker.ticker}>{ticker.ticker}</Link>    
                                <p>{ticker.name}</p>
                                {/* <p className='textRight'>{calculateTickerShareCount(ticker)} pcs</p>
                                <p className='textRight'><b>{calculateTickerTotal(ticker)}$</b></p> */}
                                {/* {tickerData &&
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
                                } */}
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