import { PORTFOLIO_CREATE_REQUEST, PORTFOLIO_CREATE_SUCCESS, PORTFOLIO_CREATE_FAIL, PORTFOLIO_USER_LIST_REQUEST, PORTFOLIO_USER_LIST_SUCCESS, PORTFOLIO_USER_LIST_FAIL, PORTFOLIO_ADD_TICKER_REQUEST, PORTFOLIO_ADD_TICKER_SUCCESS, PORTFOLIO_ADD_TICKER_FAIL } from "../constants/portfolioConstants";

function portfolioCreateReducer(state={},action){
    switch(action.type){
        case PORTFOLIO_CREATE_REQUEST:
            return {loading:true}
        case PORTFOLIO_CREATE_SUCCESS:
            return {loading:false, success:true}
        case PORTFOLIO_CREATE_FAIL:
            return {loading:false, error: action.payload}
        default: return state
    }
}

function portfolioAddTickerReducer(state={},action){
    switch(action.type){
        case PORTFOLIO_ADD_TICKER_REQUEST:
            return {loading:true}
        case PORTFOLIO_ADD_TICKER_SUCCESS:
            return {loading:false, success:true}
        case PORTFOLIO_ADD_TICKER_FAIL:
            return {loading:false, error:action.payload}
        default: return state
    }
}

function portfolioUserListReducer(state={
    portfolios:[]
},action){
    switch(action.type){
        case PORTFOLIO_USER_LIST_REQUEST:
            return {loading:true}
        case PORTFOLIO_USER_LIST_SUCCESS:
            return {loading:false, portfolios:action.payload}
        case PORTFOLIO_USER_LIST_FAIL:
            return {loading: false, error: action.payload}
        default: return state
    }
}

export{
    portfolioCreateReducer,
    portfolioAddTickerReducer,
    portfolioUserListReducer
}