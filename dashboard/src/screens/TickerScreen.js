import React,{ useEffect,useState } from 'react'
import { useDispatch,useSelector } from 'react-redux'
import { getTickerData } from '../actions/tickerActions';
import { camelCaseToString } from '../utils/utils';
import { Line, Bar } from 'react-chartjs-2';

export default function TickerScreen(props) {

    const [mode, setMode] = useState('financialRatios')
    const dispatch = useDispatch()
    const tickerData = useSelector(state => state.tickerData)
    const { loading, ticker, error } = tickerData

    useEffect(()=>{
        let tickerId = props.match.params.id
        dispatch(getTickerData(tickerId))
    },[])

    return (
        <div className='tickerScreen'>
            {ticker&&
                <div className='ticker'>
                <div className='tickerInfo'>
                    <h1>{ticker.ticker}</h1>
                    <p>{ticker.name}</p>                    
                    <button
                        style={{backgroundColor:mode==='financialRatios'&&'lightgreen'}} 
                        onClick={() => setMode('financialRatios')}
                    >Ratios</button>
                    <button 
                        style={{backgroundColor:mode==='financialStatements'&&'lightgreen'}} 
                        onClick={() => setMode('financialStatements')}
                    >Financial Statements</button>

                </div>
                {mode==='financialStatements'&&
                    <FinancialStatements ticker={ticker}/>
                }
                {mode==='financialRatios'&&
                    <FinancialRatios ticker={ticker}/>
                }
                </div>
            }
        </div>
    )
}

function FinancialRatios({ticker}){

    const [ratio, setRatio]=useState('pe-ratio')
    const [chart, setChart] = useState({
        type: 'line',
        datasets:[
            {
                data:[]
            }
        ],
        labels: [],
    })
    const [priceChart, setPriceChart] = useState({
        type: 'line',
        datasets:[
            {
                data:[]
            }
        ],
        labels: [],
    })
    const [chartOptions, setChartOptions] = useState({          responsive:true,
        maintainAspectRatio: false,
        fontSize:20,
        legend: {
            labels: {
                // This more specific font property overrides the global property
                fontSize: 20
            }
        },
        plugins: {
            datalabels: {
                display: false,
            },
        },
    })
    useEffect(()=>{
        if(ticker){
            let incomeEvents=ticker.incomeStatement.map(item =>  {return{eps:item.eps,date:item.date}})
            let balanceEvents=ticker.balanceSheet.map(item =>  {return{bookValue:item.tangibleBookValuePerShare,date:item.date}})
            let divEvents = ticker.dividendData
            let priceData = ticker.priceData
            let price=[];
            let data=[]
            let labels=[]
            for(var i=0;i<priceData.length;i++){
                let eps=incomeEvents.filter(item => new Date(item.date).getFullYear()<=new Date(priceData[i].date).getFullYear())
                let bookValue=balanceEvents.filter(item => new Date(item.date).getFullYear()<=new Date(priceData[i].date).getFullYear())
                let div = divEvents.filter(item => new Date(item.date).getFullYear()===new Date(priceData[i].date).getFullYear())
                switch(ratio) {
                    case 'pe-ratio':
                        if(eps[0]){
                            data.unshift(Number((priceData[i].close/eps[0].eps).toFixed(1)) )
                            labels.unshift(priceData[i].date.split('T')[0])
                            price.unshift(priceData[i].close)
                        }                      
                      break;
                    case 'pb-ratio':
                        if(bookValue[0]){
                            data.unshift(Number((priceData[i].close/bookValue[0].bookValue).toFixed(1)))
                            labels.unshift(priceData[i].date.split('T')[0])
                            price.unshift(priceData[i].close)
                        }   
                      break;
                    case 'dividend-yield':
                        if(div[0]){
                            let totalDiv = div.reduce((a,b)=>a+b.dividend,0)
                            data.unshift(Number(((totalDiv/priceData[i].close)*100).toFixed(1)))
                            labels.unshift(priceData[i].date.split('T')[0])
                            price.unshift(priceData[i].close)
                        }
                        break
                    default:
                  }   
            }
            let newData = {
                labels,
                datasets:[
                    {
                        label:ratio,
                        data,
                        pointRadius:0,      
                        pointHitRadius:15,  
                        borderColor:'rgba(45, 92, 57,0.8)'              
                    }
                ]
            }

            setChart(newData)
            let pointBackgroundColor=calculatePointColors(data,ratio)
            let newPriceData = {
                labels,
                datasets:[
                    {
                        label:'Price Chart',
                        data:price,
                        pointRadius:5,
                        pointHitRadius:15,
                        pointBackgroundColor                                     
                    }
                ]
            }
            setChart(newData)
            setPriceChart(newPriceData)
        }
    },[ticker,ratio])

    return(
        <div>
            <button                            
                onClick={() => setRatio('pe-ratio')}
                style={{backgroundColor:ratio==='pe-ratio'&&'lightgreen'}}
            >PE-ratio</button>
            <button
                onClick={() => setRatio('pb-ratio')}
                style={{backgroundColor:ratio==='pb-ratio'&&'lightgreen'}}
            >PB-ratio</button>
            <button
                onClick={() => setRatio('dividend-yield')}
                style={{backgroundColor:ratio==='dividend-yield'&&'lightgreen'}}
            >Dividend Yield</button>

            <div className='chart'>
                <Line
                    data={chart}
                    height={'100px'}
                    options={chartOptions}
                />      
            </div>
            <div className='chart'>
                <Line
                    data={priceChart}
                    height={'100px'}
                    options={chartOptions}
                />  
            </div>
        </div>
    )
}

