export function camelCaseToString(s) {

    let string = s.split(/(?=[A-Z])/).map(function(p) {
        return p.charAt(0).toUpperCase() + p.slice(1);
    }).join(' ');

    if(string.length===2){
        string = string.toUpperCase();
    }

    return string
}

export function roundToTwoDecimal(number){
    return Math.round(number*Math.pow(10,2))/Math.pow(10,2)
}

export function formatValue(value,format){
    if(format === 'currency'){
        value = formatCurrency(value)
    }else if(format==='percentage'){
        value = roundToTwoDecimal(value)
        value = formatPercentage(value,true)
    }else{
        value = roundToTwoDecimal(value)
    }    
    return value
}

export function formatCurrency(value,sign=false){
    let text = value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
    if(sign){
        if(value>0) text = '+'+text
        if(value<0) text = '-'+text
    }
    return text
}

export function formatMillions(value,sign=false){
    let text = value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
    if(sign){
        if(value>0) text = '+'+text
        if(value<0) text = '-'+text
    }
    return text.split(',')[0].replace('.',' ')
}
 
export function formatPercentage(value){
    let text = value
    if(value>0) text = '+'+text
    text+='%'
    return text
}

export function getNumberOfWeek(dt) {
    dt = new Date(dt)
    var tdt = new Date(dt.valueOf());
    var dayn = (dt.getDay() + 6) % 7;
    tdt.setDate(tdt.getDate() - dayn + 3);
    var firstThursday = tdt.valueOf();
    tdt.setMonth(0, 1);
    if (tdt.getDay() !== 4) 
      {
     tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
       }
    return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}

export function randomColor(){
    
    let colorArray = [
        '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
        '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
        '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
        '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
        '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
        '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
        '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
        '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
        '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
        '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
    ];
    return colorArray[Math.floor(Math.random()*colorArray.length)]
}

 export function datasetKeyProvider(){ return Math.random()} 

 export function totalByKey(data,key,valueKey){
    let object={}
    data.forEach(item =>{
        let name = item[key]
        if(object[name]){
            object[name].value+=item[valueKey]
        }else{
            object[name] = {
                name,
                value:item[valueKey]
            }
        }
    })
    let array = Object.keys(object).map(item =>{
        return {
            name:object[item].name,
            value:object[item].value
        }
    })
    return array
}