import React,{ useEffect,useState, useRef } from 'react'
import { useDispatch,useSelector } from 'react-redux'
import { getTickerData } from '../actions/tickerActions';
import { camelCaseToString, datasetKeyProvider, roundToTwoDecimal } from '../utils/utils';
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
        options:['price','events','ratios','financials','forecast']
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
                        <Forecast ticker={ticker} setTicker={setTicker} navigation={navigation}/>
                    </div>
                </div>
            }
        </div>
    )
}

function Forecast({ticker,setTicker,navigation}){
    
    useEffect(()=>{
        let updated = ticker.updateForecastChart()
        setTicker({...updated})
    },[navigation])

    const modifyFutureGrowth = (e,type,name) => {
        let { value } = e.target
        ticker.analytics[type][name] = Number(value)
        let updated = ticker.updateForecastChart()
        setTicker({...updated})
    }

    const handleReset=()=>{
        ticker.init()
        const updated = ticker.updateForecastChart()
        setTicker({...updated})
    }

    const {  financialInputs, forecastInputs, forecastOutputs } = ticker.analytics

    const {
        freeCashFlow={latest:0,average:0},
        netProfitMargin={latest:0,average:0},
        revenue={averageGrowth:0},
        netIncome={averageGrowth:0},
        eps={averageGrowth:0},
        grossProfit={averageGrowth:0},
        price={latest:0},
        pe={latest:0,average:0},        
        firstFullFinancialYear, 
        lastFullFinancialYear, 
    } = financialInputs

    const {
        startingPrice=0,
        endingPE=0,
        futureGrowthRate=0,
        endingProfitability=0,
        dcfDiscountRate=0,
        perpetuityGrowth=0,
        startingFreeCashFlow=0,
    } = forecastInputs

    return(
        <div className='tickerForecast'>   
            <div className='forecastChartContainer'>                
                <ul className='forecastHeader'>
                    <li>
                        <h3>Annual return forecast {lastFullFinancialYear+1}-{lastFullFinancialYear+11}</h3>
                        <h2 className='bold'>{roundToTwoDecimal(forecastOutputs.totalReturn*100)}%</h2> 
                    </li>
                    <li>
                        <h3>Intrinsic value per share</h3>
                        <h2 className='bold'>{roundToTwoDecimal(ticker.forecastSection.dcfTable.intrinsicValue)}$</h2>
                    </li>
                </ul>
                <div className='chartContainer'>                                 
                    <Line
                        data={ticker.forecastSection.forecastChart}
                        options={ticker.forecastSection.forecastOptions}
                    />
                </div>                
                <ul className='forecastSideList mainForecast'>
                    <li className='annualReturns'>
                        <h2>Annual return </h2>
                        <h3>Forecast {lastFullFinancialYear+1}-{lastFullFinancialYear+11}</h3>
                        <p>Price</p>
                        <h4 className='bold'>{roundToTwoDecimal(forecastOutputs.priceReturn*100)}%</h4>
                        <p>Dividends</p>
                        <h4 className='bold'>{roundToTwoDecimal(forecastOutputs.divReturn*100)}%</h4>
                        <p>Total</p>
                        <h4 className='bold total'>{roundToTwoDecimal(forecastOutputs.totalReturn*100)}%</h4> 
                    </li>    
                    <li>
                        <button onClick={handleReset} className='forecastReset button'>Reset Forecast Settings</button>
                    </li>                
                    <li className='startingPrice'>
                        <h2>Ticker Price </h2>
                        <label>Current price</label>
                        <h4>{price.latest}$</h4>
                        <h3>Forecast starting Price </h3>
                        <input
                            onChange={(e)=>modifyFutureGrowth(e,'forecastInputs','startingPrice')} 
                            min={price.latest-(price.latest/2)}
                            max={price.latest+(price.latest/2)}
                            value={startingPrice}
                            step={price.latest<20?0.1:1}
                            type='range'
                        />
                        <h4 className='bold'>{roundToTwoDecimal(startingPrice)}$</h4>  
                    </li>
                    <li>
                        <h2>PE-Ratio</h2>
                        <label>{firstFullFinancialYear}-{lastFullFinancialYear} average</label>
                        <h4>{roundToTwoDecimal(pe.average)}</h4>
                        <label>Current PE</label>
                        <h4>{roundToTwoDecimal(pe.latest)}</h4>  
                        <h3>PE forecast in {lastFullFinancialYear+11} </h3>
                        <input
                            onChange={(e)=>modifyFutureGrowth(e,'forecastInputs','endingPE')} 
                            min={0}
                            max={60}
                            step={1}
                            value={endingPE}
                            type='range'
                        />
                        <h4 className='bold'>{roundToTwoDecimal(endingPE)}</h4> 
                    </li>
                </ul>
                <div className='chartContainerSmall'>
                    <Line
                        data={ticker.forecastSection.financialChart}
                        options={ticker.forecastSection.financialOptions}
                    />
                </div>
                <ul className='forecastSideList growthForecast'>
                    <li>
                        <h2>Growth </h2>
                        <label className='fullWidth'>Annual growth {firstFullFinancialYear}-{lastFullFinancialYear}</label>
                        <label>Revenue</label>
                        <h4>{roundToTwoDecimal(revenue.averageGrowth*100)}%</h4> 
                        <label>Net Income</label>
                        <h4>{roundToTwoDecimal(netIncome.averageGrowth*100)}%</h4> 
                        <label>EPS</label>
                        <h4>{roundToTwoDecimal(eps.averageGrowth*100)}%</h4> 
                        <label>Gross Profit</label>
                        <h4>{roundToTwoDecimal(grossProfit.averageGrowth*100)}%</h4> 
                        <label>Free Cash Flow</label>
                        <h4>{roundToTwoDecimal(freeCashFlow.averageGrowth*100)}%</h4> 
                        <h3>Annual Growth forecast </h3>
                        <h3>{lastFullFinancialYear+1}-{lastFullFinancialYear+11}</h3>
                        <input
                            onChange={(e)=>modifyFutureGrowth(e,'forecastInputs','futureGrowthRate')} 
                            min={-0.05}
                            max={0.3}
                            step={0.01}
                            value={futureGrowthRate}
                            type='range'
                        />
                        <h4 className='bold'>{roundToTwoDecimal(futureGrowthRate*100)}%</h4> 
                    </li>
                    <li>
                        <h2>Profibility </h2>
                        <label>Annual net profit margin {firstFullFinancialYear}-{lastFullFinancialYear}</label>
                        <h4>{roundToTwoDecimal(netProfitMargin.average*100)}%</h4> 
                        <h3>Profibility forecast 2030 </h3>
                        <h3>{lastFullFinancialYear+1}-{lastFullFinancialYear+11}</h3>
                        <input
                            onChange={(e)=>modifyFutureGrowth(e,'forecastInputs','endingProfitability')} 
                            min={-0.1}
                            max={0.6}
                            step={0.01}
                            value={endingProfitability}
                            type='range'
                        />
                        <h4 className='bold'>{roundToTwoDecimal(endingProfitability*100)}%</h4> 
                    </li>
                </ul>                
                <div className='chartContainerSmall'>
                    <Line
                        data={ticker.forecastSection.epsChart}
                        options={ticker.forecastSection.epsOptions}
                    />
                </div>
                <div className='chartContainerSmall'>
                    <Line
                        data={ticker.forecastSection.freeCashFlowChart}
                        options={ticker.forecastSection.freeCashFlowOptions}
                    />
                </div>
                <ul className='forecastSideList dcfCalculator'>
                    <li>
                        <h2>DCF </h2>
                        <label className='fullWidth'>Free Cash Flow average</label>
                        <label>{firstFullFinancialYear}-{lastFullFinancialYear}</label>
                        <h4>{roundToTwoDecimal(freeCashFlow.average)}M</h4> 
                        <h3>Starting Free Cash Flow </h3>                        
                        <input
                            className=''
                            onChange={(e)=>modifyFutureGrowth(e,'forecastInputs','startingFreeCashFlow')} 
                            min={0}
                            max={freeCashFlow.latest*2}
                            value={startingFreeCashFlow||0}
                            type='range'
                        />
                        <h4 className='bold'>{roundToTwoDecimal(startingFreeCashFlow).toFixed(0)}M</h4>
                        <h3>Annual Growth forecast </h3>                        
                        <input
                            onChange={(e)=>modifyFutureGrowth(e,'forecastInputs','futureGrowthRate')} 
                            min={-0.05}
                            max={0.3}
                            step={0.01}
                            value={futureGrowthRate}
                            type='range'
                        />
                        <h4 className='bold'>{roundToTwoDecimal(futureGrowthRate*100)}%</h4>
                        <h3>Discount Rate </h3>                        
                        <input
                            onChange={(e)=>modifyFutureGrowth(e,'forecastInputs','dcfDiscountRate')} 
                            min={0}
                            max={0.2}
                            step={0.01}
                            value={dcfDiscountRate}
                            type='range'
                        />
                        <h4 className='bold'>{roundToTwoDecimal(dcfDiscountRate*100)}%</h4>    
                        <h3>Perpetuity Growth </h3>                        
                        <input
                            onChange={(e)=>modifyFutureGrowth(e,'forecastInputs','perpetuityGrowth')} 
                            min={0}
                            max={0.1}
                            step={0.01}
                            value={perpetuityGrowth}
                            type='range'
                        />
                        <h4 className='bold'>{roundToTwoDecimal(perpetuityGrowth*100)}%</h4>    
                        <h3>Intrinsic value per share </h3>
                        <label>{roundToTwoDecimal(dcfDiscountRate*100)}% Discount Rate</label>
                        <h4 className='bold'>{roundToTwoDecimal(ticker.forecastSection.dcfTable.intrinsicValue)}</h4>
                        <h3>Current return</h3>
                        <label>Share price {price.starting}</label>
                        <h4 className='bold'>{roundToTwoDecimal(ticker.forecastSection.dcfTable.annualReturn)}%</h4>  
                    </li>
                </ul>
                <table className='table dcfTable'>
                    <thead>
                        <tr>
                            {ticker.forecastSection.dcfTable.years.map((item,index) =>
                                <th key={index}>{item||0}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {ticker.forecastSection.dcfTable.FCF.map((item,index) =>
                                <td key={index}>{item||0}</td>
                            )}                            
                        </tr>
                        <tr>
                            {ticker.forecastSection.dcfTable.DF.map((item,index) =>
                                <td key={index}>{item||0}</td>
                            )}                            
                        </tr>
                        <tr>
                            {ticker.forecastSection.dcfTable.DFCF.map((item,index) =>
                                <td key={index}>{item||0}</td>
                            )}                            
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>
                                <p>Sum of DFCF</p>
                                <h3>${ticker.forecastSection.dcfTable.totalDFCF}</h3>      
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p>Discontinued perpetuity cash flow (DPCF)</p>
                                <h3>${ticker.forecastSection.dcfTable.terminal}</h3>                
                            </td>
                        </tr>
                    </tfoot>
                </table>     
            </div>            
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
                            datasetKeyProvider={datasetKeyProvider}                            
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
                    <li>
                        <label>Sector</label>
                        <h3>{ticker.profile.sector}</h3>
                    </li>
                    <li>                        
                        <label>Industry</label>                        
                        <h3>{ticker.profile.industry}</h3>  
                    </li>
                </ul>
            }
        </header>
    )
}
