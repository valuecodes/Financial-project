import { TICKER_LIST_REQUEST, TICKER_LIST_SUCCESS, TICKER_LIST_FAIL } from "../constants/tickerConstants";

function tickerListReducer(state={},action){
    switch(action.type){
        case TICKER_LIST_REQUEST:
            return {loading:true}
        case TICKER_LIST_SUCCESS:
            return {loading:false, tickers:action.payload}
        case TICKER_LIST_FAIL:
            return {loading:false, error: action.payload}
        default: return state
    }
}

export {
    tickerListReducer
}