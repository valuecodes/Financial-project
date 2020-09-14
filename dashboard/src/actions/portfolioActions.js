import axios from 'axios'
import { 
    PORTFOLIO_CREATE_REQUEST, 
    PORTFOLIO_CREATE_SUCCESS, 
    PORTFOLIO_CREATE_FAIL,
    PORTFOLIO_USER_LIST_REQUEST,
    PORTFOLIO_USER_LIST_SUCCESS,
    PORTFOLIO_USER_LIST_FAIL,
    PORTFOLIO_ADD_TICKER_REQUEST,
    PORTFOLIO_ADD_TICKER_FAIL,
    PORTFOLIO_ADD_TICKER_SUCCESS,
    PORTFOLIO_DELETE_REQUEST,
    PORTFOLIO_DELETE_SUCCESS,
    PORTFOLIO_DELETE_FAIL,
    PORTFOLIO_ADD_TRANSACTION_FAIL,
    PORTFOLIO_ADD_TRANSACTION_SUCCESS,
    PORTFOLIO_ADD_TRANSACTION_REQUEST,
    PORTFOLIO_DELETE_TRANSACTION_REQUEST,
    PORTFOLIO_DELETE_TRANSACTION_SUCCESS,
    PORTFOLIO_DELETE_TRANSACTION_FAIL,
    PORTFOLIO_UPDATE_TRANSACTION_REQUEST,
    PORTFOLIO_UPDATE_TRANSACTION_SUCCESS,
    PORTFOLIO_UPDATE_TRANSACTION_FAIL,
    PORTFOLIO_DELETE_TICKER_REQUEST,
    PORTFOLIO_DELETE_TICKER_SUCCESS,
    PORTFOLIO_DELETE_TICKER_FAIL,
    PORTFOLIO_UPDATE_FAIL,
    PORTFOLIO_UPDATE_SUCCESS,
    PORTFOLIO_UPDATE_REQUEST,

} from '../constants/portfolioConstants';

const createPortfolio = (name) => async(dispatch, getState) => {
    try{
        dispatch({type: PORTFOLIO_CREATE_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data } = await axios.post('/api/portfolio/',{name},{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type:PORTFOLIO_CREATE_SUCCESS})
    } catch(err){
        dispatch({type:PORTFOLIO_CREATE_FAIL, payload: err.message})
    }
}

const updatePortfolio = (portfolio ,portfolioId) => async(dispatch,getState) => {
    try{
        dispatch({type: PORTFOLIO_UPDATE_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data } = await axios.put('/api/portfolio/'+portfolioId,{portfolio},{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type: PORTFOLIO_UPDATE_SUCCESS})
    } catch(err){
        dispatch({type: PORTFOLIO_UPDATE_FAIL, payload: err.message})
    }
}

const deletePortfolio = (portfolioId) => async(dispatch, getState) =>{
    try{
        dispatch({type: PORTFOLIO_DELETE_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data } = await axios.delete('/api/portfolio/'+portfolioId,{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type: PORTFOLIO_DELETE_SUCCESS, payload:data})
    } catch(err){
        dispatch({type: PORTFOLIO_DELETE_FAIL, payload: err.message})
    }
}

const addTicker = (ticker, portfolioId) => async(dispatch,getState) => {
    try{
        dispatch({type: PORTFOLIO_ADD_TICKER_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data } = await axios.post('/api/portfolio/'+portfolioId,{ticker},{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type: PORTFOLIO_ADD_TICKER_SUCCESS})
    } catch(err){
        dispatch({type: PORTFOLIO_ADD_TICKER_FAIL, payload:err.message})
    }
}

const deleteTicker = (portfolioId,tickerId) => async(dispatch, getState) => {
    try{
        dispatch({type: PORTFOLIO_DELETE_TICKER_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data } = await axios.delete('/api/portfolio/'+portfolioId+'/&'+tickerId,{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type: PORTFOLIO_DELETE_TICKER_SUCCESS})
    } catch(err){
        dispatch({type: PORTFOLIO_DELETE_TICKER_FAIL, payload:err.message})
    }
}

const addTransaction = (transaction, portfolioId, tickerId) => async(dispatch, getState) => {
    try{
        dispatch({type: PORTFOLIO_ADD_TRANSACTION_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data } = await axios.post('/api/portfolio/'+portfolioId+'/&'+tickerId,{transaction},{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type: PORTFOLIO_ADD_TRANSACTION_SUCCESS})
    } catch(err){
        dispatch({type: PORTFOLIO_ADD_TRANSACTION_FAIL, payload:err.message})
    }
}

const updateTransaction = (transaction, portfolioId, tickerId, transactionId) => async(dispatch, getState) => {
    try{
        dispatch({type: PORTFOLIO_UPDATE_TRANSACTION_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data }  = await axios.put('/api/portfolio/'+portfolioId+'/&'+tickerId+'/&'+transactionId,{transaction},{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type: PORTFOLIO_UPDATE_TRANSACTION_SUCCESS})
    } catch(err){
        dispatch({type: PORTFOLIO_UPDATE_TRANSACTION_FAIL})
    }
}

const deleteTransaction = (portfolioId, tickerId, transactionId) => async(dispatch, getState) => {
    try{
        dispatch({type: PORTFOLIO_DELETE_TRANSACTION_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data }  = await axios.delete('/api/portfolio/'+portfolioId+'/&'+tickerId+'/&'+transactionId,{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type: PORTFOLIO_DELETE_TRANSACTION_SUCCESS})
    } catch(err){
        dispatch({type: PORTFOLIO_DELETE_TRANSACTION_FAIL})
    }
}

const listUserPortfolios = () => async(dispatch, getState) => {
    try{
        dispatch({type: PORTFOLIO_USER_LIST_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data } = await axios.get('/api/portfolio/userPortfolios',{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type: PORTFOLIO_USER_LIST_SUCCESS, payload: data.data})
    } catch(err){
        dispatch({type: PORTFOLIO_USER_LIST_FAIL, payload:err.message})
    }
}

export {
    listUserPortfolios,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    addTicker,
    deleteTicker,
    addTransaction,
    updateTransaction,
    deleteTransaction
}