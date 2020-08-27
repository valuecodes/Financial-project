import axios from 'axios'
import { TICKER_LIST_REQUEST, TICKER_LIST_SUCCESS, TICKER_LIST_FAIL } from '../constants/tickerConstants';

const listTickers = () => async(dispatch) => {
    try{
        dispatch({type: TICKER_LIST_REQUEST})
        const { data:{data} } = await axios.get('/api/tickers') 
        dispatch({type: TICKER_LIST_SUCCESS, payload:data})
    } catch(err){
        dispatch({type: TICKER_LIST_FAIL, payload:err.message})        
    }
}

export{
    listTickers
}