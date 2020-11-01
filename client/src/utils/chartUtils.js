export function normalize(min, max) {
    var delta = max - min;
    return function (val) {
        return (val - min) / delta;
    };
}

export function getColorFromRedToGreenByPercentage(percent) {
    const r = 255 * percent/100;
    const g = 255 - (255 * percent/100);
    return 'rgb('+r+','+g+',0)';
}

export function calculateChartGradient(data){

    var chart = document.getElementById('canvas')
    if(!chart){
        return 'gray'
    }
    let ctx =  chart.getContext("2d")
    let height=Number(document.getElementById('canvas').style.height.substring(0, document.getElementById('canvas').style.height.length - 2))
    var gradient = ctx.createLinearGradient(0, 0, 0, height*0.92)
    let max = Math.max(...data)
    let min = Math.min(...data)
    let percentage=0
    let red=0
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

export function mapBetween(currentNum, minAllowed, maxAllowed, min, max) {
    return (maxAllowed - minAllowed) * (currentNum- min) / (max - min) + minAllowed;
}

export function calculateChartBorderGradient(data,options){

    var chart = document.getElementById('ratioPriceChart')

    if(!chart){
        return 'gray'
    }

    let ctx = chart.getContext("2d")
    // let height=Number(document.getElementById('ratioPriceChart').style.height.substring(0, document.getElementById('ratioPriceChart').style.height.length - 2))
    var gradient = ctx.createLinearGradient(0, 0, 1200,0 )
     
    let max = Math.max(...data)
    let min = Math.min(...data)
    
    const key = options.selected
    if(key === 'dividendYield'){
        max = Math.min(...data)
        min = Math.max(...data)
    }
    
    if(max>60) max = 60

    data.forEach((item,index) =>{
        
        if((data.length/index)!==Infinity){
            let percentage = mapBetween(item,0,100,min,max)
            gradient.addColorStop(index/data.length, getColorFromRedToGreenByPercentage(percentage))
        }
    })

    return gradient
}

 export function getRatioName(key){
    switch(key){
        case 'pe':
            return 'Historical PE-ratio'
        case 'pb':
            return 'Historical PB-ratio'
        case 'dividendYield':
            return 'Historical Dividend Yield'
        case 'ev/ebit':
            return 'Historical EV / Ebit'
        default: return ''
    }
}

export function getFinancialKeyName(key){
    switch(key){
        case 'pe':
            return 'Earnings per share'
        case 'pb':
            return 'Book value per share'
        case 'dividendYield':
            return 'Dividend history'
        case 'ev/ebit':
            return 'Total debt'
        default: return ''
    }
}

export function monthlyDividends(userDividends,min,max){

    userDividends=userDividends.filter(item => item.date.getFullYear()===min)
    let data=[]    
    let count=0  

    for(var i=min;i<=max;i++){
        for(var a=1;a<=12;a++){
            let divFound=true
            let divs=[];
            while(divFound){
                if(count===userDividends.length) break
                if(userDividends[count].year===i&&userDividends[count].month===a){
                    divs.push(userDividends[count])
                    count++
                }else{
                    divFound=false
                }
            }
            
            data.push({
                date:new Date(i,a),
                divAmount:divs.reduce((a,c)=>a+(c.payment),0),
                dividends:divs,
                label:i+'/'+a,
            })

            if(count===userDividends.length) break
        }
    }

    return data
}
