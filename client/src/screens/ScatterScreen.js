import React,{useState,useEffect} from 'react'
import { useSelector } from 'react-redux'
import SectionNav from '../components/SectionNav'
import ScatterPlot from '../utils/scatterPlot'
import {Scatter} from 'react-chartjs-2';
import { camelCaseToString } from '../utils/utils';

export default function ScatterScreen() {

    const [scatterPlot, setScatterPlot] = useState(new ScatterPlot())
    const [navigation,setNavigation] = useState({
        selected:{name:'scatter',index:0},
        options:['scatter']
    })
    const tickerListData = useSelector(state => state.tickerListData)
    const portfolioSelected = useSelector(state => state.portfolioSelected)
    const { selectedPortfolio } = portfolioSelected

    useEffect(()=>{
        if(tickerListData.tickers&&selectedPortfolio){
            let newScatter = new ScatterPlot(tickerListData.tickers,selectedPortfolio)
            newScatter.init()
            setScatterPlot(newScatter)
        }
    },[tickerListData,selectedPortfolio])

    return (
        <div className='scatterScreen container'>
            {/* <SectionNav navigation={navigation} setNavigation={setNavigation}/> */}
            <ScatterInputs scatterPlot={scatterPlot} setScatterPlot={setScatterPlot}/>
            <ScatterChart scatterPlot={scatterPlot} setScatterPlot={setScatterPlot}/>
        </div>
    )
}


function ScatterInputs({scatterPlot, setScatterPlot}){

    const setOption = (option) => {
        let updated = scatterPlot.setOption(option)
        setScatterPlot({...updated})
    }

    const setFilter = (newValue) => {
        let updated = scatterPlot.filterValue(newValue)
        setScatterPlot({...updated})
    }

    const selectAll = (filterName) => {
        let updated = scatterPlot.filterSelectAll(filterName)
        setScatterPlot({...updated})        
    }

    const setHighlight = (e) => {
        let value = e.target.value
        let updated = scatterPlot.setHighlight(value)
        setScatterPlot({...updated})   
    }

    const setHighlighColor = (e) => {
        let value = e.target.value
        let updated = scatterPlot.setHighlightColor(value)
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

    const tickersFoundStyle = (count) =>{
        let color = 'rgba(0, 255, 128, 0.473)'
        if(count===0) color = 'rgba(255, 0, 0, 0.473)'
        if(count===0&&scatterPlot.tickers.length===0) color = 'rgba(239, 255, 22, 0.801)'
        return {backgroundColor:color}
    }
    const { scatterOptions, sectors, countries, filterTotals } = scatterPlot
    let tickersFound = scatterPlot.chartData.labels&&scatterPlot.chartData.labels.length

    return(
        <div className='scatterInputs'>

            <div className='options'>
                <ul>
                {scatterOptions.map((option,index) =>
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
            <div className='scatterTickers' style={tickersFoundStyle(tickersFound)}>
                <h3>Tickers found: </h3>
                <label>{tickersFound}</label>
            </div>    
            <div className='scatterFilters'
            >            

                <div className='scatterFilter'>
                    <div className='filterHeader'>
                        <h3>Countries </h3>  
                        <label>{`${filterTotals.countriesSelected} / ${filterTotals.countries}`}</label>    
                    </div>
                    <button onClick={()=>selectAll('countries')}>Select All</button>
                    {Object.keys(countries).map(country =>
                        <div
                            style={{backgroundColor:countries[country].selected&&'rgb(177, 177, 177)'}}      
                            key={country} 
                            className='scatterFilterInput'
                        >
                            <input 
                                onChange={()=>setFilter(countries[country])}
                                type='checkbox' checked={countries[country].selected}
                            />
                            <label>{country}</label>
                            <p>{countries[country].count}</p>
                        </div>
                    )}                      
                </div>
                <div className='scatterFilter'>
                    <div className='filterHeader'>
                        <h3>Sectors </h3>  
                        <label>{`${filterTotals.sectorsSelected} / ${filterTotals.sectors}`}</label>    
                    </div>
                    <button onClick={()=>selectAll('sectors')}>Select All</button>
                    {Object.keys(sectors).map(sector =>
                        <div
                            style={{backgroundColor:sectors[sector].selected&&'rgb(177, 177, 177)'}} 
                            key={sector} 
                            className='scatterFilterInput'
                        >
                            <input 
                                onChange={()=>setFilter(sectors[sector])}
                                type='checkbox' checked={sectors[sector].selected}
                            >
                            </input>
                            <label>{sector}</label>
                            <p>{sectors[sector].count}</p>
                        </div>
                    )}                         
                </div>
            </div>        
            <div className='scatterHighlight'>
                <h3>Highlight</h3>
                <select
                    onChange={(e)=>setHighlight(e)}
                >

                    <option
                    value={"My Portfolio.My Portfolio"}
                    >My Portfolio</option>
                    {Object.keys(sectors).map(sector =>
                        <option value={sectors[sector].filterName+'.'+sector}>{sector}</option>
                    )}
                    {Object.keys(countries).map(country =>
                        <option value={countries[country].filterName+'.'+country}>{country}</option>
                    )}                    
                    <option
                        value={"None"}
                    >None</option>
                </select>
                <input 
                    type='color' 
                    onChange={(e)=>setHighlighColor(e)} 
                    value={scatterPlot.highlightColor}
                />
            </div>

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
            <div className='chartContainer'>
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