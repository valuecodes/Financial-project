import React,{ useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import SearchInput from '../components/addDataComponents/SearchInput'
import {
    calculateFinancialCashFlowData,
    calculateCompanyInfo,
    calculateInsiderData,
    calculateYahooPrice,
    calculateYahooDividend,
    calculateInsiderMarketBeat,
    calculateMacroTrendsAnnual,
    calculateFinancialIncomeReuters,
    calculateFinancialBalanceSheetReuters,
    getReuterCurrency
} from '../components/calculations/inputCalculations'
import { getTickerData, saveTicker, deleteTicker } from '../actions/tickerActions';
import { camelCaseToString, uuidv4 } from '../utils/utils'
import { tickerDataModel } from '../utils/dataModels'
import { getExhangeRates, updateExhangeRates } from '../actions/exhangeRateActions';

export default function AddDataScreen() {

    const dispatch = useDispatch()
    const userSignin = useSelector(state => state.userSignin)
    const { loading, userInfo, error } = userSignin
    const tickerList = useSelector(state => state.tickerList)
    const { tickers } = tickerList
    const tickerData = useSelector(state => state.tickerData)
    const { loading:tickerLoading, tickerFullData, error:tickerError } = tickerData
    const tickerSave = useSelector(state => state.tickerSave)
    const { loading:saveLoading, success:saveSuccess, ticker:tickerSaved, error:saveError } = tickerSave

    let messages = {
        tickerLoading,
        saveLoading,
        tickerError,
        saveError,
        tickerSaved,
        saveSuccess
    }

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
            website:'',
            employees:'',
            country:'',
            tickerCurrency:'',
            financialDataCurrency:'',
        },
        incomeStatement:[],
        balanceSheet:[],
        cashFlow:[],
        insiderTrading:[],
        dividendData:[],
        priceData:[]
    })
    const [currentTickers, setCurrentTickers] = useState([])
    const [selectedKey, setSelectedKey] = useState(null)

    useEffect(()=>{
        if(tickers){
            setCurrentTickers(tickers)
        }
    },[tickers])

    useEffect(()=>{
        if(tickerFullData){
            setCompanyInfo(tickerFullData)
        }
    },[tickerFullData])
    
    function selectTicker(id) {
        dispatch(getTickerData(id))
    }

    return (
        <div className='inputPage'>
            <div className='inputContainer'>     
                <SearchInput 
                    currentTickers={currentTickers}
                    selectTicker={selectTicker}    
                />
                <InputActions 
                    companyInfo={companyInfo} 
                    setCompanyInfo={setCompanyInfo}
                    tickers={tickers}
                    selectTicker={selectTicker}    
                />
            </div>
            <div className='output'>
                <ControlPanel/>
                <InputInfoHeader companyInfo={companyInfo} setCompanyInfo={setCompanyInfo} messages={messages}/>
                <div className='inputInfoButtons'>    
                    <InputInfo dataKey={'incomeStatement'} data={companyInfo} setSelectedKey={setSelectedKey}/>
                    <InputInfo dataKey={'balanceSheet'} data={companyInfo} setSelectedKey={setSelectedKey}/>
                    <InputInfo dataKey={'cashFlow'} data={companyInfo} setSelectedKey={setSelectedKey}/>
                    <InputInfo dataKey={'priceData'} data={companyInfo} setSelectedKey={setSelectedKey}/>
                    <InputInfo dataKey={'dividendData'} data={companyInfo} setSelectedKey={setSelectedKey}/>
                    <InputInfo dataKey={'insiderTrading'} data={companyInfo} setSelectedKey={setSelectedKey}/>
                </div>
                <Output selectedKey={selectedKey} companyInfo={companyInfo} setCompanyInfo={setCompanyInfo}/>
            </div>
        </div>
    )
}

function ControlPanel(){

    const dispatch = useDispatch()
    const [exchangeRate, setExchangeRate]=useState(null)
    const exhangeRateList = useSelector(state => state.exhangeRateList)
    const { loading, exhangeRate:eRate, error } = exhangeRateList
    const exhangeRateUpdate = useSelector(state => state.exhangeRateUpdate)
    const { loading:updateLoading, success, exhangeRate:eRateUpdate, error:updateError } = exhangeRateUpdate 
    
    useEffect(()=>{
        if(eRate){
            console.log(eRate,'set')
            setExchangeRate(eRate)
        }
    },[eRate])

    useEffect(()=>{ 
        if(eRateUpdate){
            console.log(eRate,'update')  
            setExchangeRate(eRateUpdate)
        } 
    },[eRateUpdate])

    useEffect(()=>{
        dispatch(getExhangeRates())
    },[])

    const updateExchangeRatesHandler=()=>{
        dispatch(updateExhangeRates())
    }

    const parseTimeStamp = (timestamp) => {
        let date = new Date(exchangeRate.timestamp*1000).toISOString()
        return date.split('.')[0].replace('T',' ')
    }
    
    return(
        <div className='controlPanel'>
            <div className='exhangeRates'>
                <button onClick={updateExchangeRatesHandler}>Update Exhange rates</button>
                {exchangeRate&&
                    <div className='exhangeRate'>
                        <label>Date:</label>
                        <p>{exchangeRate.date}</p>
                        <label>Updated:</label>
                        <p>{parseTimeStamp(exchangeRate.timestamp)}</p>
                    </div>                
                }
            </div>
        </div>
    )
}

