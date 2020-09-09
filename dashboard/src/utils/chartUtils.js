export function getChartOptions(tooltipLabels, tooltipFooters){

    return {
        legend: {
            display: false,
        },
        responsive:true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: false,
                color: 'black',
                // align: 'end',
                // font: {
                //     size: 12,
                // }
            },
        },
        tooltips: {
            // enabled: !state.dividendYield,

            // backgroundColor:'red',
            // cornerRadius: 1,
            callbacks: {
                label: function (tooltipItem, data) {
                    console.log(tooltipItem)
                    return data.datasets[0].tooltipLabels[tooltipItem.index]
                },
                // labelColor: function(tooltipItem, chart) {
                //     console.log(tooltipItem,chart)
                //     return {
                //         borderColor: 'rgb(255, 0, 0)',
                //         backgroundColor: 'rgb(255, 0, 0)'
                //     };
                // },
                // footer: function (tooltipItem, data) {
                //     console.log(tooltipItem)
                //     let items = data.datasets[0].tooltipFooters[tooltipItem[0].index]
                //     let array=[]
                //     if(items.length>1){
                //         items.forEach(item => {
                //             array.push(
                //                 'Name: '+item.name+
                //                 ' \Transaction: '+item.volume*item.price+
                //                 ' \Type: '+item.type,
                //             )
                //         });     
                //     }else{
                //         items.forEach(item => {
                //             array.push(
                //                 'Name: '+item.name,
                //                 'Title: '+item.position,
                //                 'Volume: '+item.volume,
                //                 'Price: '+item.price,
                //                 'Type: '+item.type,
                //             )
                //         });                        
                //     }

                //     console.log(array)
                //     return array
                // }
            }
        }
    }
}

function normalize(min, max) {
    var delta = max - min;
    return function (val) {
        return (val - min) / delta;
    };
}

function getColorFromRedToGreenByPercentage(percent) {
    const r = 255 * percent/100;
    const g = 255 - (255 * percent/100);
    return 'rgb('+r+','+g+',0)';
}

export function calculateChartGradient(data){

    var ctx = document.getElementById('canvas').getContext("2d")
    console.log(document.getElementById('canvas').style.height)
    let height=Number(document.getElementById('canvas').style.height.substring(0, document.getElementById('canvas').style.height.length - 2))
    console.log(height)
    var gradient = ctx.createLinearGradient(0, 0, 0, height*0.92)
    let max = Math.max(...data)
    let min = Math.min(...data)
    let percentage=0
    let red=0
    let barData=data.map(item => max*1)
    if(min<0){
        percentage= 1- Math.abs(min)/(max+Math.abs(min))
        red=1            
        gradient.addColorStop(0, 'green')
        gradient.addColorStop(percentage, 'white')
        gradient.addColorStop(red, 'red')
    }else{
        percentage=1
        red=1
        gradient.addColorStop(0, 'green')
        gradient.addColorStop(percentage, 'white')
    }
    return gradient

}

export function calculateChart(chartComponents,options){

    let { labels, data, cumulativeDividends,cumulativeDividendsPrice,        percentageChange, percentageChangeWithDivs } = chartComponents
    
    let gradient = calculateChartGradient(data)

    let dataSets=[]
    if(options.values.selected!=='dividends'){
        dataSets.push({
            label: 'Bar Dataset',
            backgroundColor:gradient,
            pointRadius:0,
            pointBorderColor:'rgba(0,0,0,0)',
            borderColor:'black',
            data: data,    
            percentageChange,
            percentageChangeWithDivs,
            options
        })
    }
    console.log(dataSets[0])
    if(options.values.selected!=='capitalGains'){
        dataSets.push({
            label: 'Bar Dataset',
            backgroundColor:'yellow',
            pointRadius:0,
            pointBorderColor:'rgba(0,0,0,0)',
            borderColor:'black',
            data:options.values.selected!=='dividends'?cumulativeDividendsPrice:cumulativeDividends,
            percentageChange,
            percentageChangeWithDivs,
            options  
        })
    }

    return {
        datasets:dataSets,
        labels: labels
    }
}