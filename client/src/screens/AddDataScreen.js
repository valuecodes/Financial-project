import React,{ useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import SearchInput from '../components/addDataComponents/SearchInput'
import { getTickerData, saveTicker, deleteTicker, getFinancialsDataFromApi } from '../actions/tickerActions';
import { camelCaseToString, convertDate } from '../utils/utils'
import { updateExhangeRates } from '../actions/exhangeRateActions';
import { TickerData } from '../utils/tickerData';
import { updateTickerRatios } from '../actions/tickerActions';
import SectionNav from '../components/SectionNav'
import { TickerList } from '../utils/tickerList';
import { calculateLatestPrice } from '../utils/calculations/inputCalculations';

export default function AddDataScreen() {

    const dispatch = useDispatch()
    const [companyInfo, setCompanyInfo] = useState(new TickerData({}))
    const [tickerList, setTickerList] = useState(new TickerList())
    const [selectedKey, setSelectedKey] = useState(null)
    const [navigation,setNavigation] = useState({
        selected:{name:'ticker',index:0},
        options:['overview','ticker','other']
    })

    const { tickerListData, tickerData, tickerSave } = useSelector(state => state)
    const { tickers } = tickerListData
    const { loading:tickerLoading, tickerFullData, tickerQuarter, tickerRatios,error:tickerError } = tickerData
    const { loading:saveLoading, success:saveSuccess, ticker:tickerSaved, error:saveError } = tickerSave
    const exhangeRateList = useSelector(state => state.exhangeRateList)
    const { loading, exhangeRate, error } = exhangeRateList

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
        if(tickerFullData&&exhangeRate&&tickerList.tickers.length!==0){
            let ticker = new TickerData(tickerFullData,tickerQuarter,tickerRatios,exhangeRate)
            let tickerSlim = tickerList.getTickerSlim(ticker.profile.ticker)
            ticker.addTickerSlimData(tickerSlim)
            setCompanyInfo(ticker)
        }
    },[tickerFullData,exhangeRate,tickerList])

    function selectTicker(id) {
        dispatch(getTickerData(id))
    }

    return (
        <div className='inputPage'>
            <div>     
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
                    eRate = {exhangeRate}
                />
                {navigation.selected.name==='ticker'&&
                    <>
                    <InputInfoHeader 
                        companyInfo={companyInfo} 
                        setCompanyInfo={setCompanyInfo} 
                        messages={messages}
                        tickerList={tickerList}
                    />
                    <div className='inputInfoButtons'>   
                        <InputInfo dataKey={'incomeStatement'} data={companyInfo} setSelectedKey={setSelectedKey}/>
                        <InputInfo dataKey={'balanceSheet'} data={companyInfo} setSelectedKey={setSelectedKey}/>
                        <InputInfo dataKey={'cashFlow'} data={companyInfo} setSelectedKey={setSelectedKey}/>
                        <InputInfo dataKey={'priceData'} data={companyInfo} setSelectedKey={setSelectedKey}/>
                        <InputInfo dataKey={'dividendData'} data={companyInfo} setSelectedKey={setSelectedKey}/>
                        <InputInfo dataKey={'insiderTrading'} data={companyInfo} setSelectedKey={setSelectedKey}/>
                        <InputInfo dataKey={'quarterData'} data={companyInfo} setSelectedKey={setSelectedKey}/>
                        <InputInfo dataKey={'yearlyData'} data={companyInfo} setSelectedKey={setSelectedKey}/>
                        <InputInfo dataKey={'monthlyPrice'} data={companyInfo} setSelectedKey={setSelectedKey}/>
                        <InputInfo dataKey={'additionalRatios'} data={companyInfo} setSelectedKey={setSelectedKey}/>
                    </div>
                    <Output selectedKey={selectedKey} companyInfo={companyInfo} setCompanyInfo={setCompanyInfo}/>     
                    </>          
                }
                {navigation.selected.name==='overview'&&
                    <Overview tickerList={tickerList} setTickerList={setTickerList} exhangeRate={exhangeRate}/>
                }
                {navigation.selected.name==='other'&&
                    <Other/>
                }
            </div>
        </div>
    )
}

function Other(){

    const handleData=(value)=>{
        console.log(value.split('\n'))
    }

    return(
        <div>
                <textarea 
                    className='financeInput' 
                    type='text' 
                    onChange={e => handleData(e.target.value)}
                    // ref={inputRef}
                    placeholder={'Copy paste text here...'}
                />
        </div>
    )
}

