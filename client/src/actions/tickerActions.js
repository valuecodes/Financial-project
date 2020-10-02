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
    TICKER_PORTFOLIO_DATA_FAIL,
    TICKER_SAVE_REQUEST,
    TICKER_SAVE_SUCCESS,
    TICKER_SAVE_FAIL,
    TICKER_DELETE_REQUEST,
    TICKER_DELETE_SUCCESS,
    TICKER_DELETE_FAIL,
    TICKER_UPDATE_RATIOS_REQUEST,
    TICKER_UPDATE_RATIOS_SUCCESS,
    TICKER_UPDATE_RATIOS_FAIL,
    TICKER_API_PRICE_REQUEST,
    TICKER_API_PRICE_SUCCESS,
    TICKER_API_PRICE_FAIL,
    TICKER_API_FINANCIALS_REQUEST,
    TICKER_API_FINANCIALS_SUCCESS,
    TICKER_API_FINANCIALS_FAIL
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
        dispatch({type: TICKER_PORTFOLIO_DATA_SUCCESS, payload: data})
    } catch(err){   
        dispatch({type: TICKER_PORTFOLIO_DATA_FAIL, payload: err.message})
    }
}

const saveTicker = (companyInfo) => async (dispatch,getState) => {
    try{
        dispatch({type: TICKER_SAVE_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data } = await axios.post('/dataInput/',companyInfo,{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type: TICKER_SAVE_SUCCESS, payload: data})
    } catch(err){   
        dispatch({type: TICKER_SAVE_FAIL, payload: err.message})
    }
}

const deleteTicker = (tickerId) => async (dispatch, getState) => {
    try{
        dispatch({type: TICKER_DELETE_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data } = await axios.delete('/dataInput/'+tickerId,{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type: TICKER_DELETE_SUCCESS, payload: data})
    } catch(err){   
        dispatch({type: TICKER_DELETE_FAIL, payload: err.message})
    }
}

const updateTickerRatios = (ticker) => async (dispatch,getState) => {
    try{
        dispatch({type: TICKER_UPDATE_RATIOS_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data } = await axios.get('/dataInput/ratios/'+ticker,{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type: TICKER_UPDATE_RATIOS_SUCCESS, payload: data})
    } catch(err){   
        dispatch({type: TICKER_UPDATE_RATIOS_FAIL, payload: err.message})
    }
}

const getPriceDataFromApi = (ticker) => async (dispatch, getState) => {
    try{
        dispatch({type: TICKER_API_PRICE_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data } = await axios.get('/dataInput/price/'+ticker,{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type: TICKER_API_PRICE_SUCCESS, payload: data.data})
    } catch(err){   
        dispatch({type: TICKER_API_PRICE_FAIL, payload: err.message})
    }
} 

const getFinancialsDataFromApi = (ticker) => async (dispatch, getState) => {
    try{
        dispatch({type: TICKER_API_FINANCIALS_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data } = await axios.get('/dataInput/financials/'+ticker,{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type: TICKER_API_FINANCIALS_SUCCESS, payload: data})
    } catch(err){   
        dispatch({type: TICKER_API_FINANCIALS_FAIL, payload: err.message})
    }
}

export{
    listTickers,
    getTickerData,
    getPortfolioTickersData,
    saveTicker,
    deleteTicker,
    updateTickerRatios,
    getPriceDataFromApi,
    getFinancialsDataFromApi
}