import React,{ useState, useEffect } from 'react'
import SectionNav from '../components/SectionNav'
import MachineLearning from '../utils/machineLearning'
import SearchBox from '../components/SearchBox'
import { useSelector, useDispatch } from 'react-redux'
import { getTickerData } from '../actions/tickerActions';
import { Line, Bar } from 'react-chartjs-2';
import { camelCaseToString, uuidv4 } from '../utils/utils';
import MaterialIcon from '../components/MaterialIcon'
import { getMacroData } from '../actions/macroActions';

export default function MachineLearningScreen() {

    const dispatch = useDispatch()
    const tickerData = useSelector(state => state.tickerData)
    const { loading, tickerFullData, tickerQuarter, error } = tickerData
    const macroData = useSelector(state => state.macroData)
    const { loading:loadingMacro, data:macroRatios, error:errorMacro } = macroData
    
    const [machineLearning, setMachineLearning] = useState(new MachineLearning(null))
    const [navigation,setNavigation] = useState({
        selected:{name:'machineLearning',index:0},
        options:['machineLearning']
    })

    useEffect(()=>{
        if(tickerFullData&&macroRatios){
            let newMachineLearning = new MachineLearning(tickerFullData,macroRatios,tickerQuarter)
            let updated = newMachineLearning.init()
            setMachineLearning(newMachineLearning)
        }
    },[tickerFullData,macroRatios])

    useEffect(()=>{
        dispatch(getMacroData())
    },[])

    const { stage } = machineLearning.ml

    return (
        <div className='page container'>
            <SectionNav navigation={navigation} setNavigation={setNavigation}/>
            <div className='machineLearning'>
                <Header machineLearning={machineLearning} setMachineLearning={setMachineLearning}/>
                <Stages machineLearning={machineLearning} setMachineLearning={setMachineLearning}/>
                <div className='chartContainer'>
                    <Line
                        data={machineLearning.chart.priceChart}
                        options={machineLearning.chart.options}
                    />
                </div>
                <div className='chartContainerSmall'>
                    <Line
                        data={machineLearning.chart.ratioChart}
                        options={machineLearning.chart.ratiosChartOptions}
                    />
                </div>
                <div className='chartContainer predictionChart'>
                    <Line
                        data={machineLearning.chart.predictionChart}
                        options={machineLearning.chart.options}
                    />
                </div>
            </div>
        </div>
    )
}

function Header({machineLearning, setMachineLearning}){
    
    const dispatch = useDispatch()
    const tickerListData = useSelector(state => state.tickerListData)
    const { tickers } = tickerListData

    const selectTicker=(ticker)=>{
        dispatch(getTickerData(ticker.ticker))
    }

    const handleReset=()=>{
        machineLearning.ml.stage=0
        setMachineLearning({...machineLearning})
    }

    const handleStageChange = async (newStage)=>{
        let updated
        switch(newStage){
            case 'addTrainingData':
                updated = machineLearning.addTraininData()
                break
            case 'trainModel':
                updated = await machineLearning.trainModel(setMachineLearning)
                break
            case 'validateModel':
                updated = machineLearning.validateModel()
                break
            case 'makePrediction':
                updated = await machineLearning.predictModel()
                break
            default:return
        }
        setMachineLearning({...updated})
    }

    const { stage,stages, options } = machineLearning.ml    

    return(
        <div className='mlHeader'>
            {stage===0?
                <SearchBox tickers={tickers} addItem={selectTicker} placeholder={'Select ticker...'}/>:
                <div className='stageHeader'>
                    <h2 className='mlTicker'>{machineLearning.profile.ticker}</h2>
                </div>
            }
            <div className='stages'>
                {stages.map(item => 
                    <button 
                        key={item.name}
                        disabled={item.number!==stage} 
                        className={`stage button ${item.number===stage?'active':''}`} 
                        onClick={()=>handleStageChange(item.name)}
                    >
                        <p>{camelCaseToString(item.name)}</p>
                        <i className={(item.number===stage&&item.spinning)?'spinning':''}>
                            <MaterialIcon icon={item.icon} color={item.number===stage?'lightGreen':''}/>
                        </i> 
                    </button>
                )}
                <button className='stage button errorMessage' onClick={handleReset}>
                    <p>Reset</p>
                    <MaterialIcon icon={'SettingsBackupRestoreIcon'}/>
                </button>
            </div>
        </div>
    )
}

