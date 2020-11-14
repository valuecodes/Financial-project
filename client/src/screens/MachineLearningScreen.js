import React,{ useState, useEffect } from 'react'
import SectionNav from '../components/SectionNav'
import MachineLearning from '../utils/machineLearning'
import SearchBox from '../components/SearchBox'
import { useSelector, useDispatch } from 'react-redux'
import { getTickerData } from '../actions/tickerActions';
import { Line, Bar } from 'react-chartjs-2';
import { camelCaseToString, uuidv4 } from '../utils/utils';
import MaterialIcon from '../components/MaterialIcon'

export default function MachineLearningScreen() {

    const tickerData = useSelector(state => state.tickerData)
    const { loading, tickerFullData, error } = tickerData
    
    const [machineLearning, setMachineLearning] = useState(new MachineLearning(null))
    const [navigation,setNavigation] = useState({
        selected:{name:'scatter',index:0},
        options:['scatter','historicalScatter']
    })

    useEffect(()=>{
        if(tickerFullData){
            let newMachineLearning = new MachineLearning(tickerFullData)
            let updated = newMachineLearning.init()
            setMachineLearning(newMachineLearning)
        }
    },[tickerFullData])

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
                {stage===2&&
                    <ul className='mlTrainingOptions'>
                        {Object.keys(options).map(option =>
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

    const handleAddRatio=(ratio)=>{
        const selectedRatio={...ratio}
        selectedRatio.id = uuidv4()
        machineLearning.ml.selectedRatios.push(selectedRatio)
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

    return(
        <>
            <div>
                <h3>Add ratios</h3>
                <div className='addMLRatios'>
                    {machineLearning.ml.ratios.map(ratio =>
                        <button key={ratio.name} className='button small' onClick={()=>handleAddRatio(ratio)}>{camelCaseToString(ratio.name)}</button>
                    )}                    
                </div>
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