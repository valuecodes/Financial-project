export function camelCaseToString(s) {
    if(s===null) return ''

    let string = s.split(/(?=[A-Z])/).map(function(p) {
        return p.charAt(0).toUpperCase() + p.slice(1);
    }).join(' ');

    if(string.length===2){
        string = string.toUpperCase();
    }

    return string
}

export function roundToTwoDecimal(number){
    if(isNaN(number)) return null
    return Math.round(number*Math.pow(10,2))/Math.pow(10,2)
}

export function roundFinancialNumber(value){
    if(isNaN(value)||value===Infinity||value===-Infinity) value=null
    if(value) value = roundToTwoDecimal(value)
    return value
}

export function getYear(date){
    if(typeof date==='object'){
        return  JSON.stringify(date.getFullYear())
    }else{
        return date.split('-')[0]
    }
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
    if(isNaN(value)) return ''
    if(!value) return ''
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

export function normalize(val=0, max=1, min=0) {
    let result = (val - min) / (max - min)
    if(isNaN(result)) result=0
    if(result===-Infinity) result=0
    if(result===Infinity) result=0
    return result;
}

export function normalizePercent(val){
    let in_max=200
    let in_min=-200
    let out_max=1
    let out_min=-1
    if(val<-90)val=-90
    if(val>400)val=400
    let result = (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
    return result
}

export function colorArray(index){
    let colors=[
        'yellow',
        'purple',
        'rgb(8, 153, 83)',
        'rgb(255, 69, 69)',
        'cyan',
        'lime'
    ]
    return colors[index]
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

 export function datasetKeyProvider(){ return uuidv4()} 

 export function totalByKey(data,key,valueKey,parent=null){

    let object={}
    data.forEach(item =>{
        let name = item[key]
        if(object[name]){
            object[name].value+=item[valueKey]
            object[name].items.push(item)
        }else{
            object[name] = {
                name,
                value:item[valueKey],
                parent:parent?item[parent]:false,
                items:[item]
            }
        }
    })
    
    let array = Object.keys(object).map(item =>{
        return {
            name:object[item].name,
            value:object[item].value,
            parent:object[item].parent===object[item].name?object[item].parent+'1':object[item].parent,
            items:object[item].items
        }
    })
    return array
}

export function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
}

export function getTime(){
    return new Date().getHours()+':'+new Date().getMinutes()
}

export function convertDate(dateString) {
    var date = new Date(dateString);
    return date.getDate()+"/"+(date.getMonth() + 1)+"/"+date.getFullYear();
}

export function uniqueValuesArray(data,value){
    return [...new Set(data.map(item => item[value]))]
}

export const monthShort=[
    'Jan', 
    'Feb', 
    'Mar', 
    'Apr', 
    'May', 
    'Jun', 
    'Jul', 
    'Aug', 
    'Sep', 
    'Oct', 
    'Nov', 
    'Dec'
]

export const regress = (x, y) => {
    const n = y.length;
    let sx = 0;
    let sy = 0;
    let sxy = 0;
    let sxx = 0;
    let syy = 0;
    for (let i = 0; i < n; i++) {
        sx += x[i];
        sy += y[i];
        sxy += x[i] * y[i];
        sxx += x[i] * x[i];
        syy += y[i] * y[i];
    }
    const mx = sx / n;
    const my = sy / n;
    const yy = n * syy - sy * sy;
    const xx = n * sxx - sx * sx;
    const xy = n * sxy - sx * sy;
    const slope = xy / xx;
    const intercept = my - slope * mx;
    const r = xy / Math.sqrt(xx * yy);
    const r2 = Math.pow(r,2);
    let sst = 0;
    for (let i = 0; i < n; i++) {
       sst += Math.pow((y[i] - my), 2);
    }
    const sse = sst - r2 * sst;
    const see = Math.sqrt(sse / (n - 2));
    const ssr = sst - sse;
    return {slope, intercept, r, r2, sse, ssr, sst, sy, sx, see};
}

export function getMeanAndVariance(array) {

    function getVariance(array, mean) {
        return array.reduce(function(pre, cur) {
            pre = pre + Math.pow((cur - mean), 2);
            return pre;
        }, 0)
    }

    var meanTot = array.reduce(function(pre, cur) {
        return pre + cur;
    })
    var total = getVariance(array, meanTot / array.length);

    var res = {
        mean: meanTot / array.length,
        variance: total / array.length
    }

    return res
}

export function getStandardDeviation (array) {
    const n = array.length
    const mean = array.reduce((a, b) => a + b) / n
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}