function TrainingStatistics({machineLearning}){
    const { options, stats } = machineLearning.ml
    return(
        <div>
            <div className='selectedMLRatios'>
                <h3>Selected Ratios</h3>
                {machineLearning.ml.selectedRatios.map(ratio =>
                    <label key={ratio.id}>{camelCaseToString(ratio.name)} {ratio.value}</label>
                )}                    
            </div>
            <div>
                <div className='statHeader'>
                    <h3>Epochs: {stats.currentEpoch}/{options.epochs.value} ({stats.percentage}%)</h3>
                    <h3>Loss: {stats.currentLoss}</h3>
                </div>
                <div className='chartContainer'>
                    <Bar
                        data={machineLearning.chart.lossChart}
                        options={machineLearning.chart.options}
                    />
                </div>                
            </div>

        </div>
    )
}

function Stages({machineLearning, setMachineLearning}){

    const handleMLOptionChange = (e,state,setState) => {
        const { value, name } = e.target
        state.ml.options[name].value = Number(value)
        setState({...state})
    }

    const { stage,stages, options } = machineLearning.ml

    return(
        <div className='mlStages'>                
            <h2>{camelCaseToString(stages[stage].name)}</h2>
            <div className='mlStats'>
                {stage>=3 &&
                    <TrainingStatistics machineLearning={machineLearning}/>
                }                  
                {(stage===1||stage===2)&&
                    <ul className='mlTrainingOptions'>
                        {Object.keys(options).map(option =>
                            options[option].stage===stage&&
                            <li key={option}>
                                <label>{camelCaseToString(option)}</label>
                                <input 
                                    name={option} 
                                    type='range' 
                                    min={0}
                                    max={options[option].max}
                                    value={options[option].value||0} 
                                    step={options[option].step}
                                    onChange={(e)=>handleMLOptionChange(e,machineLearning,setMachineLearning)}
                                />       
                                <h3>{options[option].value||0}</h3>  
                            </li>                    
                        )}
                    </ul>
                }
                {stage===1&&<MLRAtios machineLearning={machineLearning} setMachineLearning={setMachineLearning}/>}             
            </div>
        </div>
    )
}

