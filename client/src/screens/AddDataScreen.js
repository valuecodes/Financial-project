import React,{ useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import SearchInput from '../components/addDataComponents/SearchInput'
import { getTickerData, saveTicker, deleteTicker } from '../actions/tickerActions';
import { camelCaseToString } from '../utils/utils'
import { updateExhangeRates } from '../actions/exhangeRateActions';
import { TickerData } from '../utils/tickerData';

export default function AddDataScreen() {

    const dispatch = useDispatch()
    const { 
        tickerList, 
        tickerData, 
        tickerSave 
    } = useSelector(state => state)
    
    const { tickers } = tickerList
    const { loading:tickerLoading, tickerFullData, error:tickerError } = tickerData
    const { loading:saveLoading, success:saveSuccess, ticker:tickerSaved, error:saveError } = tickerSave

    let messages = {
        tickerLoading,
        saveLoading,
        tickerError,
        saveError,
        tickerSaved,
        saveSuccess
    }

    const [companyInfo, setCompanyInfo] = useState(new TickerData({}))
    const [currentTickers, setCurrentTickers] = useState([])
    const [selectedKey, setSelectedKey] = useState(null)

    useEffect(()=>{
        if(tickers){
            setCurrentTickers(tickers)
        }
    },[tickers])

    useEffect(()=>{
        if(tickerFullData){
            let ticker = new TickerData(tickerFullData)
            ticker.update()
            setCompanyInfo(ticker)
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
                <InputInfoHeader 
                    companyInfo={companyInfo} 
                    setCompanyInfo={setCompanyInfo} 
                    messages={messages}
                />
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
    const { loading:updateLoading, exhangeRate:eRateUpdate, error:updateError } = exhangeRateUpdate 
    
    useEffect(()=>{
        if(eRate){
            console.log(eRate,'set')
            setExchangeRate(eRate)
        }
    },[eRate])

    useEffect(()=>{ 
        if(eRateUpdate){
            console.log(eRateUpdate,'update')  
            setExchangeRate(eRateUpdate)
        } 
    },[eRateUpdate])

    const updateExchangeRatesHandler=()=>{
        dispatch(updateExhangeRates())
    }

    const parseTimeStamp = (timestamp) => {
        let date = new Date(exchangeRate.timestamp*1000).toISOString()
        return date.split('.')[0].replace('T',' ')
    }
    
    return(
        <div className='controlPanel'>
            {(loading||updateLoading)&&<div>Loading</div>}
            {(error||updateError)&&<div>Error</div>}
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
                        if(ticker.ratios.pe){
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
        let updatedCompanyInfo = companyInfo.addData(data)
        setCompanyInfo({...updatedCompanyInfo})
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

    const [table, setTable] = useState({
        headers:[],
        body:[],
        direction:'col'
    })

    useEffect(()=>{
        if(selectedKey){
            let selectedData = companyInfo.selectDataToTable(selectedKey)
            setTable({...selectedData})
        }
    },[selectedKey,companyInfo])

    const modifyDataHandler=(newValue,item)=>{
        companyInfo.modifyData(newValue,item)
        setCompanyInfo({...companyInfo})             
    }

    const addRowHandler=(key)=>{
        companyInfo.addRow(key)
        setCompanyInfo({...companyInfo})
    }

    const deleteDataHandler = (row) => {
        companyInfo.deleteRow(row)
        setCompanyInfo({...companyInfo})
    }

    const calculateInputWidth=(data,key)=>{
        if(data.length>8){
            return '6.5rem'
        }else if(key==='date'&&table.direction==='col'){
            return '14rem'
        }else{
            return '8rem'
        }
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
                            {table.direction==='row'&&
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
                                onChange={(e)=>modifyDataHandler(e.target.value,item)}
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
                    {table.direction==='col'&&
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
    let ratios = Object.keys(companyInfo.ratios)
    const dispatch = useDispatch()

    const processData = async () => {
        dispatch(saveTicker(companyInfo))
    }

    const deleteTickerHandler=()=>{
        if(companyInfo._id){
            dispatch(deleteTicker(companyInfo._id))
        }
    }    
    
    const modifyData=(newValue,key)=>{
        companyInfo.modifyData(newValue,key)
        setCompanyInfo({...companyInfo})
    }

    return(
        <div className='inputInfoHeader'>
            <ul>
                {keys.map((item,index) =>
                    <li key={index} className='inputInfoItem'>
                        <label className='itemLabel'>{camelCaseToString(item)}</label>
                        <input value={companyInfo.profile[item]} onChange={e => modifyData(e.target.value,item)}/>
                    </li>                
                )}
            </ul>  
            <div className='inputInfoRatios'>
                {ratios.map(ratio=>
                    <div key={ratio} className='inputInfoItem'>
                        <label className='itemLabel'>{camelCaseToString(ratio)}</label>
                        <input onChange={e => console.log(e)} value={companyInfo.ratios[ratio]|| ''}/>
                    </div>
                )}
                <button
                    onClick={() => updateRatios(companyInfo,setCompanyInfo)}
                >Update Ratios</button>
            </div>
            <div className='inputInfoActions'>
                <button onClick={processData} className='button'>Save Company Data</button> 
                <div className='messages'>
                    {messages.tickerLoading && <div className='loadingMessage'>Loading Ticker Data...</div>}
                    {messages.saveLoading && <div className='loadingMessage'>Saving Ticker...</div>}
                    {messages.saveSuccess && <div className='successMessage'>{messages.saveSuccess}</div>}
                    {messages.saveError && <div className='errorMessage'>{messages.saveError}</div>}
                </div>
                <button onClick={deleteTickerHandler}>Delete Ticker</button>
            </div>
            <div className='updateMessages'>
                {companyInfo.updateMessages.map(item =>
                    <div>{item}</div>
                )}
            </div>
        </div>
    )
}

function updateRatios(companyInfo,setCompanyInfo){
    companyInfo.update()
    setCompanyInfo({...companyInfo})
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