export default function PortofolioTicker(ticker){
    this.ticker = ticker?ticker.ticker:null
    this.transactions = ticker?ticker.transactions:[]
    this.getTest = () => handleGetTest(this)
}

function handleGetTest(test){
    console.log(test)
}