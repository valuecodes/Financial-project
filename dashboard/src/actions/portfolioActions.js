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

} from '../constants/portfolioConstants';

const createPortfolio = (name) => async(dispatch, getState) => {
    try{
        dispatch({type: PORTFOLIO_CREATE_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data } = await axios.post('/api/portfolio/create',{name},{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type:PORTFOLIO_CREATE_SUCCESS})
    } catch(err){
        dispatch({type:PORTFOLIO_CREATE_FAIL, payload: err.message})
    }
}

const addTickerToPortfolio = (ticker, portfolioId) => async(dispatch,getState) => {
    try{
        dispatch({type: PORTFOLIO_ADD_TICKER_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data } = await axios.put('/api/portfolio/'+portfolioId,{ticker},{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type: PORTFOLIO_ADD_TICKER_SUCCESS})
    } catch(err){
        dispatch({type: PORTFOLIO_ADD_TICKER_FAIL})
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
    createPortfolio,
    listUserPortfolios,
    addTickerToPortfolio
}