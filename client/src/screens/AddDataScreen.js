import React,{ useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import SearchInput from '../components/addDataComponents/SearchInput'
import Output from '../components/addDataComponents/Output'
import {
    calculateFinancialIncomeData,
    calculateFinancialBalanceSheetData,
    calculateFinancialCashFlowData,
    calculateCompanyInfo,
    calculateInsiderData,
    calculateYahooPrice,
    calculateYahooDividend,
    calculateInsiderMarketBeat,
    calculateMacroTrendsAnnual
} from '../components/calculations/inputCalculations'

export default function AddDataScreen() {
    const userSignin = useSelector(state => state.userSignin)
    const { loading, userInfo, error } = userSignin
    const inputRef=useRef()

    const [companyInfo, setCompanyInfo] = useState({
        profile:{
            ticker:'',
            name:'',
            description:'',
            sector:'',
            stockExhange: '',
            industry:'',
            subIndustry:'',
            founded:'',
            address:'',
            phone:'',
            website:'',
            employees:'',
        },
        incomeStatement:[],
        balanceSheet:[],
        cashFlow:[],
        insiderTrading:[],
        dividendData:[],
        priceData:[]
    })

    const [tickers, setTickers] = useState([])
    const [currentTickers, setCurrentTickers] = useState([])
    const [selectedData, setSelectedData] = useState({
        key:'', 
        state:[]
    })
    
    useEffect(()=>{
        async function getData(){
            let res = await axios.get('/api/tickers')
            setCurrentTickers(res.data.data)
        }
        getData()
    },[])

    const [data, setData] = useState('')
    const processData= async ()=>{
        try{
            let res = await axios.post('/dataInput/',companyInfo,{
                headers:{
                    Authorization: 'Bearer'+userInfo.token
                }
            })
            setCompanyInfo(res.data.data)
        } catch(err){

        }
    }

    const saveTickers = async()=>{
        try{
            let res = await axios.post('/dataInput/saveTickers',tickers,{
                headers:{
                    Authorization: 'Bearer'+userInfo.token
                }
            })
        } catch(err){

        }
    }

    const handleData=(data)=>{
            let array=data.split('\n')
            if(array.length>1){
                let key = getKey(array,data)
                switch (key) {
                    case 'Total Premiums Earned':
                    case 'Interest Income, Bank':
                    case 'Revenue':
                        setCompanyInfo({...companyInfo,incomeStatement:calculateFinancialIncomeData(array)})
                        break;
                    case 'Cash':
                    case 'Cash & Due from Banks':
                    case 'Cash & Equivalents':
                        setCompanyInfo({...companyInfo,balanceSheet:calculateFinancialBalanceSheetData(array)})
                        break;
                    case 'Net Income/Starting Line':
                    case 'Cash Taxes Paid':
                        setCompanyInfo({...companyInfo,cashFlow:calculateFinancialCashFlowData(array)})
                        break;
                    case 'companyInfo':
                        setCompanyInfo({...companyInfo, profile:calculateCompanyInfo(data,companyInfo)})
                        break
                    case 'insider':
                        setCompanyInfo({...companyInfo,insiderTrading:[...companyInfo.insiderTrading,calculateInsiderData(data)]})
                        break
                    case 'yahooPrice':
                        setCompanyInfo({...companyInfo,priceData:calculateYahooPrice(array)})
                        break
                    case 'insiderMarketBeat':
                         setCompanyInfo({...companyInfo,insiderTrading:calculateInsiderMarketBeat(data)})
                        break
                    case 'tickers':
                        setTickers([...tickers,...getTickers(array)])
                        break
                    case 'helsinki':
                        setTickers([...tickers,...getHelsinkiTickers(array)])
                        break
                    case 'macroTrendsAnnual':
                        calculateMacroTrendsAnnual(array,companyInfo,setCompanyInfo)
                        break
                    case 'dividends':
                        setCompanyInfo({...companyInfo,dividendData:calculateYahooDividend(array)})
                        break
                    default:
                        break;
                }          
            }
            inputRef.current.value=''
    }

    async function selectTicker(id) {
        try{
            let res = await axios.get('/dataInput/'+id,{
                headers:{
                    Authorization: 'Bearer'+userInfo.token
                }
            })
            setCompanyInfo(res.data.data)
        } catch(err){

        }
    }

    const handleFileData=(e)=>{
        const file = e.target.files[0]
        const reader = new FileReader();
        reader.addEventListener('load', function(e) {   
            var text = e.target.result;
            handleData(text)
        });
        reader.readAsText(file);
    }

    const updateTickerList = async () =>{
        try{
            let res = await axios.get('/dataInput/updateList')
            setCompanyInfo(res)
        } catch(err){

        }
    }

    return (
        <div className='inputPage'>
            <div className='inputContainer'>     
                <SearchInput 
                    currentTickers={currentTickers}
                    selectTicker={selectTicker}    
                />
                <div className='inputActions'>
                    <div className='dataInputs'>
                        <textarea 
                            className='financeInput' 
                            type='text' 
                            onChange={e => handleData(e.target.value)}
                            ref={inputRef}
                        />
                        <input
                            onChange={e => handleFileData(e)}
                        className='financeInput' type='file'/>
                    </div>
                    <div className='inputButtons'>
                        <button onClick={processData} className='button'>Save Company Data</button>
                        <button onClick={saveTickers} className='button'>save tickers</button>            
                        <button className='button' onClick={updateTickerList}>
                            Update Tickerlist
                        </button>
                    </div>

                </div>
            </div>
            <div className='inputInfoContainer'>
                <InputInfo text={'Profile'} dataText={'profile'} state={companyInfo.profile} setSelectedData={setSelectedData}/>
                <InputInfo text={'Income Statement'} dataText={'incomeStatement'} state={companyInfo.incomeStatement} setSelectedData={setSelectedData}/>
                <InputInfo text={'Balance Sheet'} dataText={'balanceSheet'} state={companyInfo.balanceSheet} setSelectedData={setSelectedData}/>
                <InputInfo text={'Cash Flow'} dataText={'cashFlow'} state={companyInfo.cashFlow} setSelectedData={setSelectedData}/>
                <InputInfo text={'Price Data'} dataText={'priceData'} state={companyInfo.priceData} setSelectedData={setSelectedData}/>
                <InputInfo text={'Dividend Data'} dataText={'dividendData'} state={companyInfo.dividendData} setSelectedData={setSelectedData}/>
                <InputInfo text={'Insider Trades'} dataText={'insiderTrading'} state={companyInfo.insiderTrading} setSelectedData={setSelectedData}/>
            </div>
            <Output selectedData={selectedData.state} setSelectedData={setSelectedData} dataText={selectedData.dataText} setCompanyInfo={setCompanyInfo} companyInfo={companyInfo}/>
        </div>
    )
}

function getKey(array,data){

        if(array[1].split('\t')[0]==='Trend'){
            array.splice(1,2)
        }
        let key = array[1].split('\t')[0]
        console.log(array)
        if(array[2]==='CURRENT PRICE') key = 'companyInfo'
        if(checkInsider(data)) key = 'insider'
        if(array[0]==='Date,Open,High,Low,Close,Adj Close,Volume') key = 'yahooPrice'
        if(key==='Transaction Date') key='insiderMarketBeat'
        if(array.length>9){
            if(array[9].split(',')[0]==="Ticker") key='tickers'
        }
        if(key==='Cargotec Oyj') key='helsinki'
        if(array[0]==="Date,Dividends") key='dividends'
        if(key==='Annual Data | Millions of US $ except per share data') key = 'macroTrendsAnnual'
        return key
}

function getHelsinkiTickers(data){
    let tickers = []
    for(var i=0;i<data.length;i++){
        tickers.push({
            ticker: data[i].split('\t')[1],
            name: data[i].split('\t')[0],
            sector: '',
            stockExhange: '',
            country: data[i].split('\t')[3].substring(0, 2),
            currency: data[i].split('\t')[2],
            description:'',
            industry:'',
            subIndustry:'',
            founded:'',
            address:'',
            phone:'',
            website:'',
            employees:'',
            incomeStatement:[],
            balanceSheet:[],
            cashFlow:[],
            insiderTrading:[],
            priceData:[]                
        })
    }

    return tickers
}

function CompanyInfo({state}){
    return(
        <div className='inputInfo'
            style={{backgroundColor:state.name?'#CBFFCE':'#FFD5CB'}}
        >
            <span>Name: {state.name}</span>
        </div>
    )
}

function InputInfo({ text, dataText,  state, setSelectedData}){
    return(
        <div className='inputInfo'
            style={{backgroundColor:Object.keys(state).length?'#CBFFCE':'#FFD5CB'}}
            onClick={e => setSelectedData({dataText,state})}
        >
            {text} {Object.keys(state).length}
        </div>
    )
}

function getTickers(data){

    let tickers=[]

    for(var i=10;i<data.length-2;i++){
        tickers.push({
            ticker: findData(data,i,'Ticker'),
            name: findData(data,i,'Name'),
            sector: findData(data,i,'Sector'),
            stockExhange: findData(data,i,'Exchange'),
            country: findData(data,i,'Location'),
            currency: findData(data,i,'Market Currency'),
            description:'',
            industry:'',
            subIndustry:'',
            founded:'',
            address:'',
            phone:'',
            website:'',
            employees:'',
            incomeStatement:[],
            balanceSheet:[],
            cashFlow:[],
            insiderTrading:[],
            priceData:[]
        })
    }
    return tickers
}

function findData(data,index,search){
    let key = data[9].split(',').findIndex(item => item===search)
    return data[index].split('",')[key].replace('"','')
}

function checkInsider(data){
    return data.split("This news release was distributed by Company News System, www.nasdaqomxnordic.com/news").length===2
}
