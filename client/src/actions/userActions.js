import axios from 'axios'
import Cookie from 'js-cookie'
import { USER_SIGNIN_REQUEST, USER_SIGNIN_SUCCESS, USER_SIGNIN_FAIL, USER_LOGOUT, USER_REGISTER_REQUEST, USER_REGISTER_SUCCESS, USER_REGISTER_FAIL } from '../constants/userConstants';

const signin = (userInput) => async (dispatch) => {
    try{
        dispatch({type: USER_SIGNIN_REQUEST})
        console.log('posting')
        const { data } = await axios.post('/api/users/signin',userInput)
        dispatch({type: USER_SIGNIN_SUCCESS, payload:data})
        Cookie.set('userInfo',JSON.stringify(data))
    } catch(err){
        dispatch({type: USER_SIGNIN_FAIL, payload: err.message})
    }
}

const register = (userInput) => async (dispatch) => {
    dispatch({type: USER_REGISTER_REQUEST, payload: userInput})
    try{
        const {data} = await axios.post("/api/users/register",userInput) 
        
        dispatch({type: USER_REGISTER_SUCCESS, payload: data})
        Cookie.set('userInfo', JSON.stringify(data))
    } catch(err){
        dispatch({type: USER_REGISTER_FAIL, payload: err.message})
    }
}

const logout = () => (dispatch) => {
    Cookie.remove('userInfo')
    dispatch({type: USER_LOGOUT})
}

export{
    signin,
    logout,
    register
}