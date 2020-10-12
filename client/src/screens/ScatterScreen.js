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
            scatterPlot.tickerRatios.length === 0&&
            navigation.selected.index === 1
        ){
            dispatch(getTickerRatiosData())
        }
        let historical = navigation.selected.name==='historicalScatter'
        let updated = scatterPlot.changeMode(historical)
        setScatterPlot({...updated})      
    },[navigation])

    const setOption = (option) => {
        let updated = scatterPlot.setOption(option)
        setScatterPlot({...updated})
    }

    const { scatterOptions, selectedRatios } = scatterPlot
    console.log(scatterPlot)
    return (
        <div className='scatterScreen container'>
            <SectionNav navigation={navigation} setNavigation={setNavigation}/>   
            <OptionsBar 
                options={scatterOptions} 
                selected={selectedRatios} 
                format={'y/x'} 
                selectOption={setOption}
            />
            <ScatterInputs 
                scatterPlot={scatterPlot} 
                setScatterPlot={setScatterPlot}
                navigation={navigation}
            />
            <ScatterChart scatterPlot={scatterPlot} setScatterPlot={setScatterPlot}/> 
        </div>
    )
}


function ScatterInputs({scatterPlot, setScatterPlot, navigation}){

    const { tickers, chartData } = scatterPlot
    const { index } = navigation.selected
    let tickersFound = chartData.labels&&chartData.labels.length

    return(
        <div className='scatterInputs'>
            <TickersFound 
                tickersFound={tickersFound} 
                total={tickers.length}
                showTotal={true}
                className={'tickersFoundSmall'}
            />
            {navigation.selected.index===0 &&
                <ScatterFilters 
                    scatterPlot={scatterPlot} 
                    setScatterPlot={setScatterPlot} 
                />             
            }
            {navigation.selected.index===1 &&
                <ScatterHistoricalFilters 
                    scatterPlot={scatterPlot} 
                    setScatterPlot={setScatterPlot}
                />            
            }
        </div>
    )
}

function ScatterFilters({scatterPlot, setScatterPlot}){    

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
        sectors, 
        countries, 
        filterTotals, 
        chartData, 
        tickers,
    } = scatterPlot
    
    return(
        <div className='scatterFilterSection'>
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

function ScatterHistoricalFilters({scatterPlot, setScatterPlot}){

    const { category, selectedTickers } = scatterPlot.filterTickers

    const setCategory = (category) => {
        scatterPlot.filterTicker.category = category
        setScatterPlot({...scatterPlot,filterTickers:{...scatterPlot.filterTickers,category:category}})
    }

    const filterTicker = (ticker) =>{
        let updated = scatterPlot.filterTicker(ticker)
        setScatterPlot({...updated})
    }

    return (
        <div className='scatterFilterSection'>
            <div className='tickerCategoriesContainer'>
                <div className='tickerCategories'>
                    <div className='tickerCategoriesHeader'>
                        <h3>Category: </h3>
                        <button 
                            style={{backgroundColor:category==='sectors'&&'lightgreen'}}
                            onClick={() => setCategory('sectors')}
                        >Sectors</button>
                        <button 
                            style={{backgroundColor:category==='countries'&&'lightgreen'}}
                            onClick={() => setCategory('countries')}
                        >Countries</button>
                        <div className='tickerCategoriesSelected'>
                            <h3>Selected: </h3>
                            {selectedTickers.map(ticker =>
                                <button
                                    style={{backgroundColor:'lightgreen'}}
                                    onClick={() => filterTicker(ticker)}
                                >{ticker}</button>
                            )}
                        </div>
                    </div>                
                    {Object.keys(scatterPlot[category]).map(item =>
                        <div className='tickerCategory'>
                            <h4>{item}</h4>
                            <div className='categoryTickers'>
                                {scatterPlot[category][item].tickers.map(item =>
                                    <button
                                        style={{backgroundColor:selectedTickers.includes(item.ticker)&&'lightgreen'}}
                                        onClick={() => filterTicker(item.ticker)}
                                    >{item.ticker}</button>
                                )}
                            </div>
                        </div>
                    )}                
                </div>                
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
