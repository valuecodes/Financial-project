import { 
    EXHANGE_RATES_LIST_REQUEST, 
    EXHANGE_RATES_LIST_SUCCESS,
    EXHANGE_RATES_LIST_FAIL, 
    EXHANGE_RATES_UPDATE_REQUEST,
    EXHANGE_RATES_UPDATE_SUCCESS,
    EXHANGE_RATES_UPDATE_FAIL
} from "../constants/exhangeRateConstants";

function exhangeRateListReducer(state={},action){
    switch(action.type){
        case EXHANGE_RATES_LIST_REQUEST:
            return {loading:true}
        case EXHANGE_RATES_LIST_SUCCESS:
            return {loading:false, exhangeRate:action.payload}
        case EXHANGE_RATES_LIST_FAIL:
            return {loading:false, error: action.payload}
        default: return state
    }
}

function exhangeRateUpdateReducer(state={},action){
    switch(action.type){
        case EXHANGE_RATES_UPDATE_REQUEST:
            return {loading:true}
        case EXHANGE_RATES_UPDATE_SUCCESS:
            return {loading:false, success:true, exhangeRate:action.payload}
        case EXHANGE_RATES_UPDATE_FAIL:
            return {loading:false, error: action.payload}
        default: return state
    }
}

export {
    exhangeRateListReducer,
    exhangeRateUpdateReducer
}