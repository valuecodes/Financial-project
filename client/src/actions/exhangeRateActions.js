import axios from 'axios'
import { 
    EXHANGE_RATES_LIST_REQUEST, 
    EXHANGE_RATES_LIST_SUCCESS, 
    EXHANGE_RATES_LIST_FAIL, 
    EXHANGE_RATES_UPDATE_REQUEST,
    EXHANGE_RATES_UPDATE_SUCCESS,
    EXHANGE_RATES_UPDATE_FAIL
} from '../constants/exhangeRateConstants';

const getExhangeRates = () => async (dispatch) => {
    try{
        dispatch({type: EXHANGE_RATES_LIST_REQUEST})
        const { data:{data} } = await axios.get('/api/exhangeRates')
        dispatch({type: EXHANGE_RATES_LIST_SUCCESS, payload:data})        
    }catch(err){
        dispatch({type: EXHANGE_RATES_LIST_FAIL, payload:err})
    }
}

const updateExhangeRates = () => async (dispatch) => {
    try{
        dispatch({type: EXHANGE_RATES_UPDATE_REQUEST})
        const { data:{data} } = await axios.get('/api/exhangeRates/update')
        dispatch({type: EXHANGE_RATES_UPDATE_SUCCESS, payload:data})        
    }catch(err){
        dispatch({type: EXHANGE_RATES_UPDATE_FAIL, payload:err})
    }
}

export {
    getExhangeRates,
    updateExhangeRates
}