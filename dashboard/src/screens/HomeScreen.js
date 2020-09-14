import React,{useEffect } from 'react'
import { useSelector,useDispatch } from 'react-redux'
import { listTickers } from '../actions/tickerActions';
import { listUserPortfolios } from '../actions/portfolioActions';
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
            </>
            }
        </div>
    )
}


function MainSide({userInfo}){

    const portfolioUserList = useSelector(state => state.portfolioUserList)
    const { loading, portfolios,error } = portfolioUserList
    const tickerPortfolioData = useSelector(state => state.tickerPortfolioData)
    const {loading:portfolioDataLoading, tickers:tickerData, error:portfolioDataError} = tickerPortfolioData

    const loadings = [loading,portfolioDataLoading]
    const errors = [error,portfolioDataError]

    return(
        <div className='card sidePortfolios'>
            {loading&&<div>{loading}</div>}
            {errors&&errors.map((item,index) =><div key={index}>{error}</div>)}
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