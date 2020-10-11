import React,{useState,useEffect} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import SectionNav from '../components/SectionNav'
import ScatterPlot from '../utils/scatterPlot'
import {Scatter} from 'react-chartjs-2';
import { camelCaseToString } from '../utils/utils';
import SelectGroup from '../components/SelectGroup'
import TickersFound from '../components/TickersFound'
import OptionsBar from '../components/OptionsBar'
import DropdownListFilter from '../components/DropdownListFilter'
import { getTickerRatiosData } from '../actions/tickerActions';

export default function ScatterScreen() {

    const dispatch = useDispatch()
    const [scatterPlot, setScatterPlot] = useState(new ScatterPlot())
    const [navigation,setNavigation] = useState({
        selected:{name:'scatter',index:0},
        options:['scatter','historicalScatter']
    })
    const tickerListData = useSelector(state => state.tickerListData)
    const portfolioSelected = useSelector(state => state.portfolioSelected)
    const { selectedPortfolio } = portfolioSelected
    const tickerRatios = useSelector(state => state.tickerRatios)
    const { loading, tickerRatiosData, error } = tickerRatios

    useEffect(()=>{
        if(tickerListData.tickers&&selectedPortfolio){
            let newScatter = new ScatterPlot(tickerListData.tickers,tickerRatiosData,selectedPortfolio)
            newScatter.init()
            setScatterPlot(newScatter)
        }
    },[tickerListData,tickerRatiosData,selectedPortfolio])

    useEffect(()=>{
        if(
            scatterPlot.tickerRatios.length===0&&
            navigation.selected.index ===1
        ){
            dispatch(getTickerRatiosData())
        }
        let currentPage = navigation.selected.name
        if(currentPage ==='scatter'){
            scatterPlot.historical=false
        }else{
            scatterPlot.historical=true
        }
    },[navigation])

    return (
        <div className='scatterScreen container'>
            <SectionNav navigation={navigation} setNavigation={setNavigation}/>
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

    const setHighlight = (value) => {
        let updated = scatterPlot.setHighlight(value)
        setScatterPlot({...updated})   
    }

    const setHighlighColor = (e) => {
        let value = e.target.value
        let updated = scatterPlot.setHighlightColor(value)
        setScatterPlot({...updated})   
    } 

    const { 
        scatterOptions, 
        sectors, 
        countries, 
        filterTotals, 
        chartData, 
        tickers,
        selectedRatios
    } = scatterPlot

    let tickersFound = chartData.labels&&chartData.labels.length

    return(
        <div className='scatterInputs'>
            <OptionsBar 
                options={scatterOptions} 
                selected={selectedRatios} 
                format={'y/x'} 
                selectOption={setOption}
            />
            <TickersFound 
                tickersFound={tickersFound} 
                total={tickers.length}
                className={'tickersFoundSmall'}
            />
            <div className='scatterFilters'>            
                <DropdownListFilter
                    header={'countries'}
                    label={`${filterTotals.countriesSelected} / ${filterTotals.countries}`}
                    listData={countries}
                    setFilter={setFilter}
                    selectAll={selectAll}
                />
                <DropdownListFilter
                    header={'sectors'}
                    label={`${filterTotals.sectorsSelected} / ${filterTotals.sectors}`}
                    listData={sectors}
                    setFilter={setFilter}
                    selectAll={selectAll}
                />
            </div>        
            <div className='scatterHighlight'>
                <h3>Highlight</h3>
                <SelectGroup
                    data={[
                        {optgroup:'myPortfolio',options:["myPortfolio"]},
                        {optgroup:'sectors',options:Object.keys(sectors)},
                        {optgroup:'countries',options:Object.keys(countries)},
                        {optgroup:'none',options:['none']}
                    ]}
                    selected={scatterPlot.highlight}
                    selectValue={setHighlight}
                    className={'selectMedium'}
                    addOptgroup={true}
                />
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
    
    const selectRatio = (value,axis) => {
        let updated = scatterPlot.setScatterAxis(value,axis)
        setScatterPlot({...updated})
    }

    return(
        <div className='scatterChart'>
            <div className='yAxis'>
                <SelectGroup 
                    data={[{ optgroup:'Select value', options:scatterPlot.ratios}]}
                    selected={scatterPlot.selectedRatios.y}
                    selectValue={selectRatio}
                    className={'selectBig'}
                    selectKey={'y'}
                />
            </div>
            <div className='chartContainer'>
                <Scatter
                    data={scatterPlot.chartData}
                    options={scatterPlot.chartOptions}
                />
            </div>
            <div className='xAxis'>
                <SelectGroup
                    data={[{optgroup:'Select value',options:scatterPlot.ratios}]}
                    selected={scatterPlot.selectedRatios.x}
                    selectValue={selectRatio}
                    className={'selectBig'}
                    selectKey={'x'}
                />
            </div>
        </div>
    )
}
