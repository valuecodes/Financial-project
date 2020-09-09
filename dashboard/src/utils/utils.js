export function camelCaseToString(s) {
    return s.split(/(?=[A-Z])/).map(function(p) {
        return p.charAt(0).toUpperCase() + p.slice(1);
    }).join(' ');
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