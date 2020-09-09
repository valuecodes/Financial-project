import React,{ useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { listTickers, getPortfolioTickersData } from '../actions/tickerActions';
import { listUserPortfolios } from '../actions/portfolioActions';
import { portfolioPurchasePrice, portfolioCurrentValue, portfolioTest, Portfolio } from '../utils/portfolioUtils';
import { formatCurrency } from '../utils/utils';
import PortfolioList from '../components/PortfolioList'
import PortfolioChart from '../components/PortfolioChart'

export default function PortfolioScreen(props) {

    const [portfolio, setPortfolio] = useState(null)
    const dispatch = useDispatch()
    const tickerPortfolioData = useSelector(state => state.tickerPortfolioData)
    const { loading, tickers:tickerData, portfolio:selectedPortfolio, error } = tickerPortfolioData

    useEffect(()=>{
        let portfolioId = props.match.params.id
        dispatch(getPortfolioTickersData(portfolioId))
    },[])

    useEffect(()=>{
        if(tickerData&&selectedPortfolio){
            setPortfolio(new Portfolio(tickerData,selectedPortfolio))
        }
    },[tickerData,selectedPortfolio])

    return (
        <section className='portfolioScreen container'>
            <PortfolioHeader portfolio={portfolio}/>
            <div className='portfolioSection'>
                {loading?<div>Loading...</div>:error?<div>{error}</div>:
                    <div className='portfolioSection'>
                        <PortfolioList portfolio={portfolio}/>
                        <PortfolioChart portfolio={portfolio}/>
                    </div>
                }
            </div>
        </section>
    )
}

function PortfolioHeader({portfolio}){
    return(
        <ul className='portfolioHeader'>
            {portfolio&&
                <>
                    <li>
                        <p>Portfolio</p>
                        <h2>{portfolio.name}</h2>
                    </li>
                    <li>
                        <p>Number of Stocks</p>
                        <h2>{portfolio.userTickers.length}</h2>                        
                    </li>
                    <li>
                        <p>Purchase price</p>
                        <h2>{portfolio.purchasePrice('currency')}</h2>
                    </li>
                    <li>
                        <p>Current value</p>
                        <h2>{portfolio.currentValue('currency')}</h2>
                    </li>
                    <li>
                        <p>Price change</p>
                        <h2>
                            {portfolio.priceChange('currency')}{' '}(
                            <span style={{color:portfolio.priceChange()>0?'green':'red'}}>
                            {portfolio.priceChangePercentage('percentage')}
                            </span>)
                        </h2>
                    </li>
                </>
            }
        </ul>
    )
}