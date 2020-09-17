import React,{ useEffect,useState } from 'react'
import { Line } from 'react-chartjs-2';
import { datasetKeyProvider } from '../../utils/utils';
import { calculatePriceChart } from '../../utils/chart';
import { portfolioChartOptions } from '../../utils/chartOptions'
import Options from '../Options'

export default function PortfolioChart({portfolio,navigation}) {

    const [options,setOptions]=useState({
        selected:'',
        options:[],
        time:{
            timeValue:'20.years-years',
            timeStart:new Date().getFullYear(),
            timeEnd:new Date().getFullYear(),            
        },
    })
    
    const [chart, setChart] = useState({
        type: 'line',
        datasets:[
            {
                data:[]
            }
        ],
        labels: [],
    })

    useEffect(()=>{

        if(portfolio){
            let chartComponents = portfolio.priceChart(options)
            let chartData = calculatePriceChart(chartComponents,options)
            setChart(chartData)
        }
        
    },[portfolio,options])

    return (
        <div className='section'>
            <Options options={options} setOptions={setOptions}/>   
            <div className='portfolioChart'>
                <div className='chartContainer'>
                    {navigation.selected.name==='priceChart'&&
                    <Line
                        id='canvas'
                        datasetKeyProvider={datasetKeyProvider}
                        data={chart}
                        options={portfolioChartOptions()}
                    />}                  
                </div>
            </div>     
        </div>


    )
}
