import React,{ useEffect,useState, useRef } from 'react'
import { useDispatch,useSelector } from 'react-redux'
import { getTickerData } from '../actions/tickerActions';
import { camelCaseToString, datasetKeyProvider } from '../utils/utils';
import { Line, Bar } from 'react-chartjs-2';
import { Ticker } from '../utils/ticker';
import { 
    ratioChartOptions, 
    barChartOptions 
} from '../utils/chartOptions'
import SectionNav from '../components/SectionNav';
import Options from '../components/Options'

export default function TickerScreen(props) {

    const dispatch = useDispatch()
    const [navigation,setNavigation] = useState({
        selected:{name:'price',index:0},
        options:['price','events','ratios','financials']
    })
    
    const [ticker, setTicker] = useState(new Ticker(null))
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
        if(tickerFullData){
            let ticker=tickerFullData.profile.ticker
            let portfolioTicker = selectedPortfolio?
                selectedPortfolio.getTicker(ticker):
                null
            let newTicker = new Ticker(tickerFullData,portfolioTicker)
            newTicker.init()
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
                        <PriceChart ticker={ticker} setTicker={setTicker} navigation={navigation}/>    
                        <EventChart ticker={ticker} setTicker={setTicker} navigation={navigation}/>
                        <TickerRatios ticker={ticker} setTicker={setTicker} navigation={navigation}/>
                        <Financials ticker={ticker} setTicker={setTicker} navigation={navigation}/>   
                    </div>
                </div>
            }
        </div>
    )
}

function Financials({ticker,setTicker,navigation}){

    const [options,setOptions]=useState({
        selected:'incomeStatement',
        options:['incomeStatement','balanceSheet','cashFlow','dividends'],
        time:{
            timeValue:'15.years-years',
            timeStart:new Date(),
            timeEnd:new Date(),            
        },
    })

    useEffect(()=>{
        if(ticker){            
            const updated = ticker.updateFinancialChart(options)
            setTicker({...updated})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[options])  
    console.log(ticker)
    return(
        <div className='tickerFinancials'>
            <Options options={options} setOptions={setOptions}/>        
            <div className='financialChartContainer'>
                {navigation.selected.name==='financials'&&
                    <Bar
                        datasetKeyProvider={datasetKeyProvider}
                        data={ticker.financialChart.data}
                        options={ticker.financialChart.options}
                    />          
                }
            </div>
            <div className='financialStatement'>
                {ticker.financialChart.fullFinancialData&&
                    <table>
                        <thead>
                            <tr>
                            <th>Year</th>
                            {ticker.financialChart.fullFinancialData.map(item =>
                                <th key={item._id}>{item.date.substring(0, 7)}</th>
                            )}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(ticker.financialChart.fullFinancialData[0]).map((item,index) =>{
                                return  index>1&&
                                    <tr key={index}>
                                        <td>{camelCaseToString(item)}</td>
                                        {ticker.financialChart.fullFinancialData.map((elem,index) =>
                                            <td key={index}>{ticker.financialChart.fullFinancialData[index][item]}</td>
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

function TickerRatios({ticker,setTicker,navigation}){

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

    useEffect(()=>{
        if(ticker){            
            let updated = ticker.updateRatiosChart(options)
            setTicker({...updated})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[options])   

    return(
        <div className='section'>
            <Options options={options} setOptions={setOptions}/>
            <div className='ratioCharts'>
                <div className='ratioChartContainer'>                                 
                    {navigation.selected.name==='ratios'&&
                        <Line
                            id={'ratioChart'}
                            ref={ratioChartRef}
                            datasetKeyProvider={datasetKeyProvider}
                            data={ticker.ratiosChart.ratioChartData}
                            options={ratioChartOptions(ratioChartRef,ratioPriceChartRef,options,ticker.ratiosChart.ratioChartData)}
                        />
                    }  
                </div>
                <div className='ratioChartContainer'>
                    <Line
                        id={'ratioPriceChart'}
                        ref={ratioPriceChartRef}
                        datasetKeyProvider={datasetKeyProvider}
                        data={ticker.ratiosChart.priceChartData}
                        options={ratioChartOptions(ratioChartRef,ratioPriceChartRef,options)}
                    />                 
                </div>
                <div className='ratioChartContainer'>
                    {navigation.selected.name==='ratios'&&
                        <Bar
                            datasetKeyProvider={datasetKeyProvider}
                            data={ticker.ratiosChart.financialChartData}
                            options={barChartOptions()}
                        />                 
                    }
                </div>
            </div>

        </div>
    )
}

function EventChart({ticker,setTicker,navigation}){

    const [options,setOptions]=useState({
        selected:'',
        options:[],
        time:{
            timeValue:'15.years-years',
            timeStart:new Date(),
            timeEnd:new Date(),            
        },
    })

    useEffect(()=>{
        if(ticker){
            let updated = ticker.updateEventChart(options)
            setTicker({...updated})   
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[options])

    return(
        <section className='section'>
            <Options options={options} setOptions={setOptions}/>   
            <div className='tickerScreenChart'>
                <div className='chartContainer eventChart'>
                    {navigation.selected.name==='events'&&
                        <Line
                            id={'canvas'}
                            data={ticker.eventChart.data}
                            options={ticker.eventChart.options}
                        />  
                    }
                </div>
            </div>            
        </section>
    )
}

function PriceChart({ ticker, setTicker ,navigation }){

    const priceChart=useRef()
    const stochasticChart = useRef()
    const [options,setOptions]=useState({
        selected:'priceChart',
        options:['priceChart','movingAverages','MACD','stochasticOscillator'],
        time:{
            timeValue:'15.years-years',
            timeStart:new Date(),
            timeEnd:new Date(),            
        },
    })

    useEffect(()=>{
        ticker.priceChart.chart = priceChart
        ticker.stochasticChart = stochasticChart
        const updated = ticker.updatePriceChart(options)
        setTicker({...updated})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[options])

    return(
        <section className='section'>
            <Options options={options} setOptions={setOptions}/>
            <div className='tickerScreenChart'>
                <div className='chartContainer'>
                    {navigation.selected.name==='price'&&
                        <Line
                            ref={priceChart}
                            data={ticker.priceChart.data}
                            options={ticker.priceChart.options}
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
                <div className='chartContainerSmall'>
                    {options.selected==='MACD' &&
                        <Bar
                            data={ticker.priceChart.MACDData}
                            options={ticker.priceChart.MACDDataOptions}
                        />                  
                    }
                    {options.selected==='stochasticOscillator' &&
                        <Line
                            id='stochasticChart'
                            data={ticker.priceChart.oscillatorData}
                            options={ticker.priceChart.oscillatorDataOptions}
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
