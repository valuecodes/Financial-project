import React,{ useState, useEffect } from 'react'
import SectionNav from '../components/SectionNav'
import MachineLearning from '../utils/machineLearning'
import SearchBox from '../components/SearchBox'
import { useSelector, useDispatch } from 'react-redux'
import { getTickerData } from '../actions/tickerActions';
import { Line } from 'react-chartjs-2';
import { camelCaseToString } from '../utils/utils';

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

    return (
        <div className='page container'>
            <SectionNav navigation={navigation} setNavigation={setNavigation}/>
            <Options machineLearning={machineLearning} setMachineLearning={setMachineLearning}/>
            <Main machineLearning={machineLearning} setMachineLearning={setMachineLearning}/>
        </div>
    )
}

function Options({machineLearning,setMachineLearning}){

    const dispatch = useDispatch()
    const tickerListData = useSelector(state => state.tickerListData)
    const { tickers } = tickerListData
    
    const selectTicker=(ticker)=>{
        dispatch(getTickerData(ticker.ticker))
    }

    const { stage, options } = machineLearning.ml    

    return(
        <div className={'machineLearningOptions'}>
            <SearchBox tickers={tickers} addItem={selectTicker} placeholder={'Select ticker...'}/>
            <h2>{machineLearning.profile.name}</h2>
            <label>Moving Average Weeks</label>
            <input 
                type='number'
                value={options.movingAverageWeeks.value}
                name='movingAverageWeeks'
                onChange={(e)=>handleMLOptionChange(e,machineLearning,setMachineLearning)}
            />
        </div>
    )
}

function Main({machineLearning,setMachineLearning}){

    const handleAddTrainingData = () => {
        let updated = machineLearning.addTraininData()
        setMachineLearning({...updated})
    }

    const handleTrainModel= async () => {
        let updated = await machineLearning.trainModel(setMachineLearning)
        setMachineLearning({...updated})
    }

    const validateModel=()=>{
        let updated = machineLearning.validateModel()
        setMachineLearning({...updated})
    }

    const predictModel = async () => {
        let updated = await machineLearning.predictModel()
        setMachineLearning({...updated})
    }

    const { stage } = machineLearning.ml

    return(
        <div className='machineLearning'>
            <div>
                <h2>{stage}</h2>
                <button disabled={stage!=='Add training Data'} onClick={handleAddTrainingData}>Add Trainin Data</button>
                <button disabled={stage!=='Train model'} onClick={handleTrainModel}>Train model</button>
                <button disabled={stage!=='Validate model'} onClick={validateModel}>Validate model</button>
                <button disabled={stage!=='Make prediction'} onClick={predictModel}>make prediction</button>
                <MachineLearningStats machineLearning={machineLearning} setMachineLearning={setMachineLearning}/>
            </div>
            <div className='chartContainer'>
                <Line
                    data={machineLearning.chart.data}
                    options={machineLearning.chart.options}
                />
            </div>
            <div className='chartContainer predictionChart'>
                <Line
                    data={machineLearning.chart.predictionChart}
                    options={machineLearning.chart.options}
                />
            </div>
        </div>
    )
}

const handleMLOptionChange = (e,state,setState) => {
    const { value, name } = e.target
    state.ml.options[name].value = Number(value)
    setState({...state})
}

function MachineLearningStats({machineLearning, setMachineLearning}){

    const { stage, options } = machineLearning.ml

    return(
        <div className='mlStats'>

            {stage==='Train model'&&
                <ul className='mlTrainingOptions'>
                    {Object.keys(options).map(option =>
                        option!=='movingAverageWeeks'&&
                        <li key={option}>
                            <label>{camelCaseToString(option)}</label>
                            <input 
                                name={option} 
                                type='number' 
                                value={options[option].value||0} 
                                step={options[option].step}
                                onChange={(e)=>handleMLOptionChange(e,machineLearning,setMachineLearning)}
                            />                        
                        </li>                    
                    )}
                </ul>
            }
            {(stage==='Training model...'||stage==='Validate model')&&
                machineLearning.ml.stats.map(stat =>
                    <div key={stat.epoch} className='mlStat'>
                        <p>Epoch: {stat.epoch}/{stat.totalEpochs}</p>
                        <p>Loss: {stat.loss.toFixed(5)}</p>
                    </div>
                )                 
            }
        </div>
    )
}