function normalize (val, max, min) { return (((val - min) / (max - min))*100); }

function colorPercentage(perc,ratio) {

    if(ratio!=='dividend-yield') perc = 100-perc
    
	var r, g, b = 0;
	if(perc < 50) {
		r = 255;
		g = Math.round(5.1 * perc);
	}
	else {
		g = 255;
		r = Math.round(510 - 5.10 * perc);
	}
	var h = r * 0x10000 + g * 0x100 + b * 0x1;
	return '#' + ('000000' + h.toString(16)).slice(-6);
}

function calculatePointColors(data,ratio){
    let max = Math.max(...data)
    let min = Math.min(...data)
    let percentages = data.map(item => colorPercentage(normalize(item,max,min),ratio))
    return percentages
}

function FinancialStatements({ticker}){
    
    const [tickerData,setTickerData] = useState({})
    const [selectedStatement,setSelectedStatement] = useState('')
    const [selectedKey, setSelectedKey]=useState('')

    useEffect(()=>{
        let data ={}
        data.incomeStatement = ticker.incomeStatement
        data.balanceSheet = ticker.balanceSheet
        data.cashFlow = ticker.cashFlow
        setTickerData(data)
    },[ticker])

    return(
        <div className='tickerChart'>
            {Object.keys(tickerData).map(key =>
                <button 
                style={{backgroundColor:selectedStatement===key&&'lightgreen'}}
                onClick={() => (setSelectedStatement(key),setSelectedKey(''))} >{camelCaseToString(key)}</button>
            )}
            {ticker[selectedStatement]&&
                <div>
                    {Object.keys(ticker[selectedStatement][0]).map((item,index) =>{
                      return index>1&&
                        <button
                            onClick={() => setSelectedKey(item)}
                            style={{backgroundColor:selectedKey===item&&'lightgreen'}}
                        >
                        {camelCaseToString(item)}
                        </button>}
                    )}               
                </div>
            }
            {selectedKey&&selectedStatement&&
                <FinancialStatementChart data={ticker[selectedStatement]} selectedKey={selectedKey}/>
            }
        </div>
    )
}

function FinancialStatementChart({data,selectedKey}){
    const [chartOptions, setChartOptions] = useState({        
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: false,
            },
        },
    })
    const [chart, setChart] = useState({
        type: 'bar',
        datasets:[
            {
                data:[],
                backgroundColor:'rgba(45, 92, 57,0.8)'
            }       
        ],
        labels: [],
    })

    useEffect(()=>{
        if(data&&selectedKey){
            if(new Date(data[0].date)>new Date(data[1].date)){
                data = data.reverse()
            }
            
            let labels = data.map(item => item.date.split('-')[0])
            let dataArray = data.map(item => item[selectedKey])

            let newData = {
                labels,
                datasets:[
                    {
                        data:dataArray,
                    }
                ]
            }
            setChart(newData)

        }
    },[data,selectedKey])

    return(
        <div>
            <Bar
                data={chart}
                options={chartOptions}
            />  
        </div>
    )
}
