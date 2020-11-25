import { normalize } from "../chartUtils";
import { colorArray } from "../utils";

export default {
    priceChart:{},
    options:{
        responsive:true,
        maintainAspectRatio: false,
        plugins:{
            datalabels:{
                display:false
            }
        },
        tooltips: {
            mode: 'index',
            intersect: false,
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
            position:'nearest'
        },
        scales: {
            xAxes: [{
                ticks: {
                    display: false
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

        charts[option.chart].datasets.push({
            label: option.label || option.name+index,
            data: data,
            borderColor: option.color || colorArray(index),
            borderWidth: 2,            
            pointRadius: option.pointRadius||0,
            dataLabels,
            fill: false,
        })        
    })

    return charts
}
