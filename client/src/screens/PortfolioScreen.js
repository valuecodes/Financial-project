import React,{ useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getPortfolioTickersData } from '../actions/tickerActions';
import { Portfolio } from '../utils/portfolio';
import { datasetKeyProvider } from '../utils/utils';
import PortfolioList from '../components/portfolio/PortfolioList'
import PortfolioChart from '../components/portfolio/PortfolioChart'
import { Line,Doughnut, Pie } from 'react-chartjs-2'
import { calculateDividendChart, calculateStatCharts, calculateStatTreeMap } from '../utils/chart';
import SectionNav from '../components/SectionNav'
import Options from '../components/Options'
import { portfolioDivChartOptions, portfolioStatChartOptions } from '../utils/chartOptions';
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[selectedPortfolio])

    const [navigation,setNavigation] = useState({
        selected:{name:'statistics',index:0},
        options:['statistics','tickers','priceChart','dividends']
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
                        <PortfolioStats portfolio={portfolio} navigation={navigation} />
                        <PortfolioList portfolio={portfolio} navigation={navigation}/>
                        <PortfolioChart portfolio={portfolio} navigation={navigation}/>
                        <DividendChart portfolio={portfolio} navigation={navigation}/>
                    </div>
                </div>
            }
        </section>
    )
}

function PortfolioStats({portfolio,navigation}){

    const [treeMapData,setTreeMapData] = useState([])
    const [chartData,setChartData]=useState({
        sector:{},
        industry:{},
        subIndustry:{}
    })

    useEffect(()=>{
        if(portfolio){
            const portfolioStatComponents = portfolio.statComponents()
            const chartData = calculateStatCharts(portfolioStatComponents)

            setTreeMapData(calculateStatTreeMap(portfolioStatComponents))
            setChartData({
                sector:chartData.sectorData,
                industry:chartData.industryData,
                subIndustry:chartData.subIndustryData
            })
        }
    },[portfolio])
    
    return(
        <div>
            <div className='portfolioStats'>
                <Chart
                    height={600}
                    chartType="TreeMap"
                    maxDepth={1}
                    maxPostDepth={2}
                    loader={<div>Loading Chart</div>}
                    data={treeMapData}

                    options={{
                        maxDepth: 3,
                        maxPostDepth: 3,
                        title: 'Portfolio',
                        chartArea: { width: '30%' },
                        fontSize:14,
                        fontColor:'white',
                        headerColor:'rgb(white)',
                        textStyle:{
                            color:'black',
                            bold:true
                        },  
                        hAxis: {
                            title: 'Total Population',
                            minValue: 0,
                        },
                        vAxis: {
                            title: 'City',
                        },
                        useWeightedAverageForAggregation: true
                    }}
                    legendToggle
                />
                <div className='chartContainer'>
                    <Pie
                        data={chartData.sector}
                        options={portfolioStatChartOptions('Sectors')} 
                    />                
                </div>
                <div className='chartContainer'>
                    <Doughnut
                        data={chartData.industry}
                        options={portfolioStatChartOptions('Industries')} 
                    />                 
                </div>
                <div className='chartContainer'>
                    <Doughnut
                        data={chartData.subIndustry}
                        options={portfolioStatChartOptions('SubIndustries')} 
                    />                   
                </div>
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