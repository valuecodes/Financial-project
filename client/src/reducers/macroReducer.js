import { 
    MACRO_DATA_REQUEST, MACRO_DATA_SUCCESS, MACRO_DATA_FAIL, 
    MACRO_SAVE_REQUEST, MACRO_SAVE_SUCCESS, MACRO_SAVE_FAIL, 
    MACRO_DELETE_REQUEST, MACRO_DELETE_SUCCESS, MACRO_DELETE_FAIL 
} from "../constants/macroConstants";

function macroDataReducer(state={},action){
    switch(action.type){
        case MACRO_DATA_REQUEST:
            return{loading:true}
        case MACRO_DATA_SUCCESS:
            return {loading:false, data:action.payload}
        case MACRO_DATA_FAIL:
            return {loading:false, error: action.payload}
        default: return state
    }
}

function macroSaveReducer(state={},action){
    switch(action.type){
        case MACRO_SAVE_REQUEST:
            return{loading:true}
        case MACRO_SAVE_SUCCESS:
            return {loading:false, success:true}
        case MACRO_SAVE_FAIL:
            return {loading:false, error: action.payload}
        default: return state
    }
}

function macroDeleteReducer(state={},action){
    switch(action.type){
        case MACRO_DELETE_REQUEST:
            return{loading:true}
        case MACRO_DELETE_SUCCESS:
            return {loading:false, success:true}
        case MACRO_DELETE_FAIL:
            return {loading:false, error: action.payload}
        default: return state
    }
}

export { 
    macroDataReducer,
    macroSaveReducer,
    macroDeleteReducer
}