import axios from 'axios'
import { 
    MACRO_DATA_REQUEST, MACRO_DATA_SUCCESS, MACRO_DATA_FAIL, 
    MACRO_SAVE_REQUEST, MACRO_SAVE_SUCCESS, MACRO_SAVE_FAIL, 
    MACRO_DELETE_REQUEST, MACRO_DELETE_SUCCESS, MACRO_DELETE_FAIL 
} from '../constants/macroConstants';

const getMacroData = () => async(dispatch) => {
    try{
        dispatch({type: MACRO_DATA_REQUEST})
        const { data:{data} } = await axios.get('/api/macro')
        dispatch({type:MACRO_DATA_SUCCESS, payload:data})
    } catch(err){
        dispatch({type:MACRO_DATA_FAIL, payload: err.message})
    }
}

const saveMacroData = (macroData) => async (dispatch,getState) => {
    try{
        dispatch({type: MACRO_SAVE_REQUEST})
        const {userSignin:{userInfo}} = getState()
        const { data } = await axios.post('/api/macro',macroData,{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type:MACRO_SAVE_SUCCESS, payload:data})
    } catch(err){
        dispatch({type:MACRO_SAVE_FAIL, payload: err.message})
    }
}

const deleteMacroData = (id) => async (dispatch,getState) => {
    try{
        dispatch({type: MACRO_DELETE_REQUEST})
        console.log(id)
        const {userSignin:{userInfo}} = getState()
        const { data } = await axios.delete('/api/macro/'+id,{
            headers:{
                Authorization: 'Bearer'+userInfo.token
            }
        })
        dispatch({type:MACRO_DELETE_SUCCESS, payload:data})
    } catch(err){
        dispatch({type:MACRO_DELETE_FAIL, payload: err.message})
    }
}

export {
    getMacroData,
    saveMacroData,
    deleteMacroData
}