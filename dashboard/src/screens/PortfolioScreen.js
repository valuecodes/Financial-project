import React,{ useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { listTickers, getPortfolioTickersData } from '../actions/tickerActions';
import { listUserPortfolios } from '../actions/portfolioActions';
import { portfolioPurchasePrice, portfolioCurrentValue, portfolioTest, Portfolio } from '../utils/portfolioUtils';
import { formatCurrency, camelCaseToString } from '../utils/utils';
import PortfolioList from '../components/PortfolioList'
import PortfolioChart from '../components/PortfolioChart'
// import Options from '../components/Options'
import { Line } from 'react-chartjs-2'
import { calculateDividendChart } from '../utils/chartUtils';
import { SetTimePeriod } from '../components/graphComponents';
import SectionNav from '../components/SectionNav'

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

    const [navigation,setNavigation] = useState({
        selected:{name:'priceChart',index:1},
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
                        <PortfolioList portfolio={portfolio}/>
                        <PortfolioChart portfolio={portfolio}/>
                        <DividendChart portfolio={portfolio}/>
                    </div>
                </div>
            }
        </section>
    )
}

function DividendChart({portfolio}){

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
    
    const [chartOptions, setChartOptions] = useState({        
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: false,
            }
        },
        tooltips: {
            mode: 'index',
            intersect: false,
            titleFontColor:'rgba(0,0,0,0)',
        },         

        scales: {            
            xAxes: [{  
                ticks: {
                    maxTicksLimit: 8,
                    maxRotation: 0,
                    minRotation: 0,
                },
            }],
            yAxes: [{  
                ticks: {
                    maxTicksLimit: 8,
                    maxRotation: 0,
                    minRotation: 0,
                    maxTicksLimit: 20,
                },
            }],
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

    function datasetKeyProvider(){ return Math.random()}

    return(
        <section className='section'>
            <Options options={options} setOptions={setOptions}/>
            <div className='dividendChart'>
                <div className='chartContainer'>
                    <Line
                        id={'canvas'}
                        datasetKeyProvider={datasetKeyProvider}
                        data={chart}
                        options={chartOptions}
                    /> 
                </div>
                <ChartOptions/>     
            </div>
        </section>

    )
}

export function Options({options,setOptions}){
    return (
        <div className='options'>
            <ul>
                {options.options.map(item =>
                    <li
                    onClick={() => setOptions({...options,selected:item})}
                    style={{
                        backgroundColor:item===options.selected&&'rgba(0, 0, 0, 0.2)',
                        borderBottom:item===options.selected&&'0.2rem solid lightgreen'
                    }}
                    >{camelCaseToString(item)}</li>
                )}
            </ul>
            <ul className='timePeriods'>
                <SetTimePeriod options={options} setOptions={setOptions}/>
            </ul>
        </div>
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