function InputActions({ companyInfo, setCompanyInfo, tickers, selectTicker }){

    const [tickerList,setTickerList]=useState({
        ready:[],
        notReady:[]        
    })
    const [tickerSort, setTickerSort]=useState({
        selected:'UpdatedAt',
        values:['All','UpdatedAt'],
    })

    const inputRef=useRef()

    useEffect(()=>{
        if(tickers){

            const { selected } = tickerSort
            let ready = []
            let notReady = []

            switch(selected){
                case 'UpdatedAt':
                    tickers.forEach(ticker =>{
                        if(ticker.updatedAt){
                            ready.push(ticker)
                        }else{
                            notReady.push(ticker)
                        }
                    })                    
                    break
                default: ready = tickers
            }

            setTickerList({ready,notReady})
        }
    },[tickers,tickerSort])

    const handleData=(data)=>{
        let array=data.split('\n')
        if(array.length>1){
            let key = getKey(array,data)
            switch (key) {
                case 'reutersIncome':
                    setCompanyInfo({
                        ...companyInfo,
                        profile:{...companyInfo.profile,financialDataCurrency:getReuterCurrency(array)},
                        incomeStatement:calculateFinancialIncomeReuters(array)
                    })
                    break;
                case 'reutersBalance':
                    setCompanyInfo({
                        ...companyInfo,
                        profile:{...companyInfo.profile,financialDataCurrency:getReuterCurrency(array)},
                        balanceSheet:calculateFinancialBalanceSheetReuters(array)})
                    break;
                case 'reutersCash':
                    setCompanyInfo({
                        ...companyInfo,
                        profile:{...companyInfo.profile,financialDataCurrency:getReuterCurrency(array)},  
                        cashFlow:calculateFinancialCashFlowData(array)
                    })
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
    
    const handleFileData=(e)=>{
        const file = e.target.files[0]
        const reader = new FileReader();
        reader.addEventListener('load', function(e) {   
            var text = e.target.result;
            handleData(text)
        });
        reader.readAsText(file);
    }

    return(
        <div className='inputActions'>
            <div className='dataInputs'>
                <textarea 
                    className='financeInput' 
                    type='text' 
                    onChange={e => handleData(e.target.value)}
                    ref={inputRef}
                    placeholder={'Copy paste text here...'}
                />
                <div className='financeFileInputContainer'>
                    <p className='financeFileInputText'>Drag files here</p>  
                    <input
                        onChange={e => handleFileData(e)}
                        className='financeFileInput' type='file'
                        placeholder={'Copy paste text here...'}                    
                    />                  
                </div>
            </div>
            <div className='tickerUpdated'>
                <label>Since last updated days</label>
                <input type='range'/>
                {tickerSort.values.map(item =>
                    <button 
                        key={item}
                        style={{backgroundColor:item===tickerSort.selected&&'lightgreen'}}
                        onClick={() => setTickerSort({...tickerSort,selected:item})}
                        >{item}
                    </button>
                )}                
                <div className='tickerUpdateList ready'>
                    <h3>Ready</h3>
                    {tickerList.ready.map(ticker =>
                        <div 
                            key={ticker.tickerId}
                            onClick={() => selectTicker(ticker.ticker)}
                            className='tickerUpdateListTicker'
                            style={{backgroundColor:companyInfo.profile.ticker===ticker.ticker&&'lightgreen'}}
                        >
                            <p>{ticker.ticker}</p>
                        </div>
                    )}
                </div>
                <div className='tickerUpdateList notReady'>
                    <h3>Not Ready</h3>
                    {tickerList.notReady.map(ticker =>
                        <div 
                            key={ticker.tickerId}
                            onClick={() => selectTicker(ticker.ticker)}
                            className='tickerUpdateListTicker'
                            style={{backgroundColor:companyInfo.profile.ticker===ticker.ticker&&'lightgreen'}}
                        >
                            <p>{ticker.ticker}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function Output({selectedKey, companyInfo, setCompanyInfo}){

    const [direction,setDirection]=useState('')
    const [table, setTable] = useState({
        headers:[],
        body:[],
    })

    useEffect(()=>{

        if(selectedKey){
            let selectedData = companyInfo[selectedKey].sort((a,b)=>new Date(b.date)-new Date(a.date))
            let key = selectedKey

            if(!selectedData[0]){
                setTable({
                    headers:[],
                    body:[],
                })
                return
            }    

            let headers =[]
            let body = []

            function parseDate(date){
                function isIsoDate(str) {
                    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
                    var d = new Date(str); 
                    return d.toISOString()===str;
                  }
                if(isIsoDate(date)){
                    return date
                }else{
                    return date.toISOString()
                }                  
            }

            switch(key){
                case 'incomeStatement':
                case 'balanceSheet':
                case 'cashFlow':
                    headers = selectedData.map(item =>{ 
                        let date = parseDate(item.date)
                        return{
                            value:date.split('-')[0],
                            key,
                            id:item._id?item._id:item.id
                        }
                    })
                    let dataKeys = Object.keys(selectedData[0]).filter(item => item!=='_id'&&item!=='id')
                    dataKeys.forEach(item =>{
                        let data=selectedData.map(data =>{
                            let value = item==='date'?parseDate(data[item]).split('T')[0]:data[item]  
                            return{
                            dataKey:key,
                            key:item,
                            value:value,
                            date:data.date,
                            id:data._id?data._id:data.id
                        }})
                        body.push({
                            key:item,
                            data:data,
                            id:data._id?data._id:data.id
                        })
                    })
                    setTable({headers,body})
                    setDirection('row')
                    break
                case 'priceData':
                case 'dividendData':
                case 'insiderTrading':
                    headers = Object.keys(selectedData[0]).filter(item => item!=='_id'&&item!=='id')
                    headers = headers.map(item =>{
                        return{
                            value:item
                        }
                    })
                    selectedData.forEach(item =>{
                        let data = Object.keys(item).map(data => {
                            let value = data==='date'?parseDate(item[data]).split('T')[0]:item[data]
                            return{
                                dataKey:key,
                                key:data,
                                value:value,
                                date:item.date,
                                id:item._id?item._id:item.id
                            }
                        })
                        data = data.filter(item => item.key!=='_id'&&item.key!=='id')
                        body.push({
                            key:key,
                            data:data,
                            id:item._id?item._id:item.id
                        })
                    })
                    setTable({headers,body})
                    setDirection('col')
                    break
            }
        }
    },[selectedKey,companyInfo])

    const modifyDataHandler=(e,item)=>{
        const { dataKey, key, id } = item
        let newValue=''
        if(e.target.value!==''){
            switch(key){
                case 'date':
                    newValue=new Date(e.target.value).toISOString()
                    break
                case 'name':
                case 'position':
                case 'type':
                case 'instrument':
                    newValue=e.target.value
                    break
                default:
                    newValue = Number(e.target.value)
            } 
        }
        let index = companyInfo[dataKey].findIndex(item => item._id === id||item.id===id)
        const updatedCompanyInfo = {...companyInfo}
        if(index>=0){
            updatedCompanyInfo[dataKey][index][key] = newValue
            setCompanyInfo(updatedCompanyInfo)             
        }
    }

    const calculateInputWidth=(data,key)=>{
        if(data.length>8){
            return '6.5rem'
        }else if(key==='date'&&direction==='col'){
            return '14rem'
        }else{
            return '8rem'
        }
    }

    const addRowHandler=(key)=>{
        let template = Object.assign({}, tickerDataModel[key]);
        template.id = uuidv4()
        const updatedCompanyInfo = {...companyInfo}
        updatedCompanyInfo[key].push(template)
        setCompanyInfo(updatedCompanyInfo)
    }

    const calculateType=(key)=>{
        switch(key){
            case 'date':
                return 'date'
            case 'name':
            case 'position':
            case 'type':
            case 'instrument':
                return 'text'
            default: return 'number'
        }
    }

    const deleteDataHandler = (row) => {
        const { key, id } = row
        const updatedCompanyInfo = {...companyInfo}
        let index = updatedCompanyInfo[key].findIndex(item => item._id === id||item.id===id)
        updatedCompanyInfo[key].splice(index,1)
        setCompanyInfo(updatedCompanyInfo)
    }

    return(
        <table className='inputDataTable'>
            <thead>
                <tr>
                    <th>{selectedKey&&<h3>{camelCaseToString(selectedKey)}</h3>}</th>
                </tr>
                <tr>
                    <th>
                    {selectedKey&&
                        <button 
                            onClick={e => addRowHandler(selectedKey)}
                            className='addRowButton'>Add row</button>
                    }
                    </th>
                    {table.headers.map((item,index) =>
                        <th className='tableHeader' key={index}>
                           <span>{camelCaseToString(item.value)}</span>
                            {direction==='row'&&
                                <button onClick={e => deleteDataHandler(item)}>X</button>
                            }
                        </th>
                    )}
                </tr>                
            </thead>
            <tbody>
            {table.body.map((row,index) => 
                <tr key={index}>
                    <td>{camelCaseToString(row.key)}</td>
                    {row.data.map((item,index) =>
                        <td key={index}>
                            <input
                                onChange={(e)=>modifyDataHandler(e,item)}
                                style={{
                                    width:calculateInputWidth(row.data,item.key),
                                    backgroundColor:item.value===null?'rgba(247, 103, 87,0.4)':'rgba(87, 247, 154,0.4)'
                                }}
                                className='inputTableInput' 
                                value={item.value===null?'':item.value}
                                type={calculateType(item.key) }
                            />
                        </td>  
                    )}   
                    {direction==='col'&&
                        <td>
                            <button onClick={() => deleteDataHandler(row)}>Delete</button>
                        </td>                   
                    }
                </tr>
            )}                
            </tbody>
        </table>
    )
}

function InputInfoHeader({companyInfo, setCompanyInfo, messages}){

    let keys = Object.keys(companyInfo.profile).filter(item => item!=='_id')
    const dispatch = useDispatch()
    
    const processData = async () => {
        dispatch(saveTicker(companyInfo))
    }

    const deleteTickerHandler=()=>{
        if(companyInfo._id){
            dispatch(deleteTicker(companyInfo._id))
        }
    }    
    
    const modifyData=(e,key)=>{
        const newValue = e.target.value
        const updatedCompanyInfo = {...companyInfo}
        updatedCompanyInfo.profile[key] = newValue
        setCompanyInfo(updatedCompanyInfo)
    }

    return(
        <div className='inputInfoHeader'>
            <ul>
                {keys.map((item,index) =>
                    <li key={index} className='inputInfoItem'>
                        <label>{camelCaseToString(item)}</label>
                        <input value={companyInfo.profile[item]} onChange={e => modifyData(e,item)}/>
                    </li>                
                )}
            </ul>  
            <div className='inputInfoActions'>
                <button onClick={processData} className='button'>Save Company Data</button> 
                <div className='messages'>
                    {messages.tickerLoading && <div>Loading Ticker Data...</div>}
                    {messages.saveLoading && <div>Saving Ticker...</div>}
                    {messages.saveSuccess&&<div>Ticker saved Succesfully</div>}
                    {messages.saveError&&<div>Error saving ticker</div>}
                </div>
                <button onClick={deleteTickerHandler}>Delete Ticker</button>
            </div>
        </div>
    )
}

function getKey(array,data){
        if(array[1].split('\t')[0]==='Trend'){
            array.splice(1,2)
        }
        let key = array[1].split('\t')[0]
        if(array[2]==='CURRENT PRICE') key = 'companyInfo'
        if(checkInsider(data)) key = 'insider'
        if(array[0]==='Date,Open,High,Low,Close,Adj Close,Volume') key = 'yahooPrice'
        if(key==='Transaction Date') key='insiderMarketBeat'
        if(array[0]==="Date,Dividends") key='dividends'
        if(key==='Annual Data | Millions of US $ except per share data') key = 'macroTrendsAnnual'
        let reuterKey = checkReuters(array)
        if(reuterKey){
            key=reuterKey
            console.log(reuterKey)
        }
        
        return key
}

function checkReuters(array){
    if(array[14]){
        let incomeKeys=['Revenue','Total Premiums Earned','Interest Income, Bank']
        let balanceKeys=['Cash','Cash & Due from Banks','Cash & Equivalents']
        let cashflowKeys=['Net Income/Starting Line','Cash Taxes Paid']
        let key = array[14].split('\t')[0]

        let keyFound=null;
        if(incomeKeys.find(item => item===key)){
            keyFound='reutersIncome'
        }else if(balanceKeys.find(item => item===key)){
            keyFound='reutersBalance'
        }else if(cashflowKeys.find(item => item===key)){
            keyFound='reutersCash'
        }
        return keyFound
    }else{
        return null
    }

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

function InputInfoProfile({ dataKey, data, setSelectedKey}){

    let length = Object.values(data[dataKey]).filter(item => item!=='').length

    return(
        <div className='inputInfo'
            style={{backgroundColor:length?'#CBFFCE':'#FFD5CB'}}
            onClick={e => setSelectedKey(dataKey)}
        >
            {camelCaseToString(dataKey)} {length}
        </div>
    )
}

function InputInfo({ dataKey, data, setSelectedKey}){
    return(
        <div className='inputInfo'
            style={{backgroundColor:Object.keys(data[dataKey]).length?'#CBFFCE':'#FFD5CB'}}
            onClick={e => setSelectedKey(dataKey)}
        >
            {camelCaseToString(dataKey)} {Object.keys(data[dataKey]).length}
        </div>
    )
}

function checkInsider(data){
    return data.split("This news release was distributed by Company News System, www.nasdaqomxnordic.com/news").length===2
}
