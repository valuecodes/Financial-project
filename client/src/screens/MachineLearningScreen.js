import React,{ useState, useEffect } from 'react'
import SectionNav from '../components/SectionNav'
import MachineLearning, { createRatio } from '../utils/machineLearning'
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
    const [demoMode,setDemoMode]=useState(false)
    const [machineLearning, setMachineLearning] = useState(new MachineLearning(null))
    const [navigation,setNavigation] = useState({
        selected:{name:'machineLearning',index:0},
        options:['machineLearning']
    })

    useEffect(()=>{
        if(tickerFullData&&macroRatios){
            let newMachineLearning = new MachineLearning(tickerFullData,macroRatios,tickerQuarter)
            let updated = newMachineLearning.init(setMachineLearning)
            setMachineLearning(newMachineLearning)
            if(demoMode){
                newMachineLearning.demoMode(setMachineLearning)
            }
        }
    },[tickerFullData,macroRatios])

    useEffect(()=>{
        dispatch(getMacroData())
    },[])

    return (
        <div className='page container'>
            <SectionNav navigation={navigation} setNavigation={setNavigation}/>
            <div className='machineLearning'>
                <Header machineLearning={machineLearning} setMachineLearning={setMachineLearning} setDemoMode={setDemoMode} demoMode={demoMode}/>
                <Stages machineLearning={machineLearning} setMachineLearning={setMachineLearning}/>
                <TrainingStats machineLearning={machineLearning}/>
                <div className='chartContainer'>
                    <Line
                        data={machineLearning.charts.priceChart}
                        options={machineLearning.charts.options}
                    />
                </div>
                <div className='chartContainerSmall'>
                    <Line
                        data={machineLearning.charts.ratioChart}
                        options={machineLearning.charts.ratiosChartOptions}
                    />
                </div>
            </div>
        </div>
    )
}

function TrainingStats({machineLearning}){
    const { mean, variance, maxDistance, standardDeviation } = machineLearning.ml.stats
    return(
        <ul className='trainingStats'>
            <li>
                <p>Mean</p>
                <h3>{mean.toFixed(2)}</h3>                
            </li>
            <li>
                <p>Variance</p>
                <h3>{variance.toFixed(2)}</h3>
            </li>
            <li>
                <p>Standard Deviation</p>
                <h3>{standardDeviation.toFixed(2)}</h3>
            </li>
            <li>
                <p>Max Distance</p>
                <h3>{maxDistance.toFixed(2)}</h3>
            </li>
        </ul>
    )
}

function Header({machineLearning, setMachineLearning,setDemoMode,demoMode}){
    
    const dispatch = useDispatch()
    const tickerListData = useSelector(state => state.tickerListData)
    const { tickers } = tickerListData

    const selectTicker=(ticker)=>{
        dispatch(getTickerData(ticker.ticker))
    }

    const handleReset=()=>{
        machineLearning.ml.stage=0
        setDemoMode(false)        
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

    const handleQuickStart=()=>{
        selectTicker({ticker:'JNJ'})
        setDemoMode(true)
        machineLearning.ml.stage=0
        machineLearning.ml.stages[0].infoText='Fetching data and creating training set...'
        setMachineLearning({...machineLearning})
    }

    const { stage, stages } = machineLearning.ml    

    return(
        <div className='mlHeader'>
            <div className='mlStagesHeader'>
                <div className='mlStagesHeading'>
                    <h2>{camelCaseToString(stages[stage].name)}</h2>
                    <h2 className='mlTicker'>{machineLearning.profile.ticker}</h2>
                </div>    
                <div>
                    <p>{stages[stage].infoText}
                    </p>               
                </div>     
                {demoMode&&stage<4&&
                    <i className='spinning headerLogo'>
                        <MaterialIcon icon={'LoopIcon'} color={'black'}/>
                    </i> 
                } 
                {stage===0&&!demoMode&&
                    <div className='stageOptions'>
                        <SearchBox tickers={tickers} addItem={selectTicker} placeholder={'Search ticker...'}/>    
                        <button onClick={handleQuickStart} className='button'>Quick Start</button>    
                    </div>
                }                
            </div>  
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
            <div>
                <div className='statHeader'>
                    <h3>Epochs: {stats.currentEpoch}/{options.epochs.value} ({stats.percentage}%)</h3>
                    <h3>Loss: {stats.currentLoss}</h3>
                </div>
                <div className='chartContainer'>
                    <Bar
                        data={machineLearning.charts.lossChart}
                        options={machineLearning.charts.options}
                    />
                </div>                
            </div>
            <div className='selectedMLRatios'>
                <h3>Selected Ratios</h3>
                {machineLearning.ml.selectedRatios.map(ratio =>
                    <label key={ratio.id}>{camelCaseToString(ratio.name)} {ratio.value}</label>
                )}                    
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

    const { stage, options } = machineLearning.ml

    return(
        <div className='mlStages'>  
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
                {stage===1&& 
                    machineLearning.ml.inputCategories.map(categoryName=>
                        <SelectRatio 
                            key={categoryName}
                            machineLearning={machineLearning} 
                            setMachineLearning={setMachineLearning} 
                            categoryName={categoryName}
                        />                
                    )
                }             
            </div>
        </div>
    )
}


function SelectRatio({machineLearning,setMachineLearning,categoryName}){

    const category = categoryName.slice(0,-1)

    const [groups,setGroups] = useState({})

    useEffect(()=>{
        let newGroups={}

        machineLearning.analytics[categoryName].forEach(item => {
            let group=item.split('_')[0]
            if(item.split('_')[1]==='trailing'){
                group=item.split('_')[0]+item.split('_')[1]
            }         
            if(newGroups[group]){
                newGroups[group].push(item)
            }else{
                newGroups[group]=[item]
            }
        })

        setGroups(newGroups)
    },[])

    const handleAddRatio = (ratio,category) => {
        let found = machineLearning.ml.selectedRatios.findIndex(item =>item.name===ratio)
        if(found>=0){
            machineLearning.ml.selectedRatios.splice(found,1)
        }else{
            let newRatio = createRatio(ratio,category)
            machineLearning.ml.selectedRatios.push(newRatio)
        }
        setMachineLearning({...machineLearning})   
    }

    const handleAddRatios = (categoryName,category) => {
        const ratioNames = machineLearning.analytics[categoryName]
        ratioNames.forEach(ratio => handleAddRatio(ratio,category)) 
    }

    const parseName=(ratio)=>{
        let array = ratio.split('_')
        if(array[1]==='quarter') return camelCaseToString(array[0])
        if(array[1]==='trailing') return camelCaseToString(array[1])
        let text = camelCaseToString(ratio.split('_')[1]||ratio)
        return text
    }

    return(
        <div className='ratioCategory'>
            <div className='ratioCategoryHeader'>
                <h3>{camelCaseToString(categoryName)}</h3>
                <button onClick={()=>handleAddRatios(categoryName,category)}>Add category</button> 
            </div>
            <div className='ratioCategoryOptions'>
                {Object.keys(groups).map(group=>
                    <div key={group} className='ratioGroup'>
                        {groups[group].map((ratio,index) => 
                            <button 
                                style={{
                                    color:machineLearning.ml.selectedRatios.find(item =>item.name===ratio)&&'lightgreen',
                                    width:index===0?!['priceRatios','macroRatios'].includes(categoryName)?'20rem':'8rem':'auto'
                                }}
                                key={ratio} 
                                className='button small' 
                                onClick={()=>handleAddRatio(ratio,category)}
                            >
                                {parseName(ratio)}
                            </button>                
                        )}                    
                    </div>
                )}
            </div>
        </div>
    )
}