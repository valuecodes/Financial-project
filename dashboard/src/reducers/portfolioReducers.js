import { PORTFOLIO_CREATE_REQUEST, PORTFOLIO_CREATE_SUCCESS, PORTFOLIO_CREATE_FAIL } from "../constants/portfolioConstants";

function portfolioCreateReducer(){
    switch(action.type){
        case PORTFOLIO_CREATE_REQUEST:
            return {loading:true}
        case PORTFOLIO_CREATE_SUCCESS:
            return {loading:false, portfolio:action.payload}
        case PORTFOLIO_CREATE_FAIL:
            return {loading:false, error: action.payload}
        default: return state
    }
}