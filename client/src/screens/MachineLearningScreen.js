import React,{ useState, useEffect } from 'react'
import SectionNav from '../components/SectionNav'
import MachineLearning from '../utils/machineLearning'
import SearchBox from '../components/SearchBox'
import { useSelector, useDispatch } from 'react-redux'
import { getTickerData } from '../actions/tickerActions';
import { Line } from 'react-chartjs-2';

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
            <Options machineLearning={machineLearning}/>
            <Main machineLearning={machineLearning}/>
        </div>
    )
}

function Options({machineLearning}){

    const dispatch = useDispatch()
    const tickerListData = useSelector(state => state.tickerListData)
    const { tickers } = tickerListData
    
    const selectTicker=(ticker)=>{
        dispatch(getTickerData(ticker.ticker))
    }

    return(
        <div className={'machineLearningOptions'}>
            <SearchBox tickers={tickers} addItem={selectTicker} placeholder={'Select ticker...'}/>
            <h2>{machineLearning.profile.name}</h2>
        </div>
    )
}

function Main({machineLearning}){
    return(
        <div className='machineLearning'>
            <div></div>
            <div className='chartContainer'>
                <Line
                    data={machineLearning.chart.data}
                    options={machineLearning.chart.options}
                />
            </div>
        </div>
    )
}