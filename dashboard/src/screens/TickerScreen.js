import React,{ useEffect,useState, useRef } from 'react'
import { useDispatch,useSelector } from 'react-redux'
import { getTickerData } from '../actions/tickerActions';
import { camelCaseToString } from '../utils/utils';
import { Line, Bar, Chart } from 'react-chartjs-2';
import { listUserPortfolios } from '../actions/portfolioActions';
import { Ticker } from '../utils/tickerUtils';
// import Options from '../components/Options'
import { getChartOptions, priceChartOptions, calculatePriceChart, calculateEventChart, calculateRatioPriceChart, calculateRatioChart, calculateRatioFinacialChart, calculateFinancialChart, financialChartOptions, eventChartOptions } from '../utils/chartUtils';
import SectionNav from '../components/SectionNav';
import { Options } from '../screens/PortfolioScreen'

export default function TickerScreen(props) {

    const [ticker, setTicker] = useState(null)
    const [options,setOptions] = useState({
        time:{
            timeValue:'10.years-years',
            timeStart:new Date().getFullYear(),
            timeEnd:new Date().getFullYear(),            
        },
        selectedMode:'events',
        modes:['price','events','ratios','financials'],
        price:{
            // chartType:{
            //     selectedOption:'total',
            //     options:['totalReturn','sharePrice','dividends'],
            //     optionType:'single'
            // }
        },
        events:{
            // events:{
            //     options:{
            //         userTrades:true,
            //         insiderTrades:false,
            //         userDividends:false,
            //         dividends:false
            //     },
            //     optionType:'multi'
            // }
        },
        ratios:{
            ratios:{
                selectedOption:'pe',
                options:['pe','pb','dividendYield'],
                optionType:'single'
            }
        },
        financials:{
            statements:{
                selectedOption:'incomeStatement',
                options:['incomeStatement','balanceSheet','cashFlow'],
                optionType:'single'
            }
        }
    })

    const dispatch = useDispatch()
    const tickerData = useSelector(state => state.tickerData)
    const { loading:l1, ticker:tickerFullData, error:e1 } = tickerData
    const portfolioUserList = useSelector(state => state.portfolioUserList)
    const { loading, portfolios,error } = portfolioUserList

    useEffect(()=>{
        let tickerId = props.match.params.id
        dispatch(getTickerData(tickerId))
        if(!portfolios.length){
            dispatch(listUserPortfolios())
        }
    },[props])

    function searchFromPortfolios(portfolios,tickerFullData){
        let portfolioTicker=null
        portfolios.forEach(portfolio =>{
            let found = portfolio.tickers.find(ticker => ticker.ticker===tickerFullData.profile.ticker)
            if(found){
                portfolioTicker=found
            }
        })

        if(portfolioTicker){
            return portfolioTicker
        }else{
            return {
                ticker:tickerFullData.profile.ticker,
                name:tickerFullData.profile.name,
                transactions:[]
            }            
        }
    }

    useEffect(()=>{
        if(portfolios&&tickerFullData){
            let portfolioTicker = searchFromPortfolios(portfolios,tickerFullData)
            let newTicker = new Ticker(portfolioTicker,tickerFullData)
            setTicker(newTicker)
        }
    },[portfolios,tickerFullData,props])

    const [navigation,setNavigation] = useState({
        selected:{name:'price',index:0},
        options:['price','events','ratios','financials']
    })

    return (
        <div className='tickerScreen container'>
            <TickerHeader ticker={ticker}/>
            <SectionNav navigation={navigation} setNavigation={setNavigation}/>
            {/* <Options options={options} setOptions={setOptions}/> */}
            {loading?<div>Loading...</div>:error?<div>{error}</div>:
                <div className='sectionContainer'>
                    <div 
                        style={{right:navigation.selected.index*100+'%'}}
                        className='sections'
                    >    
                        <PriceChart ticker={ticker}/>    
                        <EventChart ticker={ticker}/>
                        <TickerRatios ticker={ticker}/>
                        <Financials ticker={ticker}/>   
                    </div>
                </div>
            }
            {/* {options.selectedMode==='price'&&
                <PriceChart ticker={ticker} options={options}/>
            } */}
            {/* {options.selectedMode==='events'&&
                <EventChart ticker={ticker} options={options}/>
            }
            {options.selectedMode==='ratios'&&
                <TickerRatios ticker={ticker} options={options}/>
            }
            {options.selectedMode==='financials'&&
                <Financials ticker={ticker} options={options}/>
            } */}
        </div>
    )
}

