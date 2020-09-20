import { roundToTwoDecimal } from "./utils";

export function TickerSlim(ticker){
    this.id = ticker.tickerId
    this.ticker = ticker.ticker
    this.name = ticker.name
    this.latestPrice = ticker.price[0].close
    this.secondPrice = ticker.price[1].close
    this.percentageChange = () => {
        return roundToTwoDecimal(((this.latestPrice-this.secondPrice)/this.latestPrice)*100)
    }
    this.percentageChangeColor = () => {
        let percentageChange = this.percentageChange()
        return percentageChange>=0?'rgba(61, 212, 101,1)':'rgba(212, 61, 61,1)'
    }
}