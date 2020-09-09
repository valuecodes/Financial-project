import React,{useEffect,useState,useRef} from 'react'
import { Chart, Line } from 'react-chartjs-2';
import { SetTimePeriod } from './graphComponents';
import { formatCurrency } from '../utils/utils';
import { calculateChartGradient } from '../utils/chartUtils';
import ChartOptions from './ChartOptions'
import { calculateChart } from '../utils/chartUtils';

export default function PortfolioChart({portfolio}) {
    const tt=useRef()
    const ttDate=useRef()
    const [tooltip,setTooltip] = useState(0)

    const [chartOptions, setChartOptions] = useState({        
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: false,
            },
        },
        legend: {
            display: false,
            labels: {
                // fontColor: 'rgb(255, 99, 132)'
            }
        },
        layout: {
            padding: {
                left: 0,
                right: 0,
                top: 20,
                bottom: 0
            }
        },        
        scales: {
            xAxes: [{
                gridLines: {
                    color: "rgba(0, 0, 0, 0)",
                },
                barPercentage: 1.1
            }],
            yAxes: [{
                gridLines: {
                    color: "rgba(0, 0, 0, 0)",
                },
                ticks: {
                    maxTicksLimit: 20,
                    // minTicksLimit:6
                    // Include a dollar sign in the ticks
                    callback: function(value, index, values) {
                        console.log(value, index, values)
                        var ctx = document.getElementById('canvas').getContext("2d")
                        console.log(value, index, values,ctx)
                        return '$' + value;
                    }}
            }]
        },
        tooltips: {
            mode: 'index',
            intersect: false,
            titleFontColor:'rgba(0,0,0,0)',
            enabled:false,
            custom: function(tooltipModel,i,a) {
                if(tooltipModel.dataPoints){
                    let tooltipPoints = tooltipModel.dataPoints.length
                    for(var i=0;i<tooltipPoints;i++){
                        let tooltip = document.getElementById('chartjs-tooltip'+i);
                        let tooltipLine =  document.getElementById('chartjs-tooltip-line'+i);
                        if(!tooltip){
                            tooltip = document.createElement('div');                 
                            tooltip.id = 'chartjs-tooltip'+i;
                            tooltip.innerHTML = '<table></table>';
                            document.body.appendChild(tooltip)
                        }

                        if(!tooltipLine){
                            tooltipLine = document.createElement('div');                 
                            tooltipLine.id = 'chartjs-tooltip-line'+i;
                            tooltipLine.innerHTML = '<table></table>';
                            document.body.appendChild(tooltipLine)
                        }

                        if (tooltipModel.opacity === 0) {
                            tooltip.style.opacity = 0;
                            return;
                        }

                        function getBody(bodyItem) {
                            return bodyItem.lines;
                        }       
 
                        // Set Text 
                        if (tooltipModel.body) {
                            var bodyLines = tooltipModel.body.map(getBody);
                            var tableRoot = tooltipLine.querySelector('table');
                            tableRoot.textContent = bodyLines[i];
                        }

                        var position = this._chart.canvas.getBoundingClientRect();
                        tooltip.style.opacity = 1;
                        tooltip.style.position = 'absolute';
                        tooltip.style.left = position.left + window.pageXOffset +tooltipModel.caretX-6  + 'px';
                        tooltip.style.top = position.top + window.pageYOffset + tooltipModel.dataPoints[i].y-6+ 'px';
                        tooltip.style.pointerEvents = 'none';
                        tooltip.style.width = '10px';
                        tooltip.style.height = '10px';
                        tooltip.style.borderRadius = '20px';
                        tooltip.style.border = '2px solid black';
                        tooltip.style.backgroundColor = 'white';

                        tooltipLine.style.opacity = 1;
                        tooltipLine.style.position = 'absolute';
                        tooltipLine.style.left = position.left + window.pageXOffset +tooltipModel.caretX + 'px';
                        tooltipLine.style.top = position.top + window.pageYOffset + tooltipModel.dataPoints[i].y+(i===0?9:-22) + 'px';
                        tooltipLine.style.backgroundColor='dimgray'
                        tooltipLine.style.color='white'
                        tooltipLine.style.fontSize='10px'
                        tooltipLine.style.borderRadius='25%'
                    }                    
                }else{
                    for(var i=0;i<2;i++){
                        if(document.getElementById('chartjs-tooltip'+i)){
                            document.getElementById('chartjs-tooltip'+i).style.opacity=0;
                        }
                        if(document.getElementById('chartjs-tooltip-line'+i)){
                            document.getElementById('chartjs-tooltip-line'+i).style.opacity=0;
                        }
                    }
                }
            },
            callbacks: {
                label: function (tooltipItem, data) {
                    const { datasetIndex,index } = tooltipItem
                    tt.current.textContent=`${formatCurrency( tooltipItem.yLabel)}`
                    let currentData = (datasetIndex===0?data.datasets[datasetIndex].percentageChange[index]:data.datasets[datasetIndex].percentageChangeWithDivs[index])+'%'
                    if(data.datasets[datasetIndex].options.values.selected==='dividends'){
                        currentData = data.datasets[datasetIndex].data[index]+'$'
                    }
                    return currentData
                },
            }
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

    const [options, setOptions] = useState({
        type:'price',
        values:{
            selected:'total',
            select:['total','capitalGains','dividends']
        },
        time:{
            timeValue:'1.years-years',
            timeStart:new Date().getFullYear(),
            timeEnd:new Date().getFullYear(),            
        }
    })

    useEffect(()=>{

        if(portfolio){
            let chartComponents = portfolio.priceChart(options)
            let chartData = calculateChart(chartComponents,options)
            setChart(chartData)
            console.log(chartData._meta)
        }
        
    },[portfolio,options])
    function datasetKeyProvider(){ return Math.random(); }
    return (
        <div className='portfolioChart'>        
            <div className='chartHeader'>
                <ChartOptions options={options} setOptions={setOptions}/>
            </div>
            <div className='porfolioChartContainer'>
                <div className='chartInfo'>
                    <div className='chartInfoContainer' ref={tt}></div>
                </div>
                <Line
                    id='canvas'
                    datasetKeyProvider={datasetKeyProvider}
                    data={chart}
                    // height={'100px'}
                    options={chartOptions}
                />  
            </div>
        </div>


    )
}
