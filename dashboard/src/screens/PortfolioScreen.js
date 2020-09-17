import React,{ useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getPortfolioTickersData } from '../actions/tickerActions';
import { Portfolio } from '../utils/portfolio';
import { datasetKeyProvider } from '../utils/utils';
import PortfolioList from '../components/portfolio/PortfolioList'
import PortfolioChart from '../components/portfolio/PortfolioChart'
import { Line } from 'react-chartjs-2'
import { calculateDividendChart } from '../utils/chart';
import SectionNav from '../components/SectionNav'
import Options from '../components/Options'
import { portfolioDivChartOptions } from '../utils/chartOptions';
import { useHistory } from 'react-router';
import Chart from "react-google-charts";

export default function PortfolioScreen(props) {

    const history = useHistory();
    const dispatch = useDispatch()
    const [portfolio, setPortfolio] = useState(null)
    const portfolioSelected = useSelector(state => state.portfolioSelected)
    const { selectedPortfolio } = portfolioSelected
    const tickerPortfolioData = useSelector(state => state.tickerPortfolioData)
    const { loading, portfolioData, error } = tickerPortfolioData

    useEffect(()=>{
        if(!portfolioData){
            let portfolioId = props.match.params.id
            dispatch(getPortfolioTickersData(portfolioId))            
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps        
    },[])

    useEffect(()=>{
        if(portfolioData){
            setPortfolio(new Portfolio(portfolioData))
        }
    },[portfolioData])

    useEffect(()=>{
        if(selectedPortfolio){
            let portfolioId = props.match.params.id
            if(portfolioId!==selectedPortfolio._id){
                history.push("/portfolio/"+selectedPortfolio._id);
                dispatch(getPortfolioTickersData(selectedPortfolio._id)) 
            }
        }
    },[selectedPortfolio])

    const [navigation,setNavigation] = useState({
        selected:{name:'tickers',index:0},
        options:['tickers','priceChart','dividends']
    })

    return (
        <section className='portfolioScreen container'>
            <PortfolioHeader portfolio={portfolio}/>
            <SectionNav navigation={navigation} setNavigation={setNavigation}/>
            {loading?<div>Loading...</div>:error?<div>{error}</div>:
                <div className='sectionContainer'>
                    <div 
                        style={{right:navigation.selected.index*100+'%'}}
                        className='sections'
                    >
                        {/* <PortfolioOverview portfolio={portfolio} navigation={navigation} /> */}
                        <PortfolioList portfolio={portfolio} navigation={navigation}/>
                        <PortfolioChart portfolio={portfolio} navigation={navigation}/>
                        <DividendChart portfolio={portfolio} navigation={navigation}/>
                    </div>
                </div>
            }
        </section>
    )
}

function PortfolioOverview({portfolio,navigation}){

    return(
        <div>
            <div className='chartContainer'>
                {/* <Chart
                    chartType="GeoChart"
                    loader={<div>Loading Chart</div>}
                    data={[
                    ['City', '2010 Population', '2000 Population'],
                    ['New York City, NY', 8175000, 8008000],
                    ['Los Angeles, CA', 3792000, 3694000],
                    ['Chicago, IL', 2695000, 2896000],
                    ['Houston, TX', 2099000, 1953000],
                    ['Philadelphia, PA', 1526000, 1517000],
                    ]}
                    options={{
                    title: 'Population of Largest U.S. Cities',
                    chartArea: { width: '30%' },
                    }}
                    legendToggle
                /> */}
            </div>
        </div>
    )
}

function DividendChart({portfolio,navigation}){

    const [dividendComponents, setDividendComponents] = useState(null)
    const [options,setOptions]=useState({
        selected:'dividends',
        options:['dividends','yearlyDividends','cumulativeDividends'],
        time:{
            timeValue:'20.years-years',
            timeStart:new Date().getFullYear(),
            timeEnd:new Date().getFullYear(),            
        },
    })
    const [chart, setChart] = useState({})

    useEffect(()=>{
        if(portfolio){
            setDividendComponents(portfolio.dividendComponents())
        }
    },[portfolio])

    useEffect(()=>{
        if(dividendComponents){
            let chartData = calculateDividendChart(dividendComponents,options)
            setChart(chartData)   
        }
    },[dividendComponents,options])

    return(
        <section className='section'>
            <Options options={options} setOptions={setOptions}/>
            <div className='dividendChart'>
                <div className='chartContainer'>
                {navigation.selected.name==='dividends'&&
                    <Line
                        id={'canvas'}
                        datasetKeyProvider={datasetKeyProvider}
                        data={chart}
                        options={portfolioDivChartOptions()}
                    /> 
                }
                </div>
                <ChartOptions/>     
            </div>
        </section>

    )
}

function ChartOptions(){
    return(
        <div className='chartOptions'>

        </div>
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