function Financials({ticker}){

    const [options,setOptions]=useState({
        selected:'incomeStatement',
        options:['incomeStatement','balanceSheet','cashFlow'],
        time:{
            timeValue:'20.years-years',
            timeStart:new Date().getFullYear(),
            timeEnd:new Date().getFullYear(),            
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

    function datasetKeyProvider(){ return Math.random()}    

    return(
        <div className='tickerFinancials'>
            <Options options={options} setOptions={setOptions}/>        
            <div className='financialChartContainer'>
                <Bar
                    datasetKeyProvider={datasetKeyProvider}
                    data={financialChart}
                    options={chartOptions}
                />  
            </div>
            <div className='financialStatement'>
                
                {financialData&&
                    <table>
                        <thead>
                            <tr>
                            <th>Year</th>
                            {financialData.map(item =>
                                <th>{item.date.substring(0, 7)}</th>
                            )}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(financialData[0]).map((item,index) =>{
                                return  index>1&&
                                    <tr>
                                        <td>{camelCaseToString(item)}</td>
                                        {financialData.map((elem,index) =>
                                            <td>{financialData[index][item]}</td>
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

function TickerRatios({ticker}){

    const ratioChartRef = useRef()
    const ratioPriceChartRef = useRef()

    const [options,setOptions]=useState({
        selected:'pe',
        options:['pe','pb','dividendYield'],
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
            },
        },
        layout: {
            padding: {
               left     : 0,
               right    : 0,
               top      : 0,
               bottom   : 0
            }
          },
        fontSize:20,
        legend: {
            align:'start',
            padding:20,
            labels: {
                fontSize: 20,
                padding:20,
                fontColor:'white',
                boxWidth: 0,
            }
        },
        tooltips: {
            mode: 'index',
            intersect: false,
            titleFontColor:'rgba(0,0,0,0)',
            enabled:false,
            custom: function(tooltipModel) {

                let ratioChart = ratioChartRef.current
                let ratioPrice = ratioPriceChartRef.current
                
                let toolTipItems=[
                    {id:'tooltipRatio',type:'point',chart:ratioChart,chartIndex:0},
                    {id:'toolTipPrice',type:'point',chart:ratioPrice,chartIndex:1},
                    {id:'tooltipRatioLabel',type:'label',chart:ratioChart,chartIndex:0},
                    {id:'toolTipPricelabel',type:'label',chart:ratioPrice,chartIndex:1},
                ]

                if(tooltipModel.dataPoints){

                    let tooltipPoints = tooltipModel.dataPoints.length
                    let index = tooltipModel.dataPoints[0].index

                    for(var i=0;i<tooltipPoints;i++){
                        toolTipItems.forEach((item,index) =>{
                            let tooltipItem = document.getElementById(item.id);
                            if(!tooltipItem){
                                tooltipItem = createTooltipItem(item) 
                            }                            
                            switch(item.type){
                                case 'point':
                                    setTooltipPoint(tooltipItem,item.chart,item.chartIndex)
                                    break
                                case 'label':
                                    setToolTipLabel(tooltipItem,item.chart,item.chartIndex)
                                    break
                                default:
                            }
                        })

                        function createTooltipItem(item){
                            let tooltipItem = document.createElement('div');                 
                            tooltipItem.id = item.id;
                            tooltipItem.innerHTML = '<table></table>';
                            document.body.appendChild(tooltipItem) 
                            return tooltipItem
                        }

                        function setToolTipLabel(item,chart,chartIndex){  

                            if (tooltipModel.body) {
                                let text =chart.props.data.datasets[0].data[index].toFixed(1)
                                var tableRoot = item.querySelector('table');
                                if(chartIndex===0){
                                    text = formatRatio(text,chart.props.data.datasets[0].label)
                                }else{
                                    text = text + '$'
                                }
                                tableRoot.textContent = text;
                            }      

                            let chartKey = Object.keys(chart.props.data.datasets[0]['_meta'])[0]
                            let position = chart.chartInstance.canvas.getBoundingClientRect()

                            if(chart.props.data.datasets[0]['_meta'][chartKey].data[index]){
                                item.style.opacity = 1;
                                item.style.position = 'absolute';
                                item.style.left = position.left + window.pageXOffset +tooltipModel.caretX+15  + 'px';
                                item.style.top = position.top + window.pageYOffset + chart.props.data.datasets[0]['_meta'][chartKey].data[index]['_model'].y-6+ 'px';
                                item.style.backgroundColor='dimgray'
                                item.style.color='white'
                                item.style.fontSize='15px'
                                item.style.borderRadius='25%'                                
                                item.style.padding='5px'                                  
                            }

                        }

                        function formatRatio(text,ratio){
                            switch(ratio){
                                case 'Historical PE-ratio':
                                    return 'P/E '+text
                                case 'Historical PB-ratio':
                                    return 'P/B '+text
                                case 'Historical Dividend Yield':
                                    return text+'%'
                                default: return ''
                            }
                        }

                        function setTooltipPoint(item,chart){                    
                            let chartKey = Object.keys(chart.props.data.datasets[0]['_meta'])[0]
                            let position = chart.chartInstance.canvas.getBoundingClientRect()
                            if(chart.props.data.datasets[0]['_meta'][chartKey].data[index]){
                                item.style.opacity = 1;
                                item.style.position = 'absolute';
                                item.style.left = position.left + window.pageXOffset +tooltipModel.caretX-6  + 'px';
                                item.style.top = position.top + window.pageYOffset + chart.props.data.datasets[0]['_meta'][chartKey].data[index]['_model'].y-6+ 'px';
                                item.style.pointerEvents = 'none';
                                item.style.width = '10px';
                                item.style.height = '10px';
                                item.style.borderRadius = '20px';
                                item.style.border = '2px solid black';
                                item.style.backgroundColor = 'white';                                   
                            }         
                        }

                        

                    }                    
                }else{
                    toolTipItems.forEach(item =>{
                        if(document.getElementById(item.id)){
                            document.getElementById(item.id).style.opacity=0;
                        }     
                    })
                }
            },
            callbacks: {
                label: function (tooltipItem, data) {
                    console.log(tooltipItem.yLabel)
                    // const { datasetIndex,index } = tooltipItem
                    // // tt.current.textContent=`${formatCurrency( tooltipItem.yLabel)}`
                    // let currentData = (datasetIndex===0?data.datasets[datasetIndex].percentageChange[index]:data.datasets[datasetIndex].percentageChangeWithDivs[index])+'%'
                    // // if(data.datasets[datasetIndex].options.price.chartType.selectedOption==='dividends'){
                    // //     currentData = data.datasets[datasetIndex].data[index].toFixed(2)+'$'
                    // }
                    return tooltipItem.yLabel.toFixed(1)+'$'
            }}
        },  
        scales: {
            xAxes: [{   
                ticks: {
                    maxTicksLimit: 8,
                    maxRotation: 0,
                    minRotation: 0
                },
            }],
        },
    })

    const [barChartOptions, setBarChartOptions] = useState({    
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                // display: false,
            },
        },
        fontSize:20,
        legend: {
            align:'start',
            padding:20,
            labels: {
                fontSize: 20,
                padding:20,
                fontColor:'white',
                boxWidth: 0,
            }
        },scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    barPercentage:0.5
                },
                categoryPercentage:0.5,
            }]
        }
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

    function datasetKeyProvider(){ return Math.random()}    

    return(
        <div className='section'>
            <Options options={options} setOptions={setOptions}/>
            <div className='ratioCharts'>
                <div className='ratioChartContainer'>
                    <Line
                        id={'ratioChart'}
                        ref={ratioChartRef}
                        datasetKeyProvider={datasetKeyProvider}
                        data={ratioChart}
                        options={chartOptions}
                    />  
                </div>
                <div className='ratioChartContainer'>
                    <Line
                        id={'ratioPriceChart'}
                        ref={ratioPriceChartRef}
                        datasetKeyProvider={datasetKeyProvider}
                        data={priceChart}
                        options={chartOptions}
                    /> 
                </div>
                <div className='ratioChartContainer'>
                    <Bar
                        datasetKeyProvider={datasetKeyProvider}
                        data={ratioFinancialChart}
                        options={barChartOptions}
                    /> 
                </div>
            </div>

        </div>
    )
}

function EventChart({ticker}){

    const [options,setOptions]=useState({
        selected:'',
        options:[],
        time:{
            timeValue:'20.years-years',
            timeStart:new Date().getFullYear(),
            timeEnd:new Date().getFullYear(),            
        },
    })

    const [chartOptions, setChartOptions] = useState({        
        responsive:true,
        maintainAspectRatio: false
    })
    const [chart, setChart] = useState({})

    useEffect(()=>{
        if(ticker){
            let chartComponents = ticker.eventChart(options)
            let chartData = calculateEventChart(chartComponents,options)
            setChartOptions(eventChartOptions())
            setChart(chartData)     
        }
    },[ticker, options])

    function datasetKeyProvider(){ return Math.random()}
    return(
        <section className='section'>
            <Options options={options} setOptions={setOptions}/>        
            <div className='tickerScreenChart'>
                <div className='chartContainer'>
                    <Line
                        id={'canvas'}
                        datasetKeyProvider={datasetKeyProvider}
                        data={chart}
                        options={chartOptions}
                    />  
                </div>
            </div>            
        </section>
    )
}

function PriceChart({ticker}){

    const chartRef = useRef()
    const [options,setOptions]=useState({
        selected:'',
        options:[],
        time:{
            timeValue:'20.years-years',
            timeStart:new Date().getFullYear(),
            timeEnd:new Date().getFullYear(),            
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

    function datasetKeyProvider(){ return Math.random()}
    return(
        <section className='section'
            onClick={e => setChartOptions(priceChartOptions(chart.datasets[0].data,options,chartRef)) }
        >
            <Options options={options} setOptions={setOptions}/>
            <div className='tickerScreenChart'>

                <div className='chartContainer'>
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
                </div>                  
            </div>

        </section>
    )
}

function TickerHeader({ticker}){
    return(
        <header className='tickerScreenHeader'>
            {ticker&&
                <ul>
                    <li>
                    <h1>{ticker.ticker}</h1></li>
                    <li><h2>{ticker.name}</h2></li>
                    <li><h2>{ticker.latestPrice('currency')}</h2></li>
                    <li><h2>{ticker.tickerData.profile.sector}</h2></li>
                    <li><h2>{ticker.tickerData.profile.industry}</h2></li>
                </ul>
            }
        </header>
    )
}
