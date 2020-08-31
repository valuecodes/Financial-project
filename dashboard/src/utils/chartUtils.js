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