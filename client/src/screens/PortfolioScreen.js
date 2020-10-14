import React,{ useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getTickerRatiosData } from '../actions/tickerActions';
import Portfolio from '../utils/portfolio';
import { datasetKeyProvider } from '../utils/utils';
import PortfolioList from '../components/portfolio/PortfolioList'
import PortfolioChart from '../components/portfolio/PortfolioChart'
import { Line,Doughnut, Pie } from 'react-chartjs-2'
import { calculateDividendChart, calculateStatCharts, calculateStatTreeMap } from '../utils/chart';
import SectionNav from '../components/SectionNav'
import Options from '../components/Options'
import { portfolioDivChartOptions, portfolioStatChartOptions } from '../utils/chartOptions';
import Chart from "react-google-charts";
import PortfolioData from '../utils/portfolioData';
import OptionsBar from '../components/OptionsBar'
import Table from '../components/Table'

export default function PortfolioScreen(props) {

    const dispatch = useDispatch()    

    const [navigation,setNavigation] = useState({
        selected:{name:'statistics',index:2},
        options:['statistics','tickers','priceChart','dividends']
    })
    
    const [portfolioData, setPortfolioData] = useState({...new PortfolioData()})
    const portfolioSelected = useSelector(state => state.portfolioSelected)
    const { selectedPortfolio } = portfolioSelected
    const tickerRatios = useSelector(state => state.tickerRatios)
    const { tickerRatiosData } = tickerRatios

    useEffect(()=>{
        if(selectedPortfolio){
            let tickers = selectedPortfolio.tickers.map(item => item.ticker)
            dispatch(getTickerRatiosData(tickers))    
        }    
    },[selectedPortfolio])

    useEffect(()=>{
        if(selectedPortfolio&&tickerRatiosData){
            let newPortfolioData = new PortfolioData(selectedPortfolio,tickerRatiosData)
            newPortfolioData.init()
            setPortfolioData({...newPortfolioData})
        }
    },[selectedPortfolio,tickerRatiosData])
    return (
        <section className='portfolioScreen container'>
            <PortfolioHeader portfolioData={portfolioData}/>
            <SectionNav navigation={navigation} setNavigation={setNavigation}/>
                <div className='sectionContainer'>
                    <div 
                        style={{right:navigation.selected.index*100+'%'}}
                        className='sections'
                    >
                        <div></div>
                        <TickerList portfolioData={portfolioData} setPortfolioData={setPortfolioData}/>
                        <PriceChart portfolioData={portfolioData} setPortfolioData={setPortfolioData}/>
                    </div>
                </div>
        </section>
    )
}

function PriceChart({portfolioData,setPortfolioData}){

    const selectPriceChart=(value)=>{   
        portfolioData.priceChart.selected = value
        let updated = portfolioData.updatePriceChart()
        setPortfolioData({...updated})
    }

    const { priceChart } = portfolioData
    const { charts, selected } = priceChart

    return(
        <div className='portfolioPriceChart'>
            <OptionsBar
                options={charts} 
                selected={selected} 
                selectOption={selectPriceChart}
            />
            <div className='chartContainer'>
                <Line
                    id='canvas'
                    data={portfolioData.priceChartData}
                    options={portfolioData.priceChartOptions}
                />
            </div>
        </div>
    )
}

function TickerList({portfolioData,setPortfolioData}){

    const { headers, tbody } = portfolioData.tickerList

    return(
        <div className='portfolioTickerList'>
            <Table
                headers={headers}
                tbody={tbody}
            />
        </div>
    )
}

function PortfolioHeader({portfolioData}){

    const { name, tickers } = portfolioData.portfolio

    return(
        <ul className='portfolioHeader'>
            <li>
                <p>Portfolio</p>
                <h2>{name}</h2>
            </li>
            <li>
                <p>Number of Stocks</p>
                <h2>{tickers.length}</h2>      
            </li>
            <li>
                <p>Purchase price</p>
                {/* <h2>{portfolioData.portfolio.getPurchasePrice()}</h2> */}
            </li>
            {/* <li>
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
            </li> */}
        </ul>
    )
}