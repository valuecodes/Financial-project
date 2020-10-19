export function stochasticOscillatorGradient(){
    const stochasticChart = document.getElementById('stochasticChart') 
    let ctx = stochasticChart.getContext("2d");
    let grd = ctx.createLinearGradient(0, 0, 0, 100);
    grd.addColorStop(0, "rgb(245, 66, 66)");
    grd.addColorStop(0.49, "rgb(245, 66, 66)");
    grd.addColorStop(0.50, "white");
    grd.addColorStop(0.94, "white");
    grd.addColorStop(0.95, "rgb(66, 245, 123)");
    grd.addColorStop(1, "rgb(66, 245, 123)");
    return grd
}

export function oscillatorPriceGradient(ticker,oscillator){    
    const stochasticChart = document.getElementById('stochasticChart') 
    let ctx = stochasticChart.getContext("2d");
    const { left, right } = ticker.priceChart.chart.current.chartInstance.chartArea
    let priceGradient=ctx.createLinearGradient(left, 0, right,0);
    let lastColor='gray'
    oscillator.forEach((item,index)=>{
        let color='rgba(255,255,255,0)'
        if(item>=60) color='rgb(245, 66, 66)'
        if(item<=-60) color='rgb(66, 245, 123)'
        let tick = (1/oscillator.length)/2
        let percentage = (index/oscillator.length)+tick
        if(percentage-(tick+0.000001)>0){
            priceGradient.addColorStop(percentage-(tick+0.000001), lastColor);
        }
        priceGradient.addColorStop(percentage, color);
        let next = percentage+(tick-0.000001)
        if(next<1){
            priceGradient.addColorStop(next, color);            
        }
        lastColor=color
    })

    return priceGradient
}