function ControlPanel({navigation,setNavigation,eRate}){

    const dispatch = useDispatch()
    const tickerInput = useRef()

    const [exchangeRate, setExchangeRate]=useState(null)

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
        let date = new Date(timestamp*1000).toISOString()
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
                {(updateLoading)&&<div>Loading</div>}
                {(updateError)&&<div>Error</div>}                
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
        values:['All','UpdatedAt','brand'],
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
                        if(ticker.country){
                            ready.push(ticker)
                        }else{
                            notReady.push(ticker)
                        }
                    })                    
                    break
                case 'brand':
                    tickerList.tickers.forEach(ticker =>{
                        if(ticker.ratios.brand===undefined){
                            notReady.push(ticker)
                        }else{
                            ready.push(ticker)
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
    let { selectedKey2 } =companyInfo
    const dispatch = useDispatch()
    const [table, setTable] = useState({
        headers:[],
        body:[],
        direction:'col'
    })

    useEffect(()=>{
        if(selectedKey){
            if(selectedKey!=='additionalRatios'){
                companyInfo.selectedKey2=null
                selectedKey2=null
            }
            let selectedData = companyInfo.selectDataToTable(selectedKey,selectedKey2)
            setTable({...selectedData})
        }
    },[selectedKey,companyInfo])

    const modifyDataHandler=(newValue,item)=>{
        companyInfo.modifyData(newValue,item)
        setCompanyInfo({...companyInfo})             
    }

    const addRowHandler=(key,key2)=>{
        companyInfo.addRow(key,key2)
        setCompanyInfo({...companyInfo})
    }

    const deleteDataHandler = (row,dataIndex) => {
        if(typeof dataIndex==='number'){
            let index = companyInfo.additionalRatios.findIndex(item => item.name === selectedKey2)
            companyInfo.additionalRatios[index].ratios.splice(dataIndex,1)
        }else{
            companyInfo.deleteRow(row)
            companyInfo.selectedKey2 = null               
        }
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
            case 'period':
                return 'text'
            default: return 'number'
        }
    }

    const deleteAll=(key)=>{
        companyInfo[key]=[]
        companyInfo.selectedKey2 = null
        setCompanyInfo({...companyInfo})
    }

    const handleAddAdditionalRatio = (index) =>{
        companyInfo.selectedKey2 = companyInfo.additionalRatios[index].name
        setCompanyInfo({...companyInfo})
        
    }

    const modifyAdditionalDataHandler = (e,dataIndex,type) =>{
        let { value, name } = e.target
        let index = companyInfo.additionalRatios.findIndex(item => item.name === selectedKey2)
        let inputType = value.split('-').length===3?'date':'value'
        if(inputType==='date') value = new Date(value).toISOString()
        companyInfo.additionalRatios[index].ratios[dataIndex][inputType] = value
        setCompanyInfo({...companyInfo})
    }

    return(
        <div>
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
                            <button onClick={()=>deleteAll(selectedKey)}>Delete All</button>
                            </>
                        }
                        </th>
                        {table.headers.map((item,index) =>
                            <th className='tableHeader' key={index}>
                                {table.direction==='row'&&
                                    <button onClick={e => deleteDataHandler(item)}>X</button>
                                }                        
                            <span>{camelCaseToString(item.value)}</span>
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
                                    name={item.key}
                                    className='inputTableInput' 
                                    value={item.value===null?'':item.value}
                                    type={calculateType(item.key) }
                                />
                            </td>  
                        )}   
                        {selectedKey==='additionalRatios'&&
                            <td>
                                <button onClick={() => handleAddAdditionalRatio(index)}>Add Ratios</button>
                            </td>                   
                        }
                        {table.direction==='col'&&
                            <td>
                                <button onClick={() => deleteDataHandler(row)}>Delete</button>
                            </td>                   
                        }
                    </tr>
                )}                
                </tbody>
            </table>
            {selectedKey2&&selectedKey==='additionalRatios'&&    
            <table>
                <thead>
                    <tr>
                        <th>
                            <>
                                <h3>{camelCaseToString(selectedKey2)}</h3>
                                <button 
                                    onClick={e => addRowHandler(selectedKey,selectedKey2)}
                                    className='tableButton'
                                >
                                    Add row
                                </button>
                            </>
                        </th>
                        {table.headers2.map((item,index) =>
                            <th className='tableHeader' key={index}>
                                <button onClick={e => deleteDataHandler(item,index)}>X</button>
                                <span>{camelCaseToString(item.value)}</span>
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {table.body2.map((row,index) => 
                        <tr key={index}>
                            <td>{camelCaseToString(row.key)}</td>
                            {row.data.map((item,i) =>
                                <td key={i}>
                                    <input
                                        onChange={(e)=>modifyAdditionalDataHandler(e,i,index,calculateType(item.key))}
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
                        </tr>
                    )}                
                </tbody> 
                 
            </table>   }     
        </div>

    )
}

function InputInfoHeader({companyInfo, setCompanyInfo, messages, tickerList}){

    const tickerUpdateRatios = useSelector(state => state.tickerUpdateRatios)
    const { loading, success:updateRatiosSuccess, data:updatedRatioData, error } = tickerUpdateRatios

    const tickerApiFinancials = useSelector(state => state.tickerApiFinancials)
    const { loading:loadingApiFinancials, data:apiFinancialsData, error:apiFinancialsError } = tickerApiFinancials

    const userSignin = useSelector(state => state.userSignin)
    const { userInfo } = userSignin

    useEffect(()=>{
        if(apiFinancialsData){
            let updatedData = companyInfo.updateFinancialsFromApi(apiFinancialsData)
            setCompanyInfo({...updatedData})
            tickerApiFinancials.apiFinancialsData=false
        }
    },[apiFinancialsData])

    useEffect(()=>{
        if(updateRatiosSuccess,updatedRatioData){
            let updatedData = companyInfo.updateRatiosFromApi(updatedRatioData.data)
            setCompanyInfo({...updatedData})
            tickerUpdateRatios.success = false
        }
    },[updateRatiosSuccess,updatedRatioData])
    
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

    const updatePriceFromApi = async (dataName) => {
        let ticker = companyInfo.profile.ticker
        let tickerSlim = tickerList.getTickerSlim(ticker)
        const { updatedTickerData } = await tickerSlim.updateTickerPrice(userInfo)
        setCompanyInfo({...updatedTickerData})
    }

    const updateFinancials = () => {
        let ticker = companyInfo.profile.ticker
        dispatch(getFinancialsDataFromApi(ticker))
    }

    const updateMonthlyYearly = () => {
        let updatedData = companyInfo.updateMonthlyYearly()
        setCompanyInfo({...updatedData})
    }

    const updateLatestPrice=()=>{
        let updated = {...companyInfo}
        updated.latestPrice = calculateLatestPrice(updated)
        setCompanyInfo({...updated})
    }

    const modifyRatio = (e,ratio) => {
        const { value } = e.target
        companyInfo.ratios[ratio] = Number(value)
        setCompanyInfo({...companyInfo})
    }

    return(
        <div className='inputInfoHeader'>
            <div className='inputInfoProfile'>
                <div className='inputProfileActions'>
                    <button onClick={updatePriceFromApi} className='tableButton'>
                        Update PriceData
                    </button>      
                    <button className='tableButton' onClick={() => updateRatios(companyInfo,setCompanyInfo)}>
                        Update Ratios
                    </button>
                    <button className='tableButton' onClick={updateFinancials}>
                        Update Financials
                    </button>
                    <button className='tableButton' onClick={updateMonthlyYearly}>
                        Update MonthlyYearly Data
                    </button>
                </div>
                {keys.map((item,index) =>
                    <div key={index} className='inputInfoItem'>
                        <label className='itemLabel'>{camelCaseToString(item)}</label>
                        <input value={companyInfo.profile[item]} onChange={e => modifyData(e.target.value,item)}/>
                    </div>                
                )}
            </div>  
            <div className='tickerSlimInfo'>                
                <div className='tickerSlimRatios'>
                    <div>
                        <h3>Ratios{companyInfo.ratios.date&&<span>{convertDate(companyInfo.ratios.date)}</span>}
                        </h3>
                        <button
                            className='button'
                            onClick={() => manualUpdateRatios(companyInfo,setCompanyInfo)}
                        >Update</button>                                               
                    </div>
                    <div className='selectedRatios'>
                        {['pe','pb','divYield','payoutRatio','profitMargin','marketCap'].map(ratio=>
                            <div key={ratio} className='inputInfoRatio'>
                                <p className='itemLabel'>{camelCaseToString(ratio)}</p>
                                <p>{companyInfo.ratios[ratio]|| ''}</p>
                            </div>
                        )}     
                        {['brand','esg'].map(ratio=>
                            <div key={ratio} className='inputInfoRatio'>
                                <p className='itemLabel'>{camelCaseToString(ratio)} {companyInfo.ratios[ratio]===null?'+500':''}</p>
                                <input
                                    className='ratioInput'
                                    type='number'
                                    onChange={(e)=>modifyRatio(e,ratio)}
                                    value={companyInfo.ratios[ratio]|| ''}
                                />
                            </div>
                        )}                   
                    </div>
                </div>
                <div className='tickerLatestPrice'>
                    <div>
                        <h3>Latest Price{companyInfo.latestPrice.date&&<span>{convertDate(companyInfo.ratios.date)}</span>}</h3>

                    </div>
                    <div className='latestPrice'>                        
                        <button
                            className='button'
                            onClick={() => updateLatestPrice()}
                        >Update</button>  
                        <div className='inputInfoRatio'>
                            <p className='itemLabel'>Price</p>
                            <p>{companyInfo.latestPrice.close|| ''}</p>
                        </div>
                        <div className='inputInfoRatio'>
                            <p className='itemLabel'>Volume</p>
                            <p>{companyInfo.priceData[0]?companyInfo.priceData[0].volume:''}</p>
                        </div>
                        <div className='inputInfoRatio'>
                            <p className='itemLabel'>Ticker Price</p>
                            <p>{companyInfo.priceData[0]?companyInfo.priceData[0].close:''}</p>
                        </div>
                    </div>
                </div>
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

function Overview({tickerList,setTickerList,exhangeRate}){

    const dispatch = useDispatch()
    const [updateStatus, setUpdateStatus] = useState({
        updateRunning:true,
        updateReady:false,
        updatePhase:'Not running',
        currentTicker:null,
        selected:0,
        updated:0,
    })
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

    const tableHeads = ['ticker','sector','latestPrice','ratios']

    const handleUpdatePrices = () => {

        let updateList = tickerList.tickers.filter(item => item.selected)
        let count = 0
        
        async function updatePrice(count){
            handleUpdateStatus(tickerList,'Running...',null)
            if(count<updateList.length){

                let tickerSlim = updateList[count]
                handleUpdateStatus(tickerList,'Running...',tickerSlim.ticker)

                const { updatedTickerData } = await tickerSlim.updateTickerPrice(userInfo,exhangeRate)

                let updateMessages = updatedTickerData.updateMessages
                tickerList.updateMessages = tickerList.updateMessages.concat(updateMessages)

                let sortedTickers = tickerList.sortBy(sortOrder)
                tickerList.tickers = sortedTickers
                
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
        let sortedTickers = tickerList.sortBy(sortOrder)
        updated.tickers = sortedTickers
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
                        <tr >
                        <th className='inputTd' onClick={selectAllHandler}>Select All</th>
                        {tableHeads.map((item,index) =>
                            <th 
                                key={index}
                                style={{
                                    backgroundColor:sortOrder===item&&'rgba(181, 181, 181)',
                                    color:sortOrder===item&&'var(--primary-color)'
                                }}   
                                onClick={() => setSortOrder(item)}
                            >
                            {camelCaseToString(item)}</th>
                        )}
                        </tr>
                    </thead>
                    <tbody>
                        {tickerTable.map(ticker =>
                            <tr
                                key={ticker.ticker}
                                className={
                                ticker.selected?'rowhighlight':undefined} >
                                <td className='inputTd'>
                                    <input onChange={() => selectTicker(ticker.ticker)} type='checkbox' checked={ticker.selected}/>                                    
                                </td>
                                <td >{ticker.ticker}</td>
                                <td>{ticker.sector}</td>
                                <td>{ticker.latestPrice&&
                                    <div 
                                        style={{backgroundColor:ticker.ticker===updateStatus.currentTicker && 'dimgray'}} className='overviewTableCell'
                                    >
                                        <label>Date: </label>
                                        <p>{convertDate(ticker.latestPrice.date)}</p>
                                        <p>{ticker.latestPrice.close}{' '}$</p> 

                                    </div>
                                }</td>
                                <td>
                                    {ticker.ratios.date&&
                                    <div 
                                        className='overviewTableCell'
                                        style={{backgroundColor:ticker.ticker===updateStatus.currentTicker && 'dimgray'}}     
                                    >
                                        <label>Updated: </label>
                                        <p>{convertDate(ticker.ratios.date)}</p>
                                        <p>PE: {ticker.ratios.pe}</p>    
                                    </div>                                
                                    }

                                </td>
                            </tr>
                        )}                           
                    </tbody>
                </table>
                <div className='updateMessages'>
                    <h3>Update messages</h3>
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