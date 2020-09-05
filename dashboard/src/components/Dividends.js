import React,{useEffect,useState} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getPortfolioTickersData } from '../actions/tickerActions';
import { Line } from 'react-chartjs-2'
import { SetTimePeriod } from './graphComponents';
import { calculateDividendTransactions, transactionsToMonths, getAllDividends,  filterDividends, getMonthNum } from '../utils/portfolioUtils';

export default function Dividends({selectedPortfolio}) {

    const dispatch=useDispatch()
    const [currentPage, setCurrentPage] = useState('graph')
   
    const [selectedTicker, setSelectedTicker] = useState({
        _id:null
    })

    const [dividendTransactions, setDividendTransactions] = useState([])
    const [dividendList, setDividendList] = useState([])

    const tickerPortfolioData = useSelector(state => state.tickerPortfolioData)
    const {loading:portfolioDataLoading, tickers:tickerData, error:portfolioDataError} = tickerPortfolioData

    useEffect(()=>{
        if(tickerData&&selectedPortfolio){
            let transactions=calculateDividendTransactions(selectedPortfolio,tickerData)
            setDividendTransactions(transactions)
            setDividendList(getAllDividends(tickerData,transactions))
        }
    },[tickerData,selectedPortfolio])

    return (
        <div className='dividendGraph card'>
            <div className='graphHeader'>
                <div className=''>
                    <button
                        style={{backgroundColor:currentPage==='graph'?'lightgreen':''}} 
                        onClick={() => setCurrentPage('graph')}>Dividend Graph</button>
                    <button
                        style={{backgroundColor:currentPage==='calendar'?'lightgreen':''}} 
                        onClick={() => setCurrentPage('calendar')}>Dividend Calendar</button>
                </div>
                {selectedPortfolio&&
                    <div className='selectedPortfolio'>
                        <button 
                            onClick={e => setSelectedTicker({_id:null})}
                            style={{backgroundColor: selectedTicker._id?'':'lightgreen'}}  
                            >All</button>
                        {selectedPortfolio.tickers.map(ticker =>
                            <button
                                key={ticker._id}
                                onClick={e => setSelectedTicker(ticker)}
                                style={{backgroundColor: ticker._id === selectedTicker._id? 'lightgreen':''}}
                                >
                            {ticker.ticker}</button>
                        )}
                    </div>
                }  
            </div>
            <div>
                {/* {currentPage==='graph' &&
                    <DividendGraph 
                        dividendTransactions={dividendTransactions}
                        selectedTicker={selectedTicker}
                    />
                }
                {currentPage==='calendar' &&
                    <DividendCalendar
                        dividendList={dividendList}
                        selectedTicker={selectedTicker}
                    />
                } */}
            </div>
            
        </div>
    )
}

function DividendCalendar({dividendList,selectedTicker}){

    const [months, setMonths] = useState([]);
    const [dividends, setDividends] = useState([])
    const [options, setOptions] = useState({
        timeValue:'',
        timeStart:new Date().getFullYear(),
        timeEnd:new Date().getFullYear()
    })


    useEffect(()=>{
        setMonths(createMonths)
    },[])

    useEffect(()=>{
        if(dividendList.length>0){
            let dividends=filterDividends(dividendList,options,selectedTicker)
            let updateMonths = createMonths()
            dividends.forEach(div => {
                updateMonths[getMonthNum(div)].dividends.push(div)
            });
            setMonths(updateMonths)
            setDividends(dividendList)
        }
    },[dividendList,options,selectedTicker])

    function createMonths(){
        const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']    
        let months = monthNames.map((item,index) =>{
            return{
            name:item,
            num:index+1,
            dividends:[]                
            }
        })  
        return months
    }

    return(
        <div>
            {dividends.length>0 &&
                <SetTimePeriod 
                    options={options} 
                    setOptions={setOptions} 
                    type={'yearly'} 
                    yearsFrom={Number(dividends[dividends.length-1].date.split('-')[0])} 
                    yearsTo={Number(dividends[0].date.split('-')[0])}
                    all={false}
                />            
            }            

            <div className='calendar calendarRows'>                
                <div className='labels'>
                    <label className='lightGreen'>My dividend</label>
                    <label className='gray'>Dividend</label>
                </div>    
                {months.map((month,index) =>
                    <CalendarColumn key={month.num} month={month} index={index}/>
                )}  
            </div>

            <div className='months calendarRows'>  
                {months.map(month =>
                    <p key={month.num}>{month.name}</p>
                )}   
            </div>
        </div>
    )
}

function CalendarColumn({month, index}){
    return(
        <div className='calendarColumn'>
            {month.dividends.map(div =>
                <div key={div._id} className='dividendEvent'
                    style={{backgroundColor:div.transaction&&'lightgreen'}}
                >
                    <span>{div.ticker}</span>
                    {div.transaction&& <span>{div.transaction.payment.toFixed(2)}$</span> }
                </div>
            )}
        </div> 
    )
}

function DividendGraph({dividendTransactions,selectedTicker}){

    const [dividends,setDividends] =useState([])

    const [time, setTime] = useState({
        value:'',
        start:0,
        end:0
    })

    const [chart, setChart] = useState({
        type: 'line',
        datasets:[
            {
                data:[]
            }
        ],
        labels: [],
    })

    useEffect(()=>{
        if(dividendTransactions){

            if(selectedTicker._id){
                dividendTransactions = dividendTransactions.filter(item => item.ticker===selectedTicker.ticker)
            }

            if(dividendTransactions.length>0){
                let monthlyTransactions = transactionsToMonths(dividendTransactions,time)
                let labels = monthlyTransactions.labels
                let data = monthlyTransactions.values
                let newData = {
                    labels,
                    datasets:[
                        {
                            data
                        }
                    ]
                }
                setChart(newData)                
            }else{
                let newData = {
                    
                    datasets:[
                        {
                        
                        }
                    ]
                }
                setChart(newData)   
            }
            setDividends(dividendTransactions)
        }
    },[dividendTransactions,time,selectedTicker])   

    return(
        <div className='graphContainer'>
            {dividends.length>0 &&
                <SetTimePeriod 
                    time={time} 
                    setTime={setTime} 
                    type={'yearly'} 
                    yearsFrom={Number(dividends[dividends.length-1].date.split('-')[0])} 
                    yearsTo={Number(dividends[0].date.split('-')[0])}
                />            
            }
            <Line
                data={chart}
                // width={20}
                // height={10}
                options={{
                    responsive:true,
                    maintainAspectRatio: false}}
                // options={this.state.chartOptions}
            /> 
        </div>
    )
}