function MLRAtios({ machineLearning, setMachineLearning }){

    const handleAddPriceRatio=(ratio)=>{
        const selectedRatio={...ratio}
        selectedRatio.id = uuidv4()
        machineLearning.ml.selectedRatios.push(selectedRatio)
        setMachineLearning({...machineLearning})
    }

    const handleAddFinancialRatio=(ratio,category,normalize)=>{
        let found = machineLearning.ml.selectedRatios.findIndex(item =>item.name===ratio)
        if(found>=0){
            machineLearning.ml.selectedRatios.splice(found,1)
        }else{
            addFinancialRatio(ratio,category,normalize)
        }
        setMachineLearning({...machineLearning})
    }

    const addFinancialRatio=(ratio,category,normalize=true)=>{
        let newRatio={
            name:ratio,
            category:category,
            chart:'ratioChart',
            normalize,
            id:uuidv4(),
            values:[]
        }
        machineLearning.ml.selectedRatios.push(newRatio)
    }

    const handleAddCategory=(category)=>{
        let categoryNames = machineLearning.analytics.financialCategories[category]
        let firstItem = categoryNames[0]
        let firstIncludes = machineLearning.ml.selectedRatios.findIndex(item => item.name === firstItem) 
        machineLearning.ml.selectedRatios =  machineLearning.ml.selectedRatios
            .filter(item => !categoryNames.includes(item.name))
        if(firstIncludes===-1){
            categoryNames.forEach(item => addFinancialRatio(item))
        }
        setMachineLearning({...machineLearning})
    }

    const handleRemoveRatio=(ratio)=>{
        let { selectedRatios } = machineLearning.ml
        selectedRatios = selectedRatios.filter(item => item.id!==ratio.id)
        machineLearning.ml.selectedRatios = selectedRatios
        setMachineLearning({...machineLearning})        
    }

    const handleMLRatioChange=(e)=>{
        const { value,name } = e.target
        let selectedIndex =  machineLearning.ml.selectedRatios.findIndex(item => item.id===name)
        machineLearning.ml.selectedRatios[selectedIndex].value = Number(value)
        setMachineLearning({...machineLearning})
    }

    const handleAddQuarterRatios=()=>{
        const { quarterRatios } = machineLearning.analytics
        quarterRatios.forEach(ratio => handleAddFinancialRatio(ratio,'quarterRatio'))
        setMachineLearning({...machineLearning})        
    }

    return(
        <>
            <div>
                <h3>Add Price ratios</h3>
                <div className='addMLRatios'>
                    {machineLearning.ml.priceRatios.map(ratio =>
                        <button 
                            style={{color:machineLearning.ml.selectedRatios.find(item =>item.name===ratio.name)&&'lightgreen'}}
                            key={ratio.name} 
                            className='button small' 
                            onClick={()=>handleAddPriceRatio(ratio)
                        }>
                            {camelCaseToString(ratio.name)}
                        </button>
                    )}                    
                </div>
                <h3>Add Macro ratios</h3>
                {machineLearning.analytics.macroRatios.map(ratio =>
                        <button 
                            style={{color:machineLearning.ml.selectedRatios.find(item =>item.name===ratio)&&'lightgreen'}}
                            key={ratio} 
                            className='button small' 
                            onClick={()=>handleAddFinancialRatio(ratio,'macroRatio')
                        }>
                            {camelCaseToString(ratio)}
                        </button>
                )}                    
                <h3>Add quarter data</h3>
                    <button onClick={handleAddQuarterRatios}>Add All</button>    
                    {machineLearning.analytics.quarterRatios.map(ratio =>
                                <button 
                                style={{color:machineLearning.ml.selectedRatios.find(item =>item.name===ratio)&&'lightgreen'}}
                                key={ratio} 
                                className='button small' 
                                onClick={()=>handleAddFinancialRatio(ratio,'quarterRatio')
                            }>
                                {camelCaseToString(ratio)}
                            </button>
                    )}
                <div>Add financials</div>
                {Object.keys(machineLearning.analytics.financialCategories).map(category => 
                    <div key={category}>
                        <div className='financialCategoryHeader'>
                            <h3>{camelCaseToString(category)}</h3>
                            <button onClick={()=>handleAddCategory(category)}>Add All</button>                            
                        </div>
                        <div>
                            {machineLearning.analytics.financialCategories[category].map(item => 
                                <button
                                    style={{color:machineLearning.ml.selectedRatios.find(i =>i.name===item)&&'lightgreen'}}
                                    className={`button small`}
                                    key={item} 
                                    onClick={()=>handleAddFinancialRatio(item,'financialRatio')}
                                >
                                    {item}
                                </button>
                            )}                            
                        </div>
                    </div>
                )}
            </div>
            <div>
                <h3>Selected Ratios</h3>
                <ul className='mlTrainingOptions'>
                    {machineLearning.ml.selectedRatios.map(ratio =>
                        <li key={ratio.id}>
                            <p>{camelCaseToString(ratio.name)}</p>
                            <div className='ratioOption'>
                                {ratio.value&&
                                    <>
                                        <input
                                            type='range'
                                            value={ratio.value}
                                            name={ratio.id}
                                            onChange={(e)=>handleMLRatioChange(e)}
                                        />
                                        <h3>{ratio.value||0}</h3>  
                                    </> 
                                }
                            </div>
                            <button onClick={()=>handleRemoveRatio(ratio)}>X</button>
                        </li>
                    )}                    
                </ul>
            </div>
        </>
    )
}