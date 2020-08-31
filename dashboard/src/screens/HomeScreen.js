import React,{useEffect, useState, useRef} from 'react'
import { useSelector,useDispatch } from 'react-redux'
import { listTickers, getPortfolioTickersData } from '../actions/tickerActions';
import { listUserPortfolios } from '../actions/portfolioActions';
import Tickers from '../components/Tickers'
import Dividends from '../components/Dividends'
import { calculatePortfolioTotal, calculateTickerShareCount, calculateTickerTotal } from '../utils/portfolioUtils';
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
                                <Link to={''}>{ticker.ticker}</Link>    
                                <p>{ticker.name}</p>
                                <p className='textRight'>{calculateTickerShareCount(ticker)} pcs</p>
                                <p className='textRight'><b>{calculateTickerTotal(ticker)}$</b></p>
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