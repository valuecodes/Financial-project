import { normalize } from "../chartUtils";
import { colorArray } from "../utils";

export const charts = {
    priceChart:{},
    options:{
        responsive:true,
        maintainAspectRatio: false,
        legend:{
            display:false
        },
        plugins:{
            datalabels:{
                display:false
            }
        },
        tooltips: {
            mode: 'index',
            intersect: false,
        },  
        scales: {
            xAxes : [{
              ticks : {
                maxTicksLimit:10,
                maxRotation: 0,
                minRotation: 0
              }
            }]
        }          
    },
    ratioChart:{},
    predictionChart:{},
    ratiosChartOptions:{
        responsive:true,
        maintainAspectRatio: false,
        plugins:{
            datalabels:{
                display:false
            }
        },
        legend:{
            display:false
        },
        tooltips: {
            mode: 'index',
            intersect: false, 
            callbacks:{
                label: function(tooltipItem, data) {
                    tooltipItem.opacity = 0;
                }
            }
        },
        layout: {
            padding: {
                // Any unspecified dimensions are assumed to be 0                     
                right: 25
            }
        },
        scales: {
            xAxes: [{
                ticks: {
                    display: false
                },
                gridLines: {
                    display:false
                }
            }],
            yAxes: [{
                // ticks: {
                //     display: false
                // },
                gridLines: {
                    display:false
                }   
            }]
        }
    },
    lossChart:{   
        labels:[],     
        datasets:[{
            label:'Loss',
            data: [],
            borderColor: "black"
        }],
    }        
}

export function createMLChart(mlChartOptions,priceData){

    let labels = priceData.map(item => item.date.split('T')[0])
    
    let charts={
        priceChart:{
            datasets:[],
            labels          
        },
        ratioChart:{
            datasets:[],
            labels   
        },
        predictionChart:{
            datasets:[],
            labels  
        }
    }

    let highlighColorIndex=0

    mlChartOptions.forEach((option,index) => {

        let data = priceData.map(i => i[option.id||option.name]||null)
        let dataLabels = data

        if(option.normalize){
            data = data.map(item => normalize(item,option.max,option.min))
        }

        if(option.scale){
            data = data.map(item => item/option)            
        }

        if(['trainY','unseenY'].includes(option.name)){
            data = data.map((item,index) => item?(item+1)*priceData[index].close:null)
        }

        if(option.name==='prediction'){
            data[data.length-option.predictionWeeks-1] = priceData[priceData.length-option.predictionWeeks-1].close
        }
        
        if(option.predictionWeeks&&option.name!=='prediction'){
            [...Array(option.predictionWeeks).keys()].map( i => data.unshift(null));
        }

        let borderColor = option.color
        let highlight = false
        if(option.name.split('_').length===1&&!option.color){
            borderColor = colorArray(highlighColorIndex)
            highlighColorIndex++
        }

        charts[option.chart].datasets.push({
            label: option.label || option.name+index,
            data: data,
            borderColor,
            borderWidth: option.borderWidth||2,            
            pointRadius: option.pointRadius||0,
            dataLabels,
            fill: false,
            order:borderColor?1:2,
        })        
    })

    return charts
}
