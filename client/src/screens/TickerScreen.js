import React,{ useEffect,useState, useRef } from 'react'
import { useDispatch,useSelector } from 'react-redux'
import { getTickerData } from '../actions/tickerActions';
import { camelCaseToString, datasetKeyProvider } from '../utils/utils';
import { Line, Bar } from 'react-chartjs-2';
import { Ticker } from '../utils/ticker';
import {  
    calculatePriceChart, 
    calculateEventChart, 
    calculateRatioPriceChart, 
    calculateRatioChart, 
    calculateRatioFinacialChart, 
    calculateFinancialChart 
} from '../utils/chart';
import { 
    priceChartOptions,
    financialChartOptions, 
    eventChartOptions, 
    ratioChartOptions, 
    barChartOptions 
} from '../utils/chartOptions'
import SectionNav from '../components/SectionNav';
import Options from '../components/Options'
import {UserTicker} from '../utils/userTicker'

export default function TickerScreen(props) {

    const dispatch = useDispatch()
    const [navigation,setNavigation] = useState({
        selected:{name:'price',index:0},
        options:['price','events','ratios','financials']
    })

    const [userTicker,setUserTicker] = useState(new UserTicker({}))
    
    const [ticker, setTicker] = useState(null)
    const tickerData = useSelector(state => state.tickerData)
    const { loading, tickerFullData, error } = tickerData

    const portfolioSelected = useSelector(state => state.portfolioSelected)
    const { selectedPortfolio } = portfolioSelected

    useEffect(()=>{
        let tickerId = props.match.params.id
        dispatch(getTickerData(tickerId))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props])

    useEffect(()=>{
        if(tickerFullData&&selectedPortfolio){
            let ticker=tickerFullData.profile.ticker
            let portfolioTicker = selectedPortfolio.getTicker(ticker)
            let newTicker = new Ticker(tickerFullData,portfolioTicker)
            setTicker(newTicker)
        }
        
    },[tickerFullData,selectedPortfolio])

    return (
        <div className='tickerScreen container'>
            <TickerHeader ticker={ticker} loading={loading}/>
            <SectionNav navigation={navigation} setNavigation={setNavigation}/>
            {loading?<div>Loading...</div>:error?<div>{error}</div>:
                <div className='sectionContainer'>
                    <div 
                        style={{right:navigation.selected.index*100+'%'}}
                        className='sections'
                    >    
                        <PriceChart ticker={ticker} navigation={navigation}/>    
                        <EventChart ticker={ticker} navigation={navigation}/>
                        <TickerRatios ticker={ticker} navigation={navigation}/>
                        <Financials ticker={ticker} navigation={navigation}/>   
                    </div>
                </div>
            }
        </div>
    )
}

function Financials({ticker,navigation}){

    const [options,setOptions]=useState({
        selected:'incomeStatement',
        options:['incomeStatement','balanceSheet','cashFlow'],
        time:{
            timeValue:'15.years-years',
            timeStart:new Date(),
            timeEnd:new Date(),            
        },
    })
    const [financialData, setFinancialData] = useState(null)
    const [financialChart, setFinancialChart] = useState({})
    const [chartOptions, setChartOptions] = useState({      
        responsive:true,
        maintainAspectRatio: false
    })

    useEffect(()=>{
        if(ticker){            
            let financialChartCoponents = ticker.financialChart(options)    
            let financialChartData = calculateFinancialChart(financialChartCoponents,options)
            setFinancialChart(financialChartData)
            setChartOptions(financialChartOptions(options))
            setFinancialData(financialChartCoponents.fullFinancialData)
        }
    },[ticker,options])  
    

    return(
        <div className='tickerFinancials'>
            <Options options={options} setOptions={setOptions}/>        
            <div className='financialChartContainer'>
                {navigation.selected.name==='financials'&&
                    <Bar
                        datasetKeyProvider={datasetKeyProvider}
                        data={financialChart}
                        options={chartOptions}
                    />          
                }
            </div>
            <div className='financialStatement'>
                
                {financialData&&
                    <table>
                        <thead>
                            <tr>
                            <th>Year</th>
                            {financialData.map(item =>
                                <th key={item._id}>{item.date.substring(0, 7)}</th>
                            )}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(financialData[0]).map((item,index) =>{
                                return  index>1&&
                                    <tr key={index}>
                                        <td>{camelCaseToString(item)}</td>
                                        {financialData.map((elem,index) =>
                                            <td key={index}>{financialData[index][item]}</td>
                                        )}
                                    </tr>   
                            })}
                        </tbody> 
                    </table>                   
                }
                
            </div>
        </div>
    )
}

