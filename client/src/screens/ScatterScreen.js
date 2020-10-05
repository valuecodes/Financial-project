import React,{useState,useEffect} from 'react'
import { useSelector } from 'react-redux'
import SectionNav from '../components/SectionNav'
import ScatterPlot from '../utils/scatterPlot'
import {Scatter} from 'react-chartjs-2';
import { camelCaseToString } from '../utils/utils';

export default function ScatterScreen() {

    const [scatterPlot, setScatterPlot] = useState(new ScatterPlot())
    const [navigation,setNavigation] = useState({
        selected:{name:'ticker',index:0},
        options:['overview','ticker']
    })
    const tickerListData = useSelector(state => state.tickerListData)

    useEffect(()=>{
        if(tickerListData.tickers){
            let newScatter = new ScatterPlot(tickerListData.tickers)
            newScatter.init()
            setScatterPlot(newScatter)
        }
    },[tickerListData])

    return (
        <div className='scatterScreen container'>
            {/* <SectionNav navigation={navigation} setNavigation={setNavigation}/> */}
            <ScatterInputs scatterPlot={scatterPlot} setScatterPlot={setScatterPlot}/>
            <ScatterChart scatterPlot={scatterPlot} setScatterPlot={setScatterPlot}/>
        </div>
    )
}


function ScatterInputs({scatterPlot,setScatterPlot}){

    const setOption = (option) => {
        let updated = scatterPlot.setOption(option)
        setScatterPlot({...updated})
    }

    const getStyle=(option)=>{
        let color = ''
        let borderColor=''
        const { y, x } = scatterPlot.selectedRatios
        if(y===option.y&&x===option.x){
            color='rgba(0, 0, 0, 0.2)'
            borderColor='0.2rem solid lightgreen'
        } 
        return{
            backgroundColor:color,
            borderBottom:borderColor
        }
    }

    return(
        <div className='scatterInputs options'>
            <ul>
            {scatterPlot.scatterOptions.map((option,index) =>
                <li 
                    key={index}
                    style={getStyle(option)}
                    onClick={()=>setOption(option)}
                >
                    {camelCaseToString(option.y)} / {camelCaseToString(option.x)}
                </li>
            )}                
            </ul>

        </div>
    )
}


function ScatterChart({scatterPlot,setScatterPlot}){
    
    const selectRatio = (e,axis) => {
        let value = e.target.value
        let updated = scatterPlot.setScatterAxis(value,axis)
        setScatterPlot({...updated})
    }

    return(
        <div className='scatterChart'>
            <div className='yAxis'>
                <select className='scatterSelect' 
                    value={scatterPlot.selectedRatios.y}
                    onChange={(e)=>selectRatio(e,'y')}
                >
                    {scatterPlot.ratios.map(ratio =>
                        <option
                            key={ratio}
                            value={ratio}>
                            {camelCaseToString(ratio)}
                        </option>
                    )}
                </select>
            </div>
            <div>
                <Scatter
                    data={scatterPlot.chartData}
                    options={scatterPlot.chartOptions}
                />
            </div>
            <div className='xAxis'>
                <select className='scatterSelect' 
                    value={scatterPlot.selectedRatios.x}
                    onChange={(e)=>selectRatio(e,'x')}
                >
                    {scatterPlot.ratios.map(ratio =>
                        <option 
                            value={ratio}
                            key={ratio}
                        >
                            {camelCaseToString(ratio)}
                        </option>
                    )}
                </select>
            </div>
        </div>
    )
}