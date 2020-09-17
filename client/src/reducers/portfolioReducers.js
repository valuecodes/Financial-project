import { 
    PORTFOLIO_CREATE_REQUEST, 
    PORTFOLIO_CREATE_SUCCESS, 
    PORTFOLIO_CREATE_FAIL, 
    PORTFOLIO_USER_LIST_REQUEST, 
    PORTFOLIO_USER_LIST_SUCCESS, 
    PORTFOLIO_USER_LIST_FAIL, 
    PORTFOLIO_ADD_TICKER_REQUEST, 
    PORTFOLIO_ADD_TICKER_SUCCESS, 
    PORTFOLIO_ADD_TICKER_FAIL, 
    PORTFOLIO_DELETE_REQUEST, 
    PORTFOLIO_DELETE_SUCCESS, 
    PORTFOLIO_DELETE_FAIL, 
    PORTFOLIO_ADD_TRANSACTION_REQUEST, 
    PORTFOLIO_ADD_TRANSACTION_SUCCESS,
    PORTFOLIO_ADD_TRANSACTION_FAIL,
    PORTFOLIO_DELETE_TRANSACTION_REQUEST,
    PORTFOLIO_DELETE_TRANSACTION_SUCCESS,
    PORTFOLIO_DELETE_TRANSACTION_FAIL,
    PORTFOLIO_UPDATE_TRANSACTION_REQUEST,
    PORTFOLIO_UPDATE_TRANSACTION_SUCCESS,
    PORTFOLIO_UPDATE_TRANSACTION_FAIL,
    PORTFOLIO_DELETE_TICKER_REQUEST,
    PORTFOLIO_DELETE_TICKER_SUCCESS,
    PORTFOLIO_DELETE_TICKER_FAIL,
    PORTFOLIO_UPDATE_REQUEST,
    PORTFOLIO_UPDATE_SUCCESS,
    PORTFOLIO_UPDATE_FAIL,
    PORTFOLIO_SELECT
} from "../constants/portfolioConstants";

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

function portfolioUpdateReducer(state={},action){
    switch(action.type){
        case PORTFOLIO_UPDATE_REQUEST:
            return {loading:true}
        case PORTFOLIO_UPDATE_SUCCESS:
            return {loading:false, success:true}
        case PORTFOLIO_UPDATE_FAIL:
            return {loading:false, error: action.payload}
        default: return state
    }
}

function portfolioDeleteReducer(state={},action){
    switch(action.type){
        case PORTFOLIO_DELETE_REQUEST:
            return {loading:true}
        case PORTFOLIO_DELETE_SUCCESS:
            return {loading:false, success:true}
        case PORTFOLIO_DELETE_FAIL:
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

function portfolioDeleteTickerReducer(state={},action){
    switch(action.type){
        case PORTFOLIO_DELETE_TICKER_REQUEST:
            return {loading:true}
        case PORTFOLIO_DELETE_TICKER_SUCCESS:
            return {loading:false, success:true}
        case PORTFOLIO_DELETE_TICKER_FAIL:
            return {loading:false, error:action.payload}
        default: return state
    }
}

function portfolioAddTransactionReducer(state={},action){
    switch(action.type){
        case PORTFOLIO_ADD_TRANSACTION_REQUEST:
            return {loading:true}
        case PORTFOLIO_ADD_TRANSACTION_SUCCESS:
            return {loading:false, success:true}
        case PORTFOLIO_ADD_TRANSACTION_FAIL:
            return {loading:false, error:action.payload}
        default: return state
    }
}

function portfolioUpdateTransactionReducer(state={},action){
    switch(action.type){
        case PORTFOLIO_UPDATE_TRANSACTION_REQUEST:
            return {loading:true}
        case PORTFOLIO_UPDATE_TRANSACTION_SUCCESS:
            return {loading:false, success:true}
        case PORTFOLIO_UPDATE_TRANSACTION_FAIL:
            return {loading:false, error:action.payload}
        default: return state
    }
}

function portfolioDeleteTransactionReducer(state={},action){
    switch(action.type){
        case PORTFOLIO_DELETE_TRANSACTION_REQUEST:
            return{loading:true}
        case PORTFOLIO_DELETE_TRANSACTION_SUCCESS:
            return{loading:false, success:true}
        case PORTFOLIO_DELETE_TRANSACTION_FAIL:
            return{loading:false, error:action.payload}
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

function portfolioSelectedReducer(state={},action){
    switch(action.type){
        case PORTFOLIO_SELECT:
            return { selectedPortfolio: action.payload }
        default: return state
    }
}

export{
    portfolioUserListReducer,
    portfolioCreateReducer,
    portfolioUpdateReducer,
    portfolioDeleteReducer,
    portfolioAddTickerReducer,
    portfolioDeleteTickerReducer,
    portfolioAddTransactionReducer,
    portfolioUpdateTransactionReducer,
    portfolioDeleteTransactionReducer,
    portfolioSelectedReducer,
}