function TickerRatios({ticker,navigation}){

    const ratioChartRef = useRef()
    const ratioPriceChartRef = useRef()

    const [options,setOptions]=useState({
        selected:'pe',
        options:['pe','pb','dividendYield'],
        time:{
            timeValue:'15.years-years',
            timeStart:new Date(),
            timeEnd:new Date(),            
        },
    })

    const [ratioChart, setRatioChart] = useState({})
    const [priceChart, setPriceChart] = useState({})
    const [ratioFinancialChart, setRatioFinancialChart] = useState({})

    useEffect(()=>{
        if(ticker){            
            
            let ratioChartComponents = ticker.ratioChart(options)
            let ratioChartData = calculateRatioChart(ratioChartComponents,options)
            setRatioChart(ratioChartData)

            let ratioFinancialChartData = calculateRatioFinacialChart(ratioChartComponents,options)
            setRatioFinancialChart(ratioFinancialChartData)
    
            let priceChartData = calculateRatioPriceChart(ratioChartComponents,ratioChartComponents,options)
            setPriceChart(priceChartData)

        }
    },[ticker,options])   

    return(
        <div className='section'>
            <Options options={options} setOptions={setOptions}/>
            <div className='ratioCharts'>
                <div className='ratioChartContainer'>                                 {navigation.selected.name==='ratios'&&
                        <Line
                            id={'ratioChart'}
                            ref={ratioChartRef}
                            datasetKeyProvider={datasetKeyProvider}
                            data={ratioChart}
                            options={ratioChartOptions(ratioChartRef,ratioPriceChartRef)}
                        />
                    }  
                </div>
                <div className='ratioChartContainer'>
                    <Line
                        id={'ratioPriceChart'}
                        ref={ratioPriceChartRef}
                        datasetKeyProvider={datasetKeyProvider}
                        data={priceChart}
                        options={ratioChartOptions(ratioChartRef,ratioPriceChartRef)}
                    />                 
                </div>
                <div className='ratioChartContainer'>
                    {navigation.selected.name==='ratios'&&
                        <Bar
                            datasetKeyProvider={datasetKeyProvider}
                            data={ratioFinancialChart}
                            options={barChartOptions()}
                        />                 
                    }
                </div>
            </div>

        </div>
    )
}

function EventChart({ticker,navigation}){

    const [options,setOptions]=useState({
        selected:'',
        options:[],
        time:{
            timeValue:'15.years-years',
            timeStart:new Date(),
            timeEnd:new Date(),            
        },
    })
    const [chart, setChart] = useState({})

    useEffect(()=>{
        if(ticker){
            let chartComponents = ticker.eventChart(options)
            let chartData = calculateEventChart(chartComponents,options)
            setChart(chartData)     
        }
    },[ticker, options])

    return(
        <section className='section'>
            <Options options={options} setOptions={setOptions}/>        
            <div className='tickerScreenChart'>
                <div className='chartContainer eventChart'>
                    {navigation.selected.name==='events'&&
                        <Line
                            id={'canvas'}
                            datasetKeyProvider={datasetKeyProvider}
                            data={chart}
                            options={eventChartOptions()}
                        />  
                    }
                </div>
            </div>            
        </section>
    )
}

function PriceChart({ticker,navigation}){

    const chartRef = useRef()
    const [options,setOptions]=useState({
        selected:'',
        options:[],
        time:{
            timeValue:'15.years-years',
            timeStart:new Date(),
            timeEnd:new Date(),            
        },
    })
    const [chartOptions, setChartOptions] = useState({    
        responsive:true,
        maintainAspectRatio: false,
    })

    const [chart, setChart] = useState({})

    useEffect(()=>{
        if(ticker){
            let chartComponents = ticker.priceChart(options)
            let chartData = calculatePriceChart(chartComponents,options)
            setChart(chartData)
            setChartOptions(priceChartOptions(chartComponents.data,options))    
        }
    },[ticker, options])

    return(
        <section className='section'
            onClick={e => setChartOptions(priceChartOptions(chart.datasets[0].data,options,chartRef)) }
        >
            <Options options={options} setOptions={setOptions}/>
            <div className='tickerScreenChart'>

                <div className='chartContainer'>
                    {navigation.selected.name==='price'&&
                        <Line            
                            ref = {chartRef}
                            id={'canvas'}
                            datasetKeyProvider={datasetKeyProvider}
                            data={chart}
                            options={chartOptions}
                            plugins={[{
                                beforeInit: (chart, options) => {
                                    
                                chart.legend.afterFit = () => {
                                    if (chart.legend.margins) {
                                    chart.legend.options.labels.boxWidth = 100;
                                    chart.legend.height= 70;
                                    chart.legend.paddingLeft= 170;
                                    chart.legend.options.labels.generateLabels(chart)
                                    }
                                };
                                }
                            }]  
                            }
                        />
                    }
                </div>                  
            </div>

        </section>
    )
}

function TickerHeader({ticker,loading}){
    return(
        <header className='tickerScreenHeader'>
            {!loading&&ticker&&
                <ul>
                    <li>
                    <h1>{ticker.profile.ticker}</h1></li>
                    <li><h2>{ticker.profile.name}</h2></li>
                    <li><h2>{ticker.latestPrice('currency')}</h2></li>
                    <li><h2>{ticker.profile.sector}</h2></li>
                    <li><h2>{ticker.profile.industry}</h2></li>
                </ul>
            }
        </header>
    )
}
