import { roundToTwoDecimal } from "./utils";

export function TickerSlim(ticker){
    this.id = ticker[0]
    this.ticker = ticker[1]
    this.name = ticker[2]
    this.latestPrice = ticker[3]
    this.secondPrice = ticker[4]
    this.percentageChange = () => {
        return roundToTwoDecimal(((this.latestPrice-this.secondPrice)/this.latestPrice)*100)
    }
    this.percentageChangeColor = () => {
        let percentageChange = this.percentageChange()
        return percentageChange>=0?'rgba(61, 212, 101,1)':'rgba(212, 61, 61,1)'
    }
}