import { 
    TICKER_LIST_REQUEST, 
    TICKER_LIST_SUCCESS, 
    TICKER_LIST_FAIL, 
    TICKER_DATA_REQUEST, 
    TICKER_DATA_SUCCESS, 
    TICKER_DATA_FAIL, 
    TICKER_PORTFOLIO_DATA_REQUEST, 
    TICKER_PORTFOLIO_DATA_SUCCESS, 
    TICKER_PORTFOLIO_DATA_FAIL,
    TICKER_SAVE_REQUEST,
    TICKER_SAVE_SUCCESS,
    TICKER_SAVE_FAIL
} from "../constants/tickerConstants";

function tickerListReducer(state={
    tickers:[]
},action){
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

function tickerDataReducer(state={},action){
    switch(action.type){
        case TICKER_DATA_REQUEST:
            return {loading:true}
        case TICKER_DATA_SUCCESS:
            return {loading:false, tickerFullData:action.payload}
        case TICKER_DATA_FAIL:
            return {loading:false, error: action.payload}
        default: return state
    }
}

function tickerPortfolioDataReducer(state={},action){
    switch(action.type){
        case TICKER_PORTFOLIO_DATA_REQUEST:
            return {loading:true}
        case TICKER_PORTFOLIO_DATA_SUCCESS:
            return {loading:false, portfolioData:{tickerData:action.payload.tickerData,portfolio:action.payload.portfolio}, tickers:action.payload.tickerData,portfolio:action.payload.portfolio}
        case TICKER_PORTFOLIO_DATA_FAIL:
            return {loading:false, error: action.payload}
        default: return state
    }
}

function tickerSaveReducer(state={},action){
    switch(action.type){
        case TICKER_SAVE_REQUEST:
            return { loading:true }
        case TICKER_SAVE_SUCCESS:
            return { loading:false, ticker:action.payload }
        case TICKER_SAVE_FAIL:
            return { loading:false, error:action.payload }
        default: return state
    }
}

export {
    tickerListReducer,
    tickerDataReducer,
    tickerPortfolioDataReducer,
    tickerSaveReducer
}