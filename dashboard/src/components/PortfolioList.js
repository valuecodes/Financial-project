import React,{useEffect,useState} from 'react'
import { Ticker } from '../utils/tickerUtils';

export default function PortfolioList({portfolio}) {
    return (
        <div className='section'>
            <div className='portfolioList'>
            <header>
                <h3>Tickers</h3>
            </header>
            <div className='portfolioTickers'>
                <table className='portfolioListTable'>
                    <thead className='portfolioListHeader'>
                        <th>Ticker</th>
                        <th>Count</th>
                        <th>Average Cost</th>
                        <th>Purchase Price</th>
                        <th>Current Price</th>
                        <th>Win/Loss</th>
                        <th>%</th>
                    </thead>
                    <tbody className='portfolioListBody'>
                        {portfolio&&
                            portfolio.userTickers.map(ticker => 
                                <UserTicker userTicker={ticker} tickerData={portfolio.tickerData}/>
                            )                       
                        }
                    </tbody>
                </table>
            </div>
            </div>
        </div>
    )
}

function UserTicker({ userTicker, tickerData}){
    
    let ticker = new Ticker(userTicker,tickerData.find(item => item.profile.ticker===userTicker.ticker))

    return(
        <tr className='userTicker'
        style={{backgroundColor:ticker.priceChange()>0?'lightgreen':'lightsalmon'}}
        >
            {ticker&&
                <>
                <th className='tableName'><p>{ticker.ticker}</p><p>{ticker.name}</p></th>       
                <th>{ticker.totalCount()}pcs</th>
                <th>{ticker.averageCost('currency')}</th>           
                <th>{ticker.purchasePrice('currency')}</th>                
                <th>{ticker.currentPrice('currency')}</th>                
                <th>{ticker.priceChange('currency')}</th>  
                <th>{ticker.priceChangePercentage('percentage')}</th>              
                </>
            }
        </tr>
    )
}