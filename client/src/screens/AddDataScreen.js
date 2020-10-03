import React,{ useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import SearchInput from '../components/addDataComponents/SearchInput'
import { getTickerData, saveTicker, deleteTicker, getPriceDataFromApi, getFinancialsDataFromApi } from '../actions/tickerActions';
import { camelCaseToString, convertDate } from '../utils/utils'
import { updateExhangeRates } from '../actions/exhangeRateActions';
import { TickerData } from '../utils/tickerData';
import { updateTickerRatios } from '../actions/tickerActions';
import SectionNav from '../components/SectionNav'
import { TickerList } from '../utils/tickerList';
import { TickerSlim } from '../utils/tickerSlim';

export default function AddDataScreen() {

    const dispatch = useDispatch()
    const [companyInfo, setCompanyInfo] = useState(new TickerData({}))
    const [tickerList, setTickerList] = useState(new TickerList())
    const [selectedKey, setSelectedKey] = useState(null)
    const [navigation,setNavigation] = useState({
        selected:{name:'overview',index:0},
        options:['overview','ticker']
    })

    const { tickerList:tickerListData, tickerData, tickerSave } = useSelector(state => state)
    const { tickers } = tickerListData
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

    useEffect(()=>{
        if(tickers){
            let newTickerList = new TickerList(tickers) 
            setTickerList(newTickerList)
        }
    },[tickers])

    useEffect(()=>{
        if(tickerFullData){
            let ticker = new TickerData(tickerFullData)
            ticker.addTickerListData(tickerList)
            // ticker.ratios = tickerList.getTickerRatios(ticker.profile.ticker)
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
                    tickerList={tickerList}
                    selectTicker={selectTicker}    
                />
                <InputActions 
                    companyInfo={companyInfo} 
                    setCompanyInfo={setCompanyInfo}
                    tickerList={tickerList}
                    selectTicker={selectTicker}    
                />
            </div>
            <div className='output'>
                <ControlPanel 
                    navigation={navigation} 
                    setNavigation={setNavigation}
                />
                {navigation.selected.name==='ticker'&&
                    <>
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
                    </>          
                }
                {navigation.selected.name==='overview'&&
                    <Overview tickerList={tickerList} setTickerList={setTickerList}/>
                }
            </div>
        </div>
    )
}

function ControlPanel({navigation,setNavigation}){

    const dispatch = useDispatch()
    const tickerInput = useRef()

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
    
    const addTickerHandler = () => {
        let ticker = tickerInput.current.value
        dispatch(getFinancialsDataFromApi(ticker))
    }

    return(
        <div className='controlPanel'>
            <SectionNav navigation={navigation} setNavigation={setNavigation}/>
            <div>
                {(loading||updateLoading)&&<div>Loading</div>}
                {(error||updateError)&&<div>Error</div>}                
            </div>            
            <div className='addTicker'>
                <label>Add ticker</label>
                <input className={'input'} ref={tickerInput} placeholder={'Type ticker Name...'}/>
                <button className='button light' onClick={addTickerHandler}>Add ticker</button>
            </div>  
            <div className='exhangeRates'>

                {exchangeRate&&
                    <div className='exhangeRate'>
                        <h3>Exhange Rates</h3>
                        <label>Date:</label>
                        <p>{exchangeRate.date}</p>
                        <label>Updated:</label>
                        <p>{parseTimeStamp(exchangeRate.timestamp)}</p>
                    </div>                
                }                
                <button className='button light' onClick={updateExchangeRatesHandler}>Update Exhange rates</button>
            </div>
        </div>
    )
}

function InputActions({ companyInfo, setCompanyInfo, tickerList, selectTicker }){

    const [tickerListSort,setTickerListSort]=useState({
        ready:[],
        notReady:[]        
    })
    const [tickerSort, setTickerSort]=useState({
        selected:'UpdatedAt',
        values:['All','UpdatedAt'],
    })

    const inputRef=useRef()

    useEffect(()=>{
        if(tickerList){

            const { selected } = tickerSort
            let ready = []
            let notReady = []

            switch(selected){
                case 'UpdatedAt':
                    tickerList.tickers.forEach(ticker =>{
                        if(ticker.ratios.pe){
                            ready.push(ticker)
                        }else{
                            notReady.push(ticker)
                        }
                    })                    
                    break
                default: ready = tickerList
            }

            setTickerListSort({ready,notReady})
        }
    },[tickerList,tickerSort])

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
                    {tickerListSort.ready.map(ticker =>
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
                    {tickerListSort.notReady.map(ticker =>
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

    const dispatch = useDispatch()
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
                        <>
                            <button 
                                onClick={e => addRowHandler(selectedKey)}
                                className='tableButton'
                            >
                                Add row
                            </button>
                            {/* <button
                                onClick={e => updateFromApi(selectedKey)}
                                className='tableButton'
                            >
                            UpdateFrom API
                            </button> */}
                        </>
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

    const tickerUpdateRatios = useSelector(state => state.tickerUpdateRatios)
    const { loading, success:updateRatiosSuccess, data:updatedRatioData, error } = tickerUpdateRatios

    const tickerApiPrice = useSelector(state => state.tickerApiPrice)
    const { loading:loadingApiPrice, data:apiPriceData, error:apiPriceError } = tickerApiPrice

    const tickerApiFinancials = useSelector(state => state.tickerApiFinancials)
    const { loading:loadingApiFinancials, data:apiFinancialsData, error:apiFinancialsError } = tickerApiFinancials

    useEffect(()=>{
        if(apiFinancialsData){
            let updatedData = companyInfo.updateFinancialsFromApi(apiFinancialsData)
            setCompanyInfo({...updatedData})
            tickerApiFinancials.apiFinancialsData=false
        }
    },[apiFinancialsData])

    useEffect(()=>{
        if(apiPriceData){
            let updatedData = companyInfo.updatePriceFromApi(apiPriceData)
            setCompanyInfo({...updatedData})
            tickerApiPrice.apiPriceData = null
        }
    },[apiPriceData])

    useEffect(()=>{
        if(updateRatiosSuccess,updatedRatioData){
            let updatedData = companyInfo.updateRatiosFromApi(updatedRatioData.data)
            setCompanyInfo({...updatedData})
            tickerUpdateRatios.success = false
        }
    },[updateRatiosSuccess,updatedRatioData])

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

    function updateRatios(companyInfo,setCompanyInfo){
        let ticker = companyInfo.profile.ticker
        dispatch(updateTickerRatios(ticker))
    }

    const manualUpdateRatios = () => {
        let updatedData = companyInfo.update()
        setCompanyInfo({...updatedData})
    }

    const updateFromApi = (dataName) => {
        let ticker = companyInfo.profile.ticker
        if(companyInfo.profile.country==='Finland') ticker+='.XHEL'
        dispatch(getPriceDataFromApi(ticker))
    }

    const updateFinancials = () => {
        let ticker = companyInfo.profile.ticker
        dispatch(getFinancialsDataFromApi(ticker))
    }

    return(
        <div className='inputInfoHeader'>
            <div className='inputInfoProfile'>
                <div className='inputProfileActions'>
                    <button onClick={updateFromApi} className='tableButton'>
                        Update PriceData
                    </button>      
                    <button className='tableButton' onClick={() => updateRatios(companyInfo,setCompanyInfo)}>
                        Update Ratios
                    </button>
                    <button className='tableButton' onClick={updateFinancials}>
                        Update Financials
                    </button>
                </div>
                {keys.map((item,index) =>
                    <div key={index} className='inputInfoItem'>
                        <label className='itemLabel'>{camelCaseToString(item)}</label>
                        <input value={companyInfo.profile[item]} onChange={e => modifyData(e.target.value,item)}/>
                    </div>                
                )}
            </div>  
            <div className='inputInfoRatios'>                
                <div className='inputRatioActions'>
                    <h3>Ratios</h3>
                    <button
                        onClick={() => manualUpdateRatios(companyInfo,setCompanyInfo)}
                    >Manual update</button>                    
                </div>
                {ratios.map(ratio=>
                    <div key={ratio} className='inputInfoItem'>
                        <label className='itemLabel'>{camelCaseToString(ratio)}</label>
                        <input onChange={e => console.log(e)} value={companyInfo.ratios[ratio]|| ''}/>
                    </div>
                )}

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
                {companyInfo.updateMessages.map((item,index) =>
                    <div 
                    key={index}
                    style={{backgroundColor: item.color}}
                    className='updateMessage'>
                        <label>{item.ticker}</label>
                        <label>{item.time}</label>
                        <p>{camelCaseToString(item.dataName)}</p>
                        <p>{item.text}</p>
                    </div>
                )}                    
            </div>            
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

function Overview({tickerList,setTickerList}){

    const dispatch = useDispatch()
    const [updateStatus, setUpdateStatus] = useState({
        updateRunning:true,
        updateReady:false,
        updatePhase:'Not running',
        currentTicker:null,
        selected:0,
        updated:0,
    })
    const [currentlyUpdating, setCurrentlyUpdating] = useState(null)
    const [tickerTable,setTickerTable] = useState([])
    const [sortOrder,setSortOrder]= useState('ticker')
    const userSignin = useSelector(state => state.userSignin)
    const { userInfo } = userSignin

    useEffect(()=>{
        if(tickerList){
            let sortedTickers = tickerList.sortBy(sortOrder)
            setTickerTable([...sortedTickers])
        }
    },[tickerList,sortOrder])

    const tableHeads = ['ticker','sector','latestPrice']

    const handleUpdatePrices = () => {
        tickerList.updatePrices()
        let updateList = tickerList.tickers.filter(item => item.selected)

        let count = 0
        async function updatePrice(count){
            handleUpdateStatus(tickerList,'Running...',null)
            if(count<updateList.length){

                let tickerSlim = updateList[count]
                handleUpdateStatus(tickerList,'Running...',tickerSlim.ticker)

                const { updatedTickerData } = await tickerSlim.updateTickerPrice(userInfo)

                let updateMessages = updatedTickerData.updateMessages
                tickerList.updateMessages = tickerList.updateMessages.concat(updateMessages)
            
                setTickerList({...tickerList})
                dispatch(saveTicker(updatedTickerData))

                count++
                setTimeout(()=>{
                    updatePrice(count)
                },10000)
            }else{
                handleUpdateStatus(tickerList,'Ready!',null)
            }
        }

        updatePrice(count)
    }

    const selectAllHandler = () => {
        let updated = {...tickerList}
        let newState = !updated.tickers[0].selected
        updated.tickers.forEach(ticker => ticker.selected=newState)
        setTickerList(updated)    
        handleUpdateStatus(updated)    
    }

    const selectTicker = (ticker) => {
        let index = tickerList.tickers.findIndex(item => item.ticker === ticker)
        let updated = {...tickerList}
        updated.tickers[index].selected = !updated.tickers[index].selected
        setTickerList(updated)
        handleUpdateStatus(updated)
    }

    const handleUpdateStatus=(tickerList,updatePhase='Not running',currentTicker=null)=>{
        const selectedTickers = tickerList.tickers.filter(item => item.selected).length
        const updatedTickers = tickerList.tickers.filter(item => item.selected&&item.updatedThisSession).length
        setUpdateStatus({
            ...updateStatus,
            updatePhase,
            currentTicker,
            selected:selectedTickers,
            updated:updatedTickers
        })
    }

    return(
        <div className='overview'>
            <div className='overviewActions'>
                <button onClick={handleUpdatePrices} className='button'>Update Prices</button>
                <button className='button'>Update Ratios</button>
                <button className='button'>Update Financials</button>
                <div className='actionsInfo'>
                    <h2>Selected: {updateStatus.selected}</h2>
                    <h2>Updated: {updateStatus.updated}/{updateStatus.selected}</h2>
                    <h2>Status: {updateStatus.updatePhase}</h2>
                </div>
            </div>
            <div className='overviewContent'>
                <table className='overviewTable'>
                    <thead>
                        <tr>
                        <th onClick={selectAllHandler}>Select All</th>
                        {tableHeads.map(item =>
                            <th 
                                style={{backgroundColor:sortOrder===item&&'lightgreen'}}   
                                onClick={() => setSortOrder(item)}
                            >
                            {camelCaseToString(item)}</th>
                        )}
                        </tr>
                    </thead>
                    <tbody>
                        {tickerTable.map(ticker =>
                            <tr >
                                <td>
                                    <input onChange={() => selectTicker(ticker.ticker)} type='checkbox' checked={ticker.selected}/>                                    
                                </td>
                                <td >{ticker.ticker}</td>
                                <td>{ticker.sector}</td>
                                <td>{ticker.latestPrice&&
                                    <div 
                                        style={{backgroundColor:ticker.ticker===updateStatus.currentTicker && 'lightgreen'}} className='overviewTableCell'
                                    >
                                        <label>Price: </label>
                                        <p>{ticker.latestPrice.close}</p> 
                                        <label>Date: </label>
                                        <p>{convertDate(ticker.latestPrice.date)}</p>
                                    </div>
                                }</td>
                            </tr>
                        )}                           
                    </tbody>
                </table>
                <div className='updateMessages'>
                    {tickerList.updateMessages.map((item,index) =>
                        <div 
                        key={index}
                        style={{backgroundColor: item.color}}
                        className='updateMessage'>
                            <label>{item.ticker}</label>
                            <label>{item.time}</label>
                            <p>{camelCaseToString(item.dataName)}</p>
                            <p>{item.text}</p>
                        </div>
                    )}                    
                </div>                  
            </div>
  
        </div>
    )
}