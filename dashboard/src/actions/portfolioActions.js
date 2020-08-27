import axios from 'axios'
import { PORTFOLIO_CREATE_REQUEST, PORTFOLIO_CREATE_SUCCESS, PORTFOLIO_CREATE_FAIL } from '../constants/portfolioConstants';

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
        dispatch({type:PORTFOLIO_CREATE_FAIL})
    }
}

export {
    createPortfolio
}