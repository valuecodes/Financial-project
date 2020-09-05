import axios from 'axios'
import { 
    TICKER_LIST_REQUEST, 
    TICKER_LIST_SUCCESS, 
    TICKER_LIST_FAIL, 
    TICKER_DATA_REQUEST,
    TICKER_DATA_SUCCESS, 
    TICKER_DATA_FAIL, 
    TICKER_PORTFOLIO_DATA_REQUEST,
    TICKER_PORTFOLIO_DATA_SUCCESS,
    TICKER_PORTFOLIO_DATA_FAIL
} from '../constants/tickerConstants';

const listTickers = () => async(dispatch) => {
    try{
        dispatch({type: TICKER_LIST_REQUEST})
        const { data:{data} } = await axios.get('/api/tickers') 
        dispatch({type: TICKER_LIST_SUCCESS, payload:data})
    } catch(err){
        dispatch({type: TICKER_LIST_FAIL, payload:err.message})        
    }
}

const getTickerData = (tickerId) => async (dispatch, getState) => {
    try{
        dispatch({type: TICKER_DATA_REQUEST})
        const { data } = await axios.get('/api/tickers/'+tickerId)
        dispatch({type: TICKER_DATA_SUCCESS, payload:data.data})
    }catch(err){
        dispatch({type: TICKER_DATA_FAIL, payload:err.message})
    }
}

const getPortfolioTickersData = (portfolioId) => async (dispatch,getState) => {
    try{
        dispatch({type: TICKER_PORTFOLIO_DATA_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data } = await axios.get('/api/tickers/portfolio/'+portfolioId,{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        console.log(data)
        dispatch({type: TICKER_PORTFOLIO_DATA_SUCCESS, payload: data.data})
    } catch(err){   
        dispatch({type: TICKER_PORTFOLIO_DATA_FAIL, payload: err.message})
    }
}

export{
    listTickers,
    getTickerData,
    getPortfolioTickersData,
}