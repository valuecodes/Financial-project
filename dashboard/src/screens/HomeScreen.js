import React,{useEffect, useState, useRef} from 'react'
import { useSelector,useDispatch } from 'react-redux'
import { listTickers } from '../actions/tickerActions';
import { listUserPortfolios } from '../actions/portfolioActions';
import Tickers from '../components/Tickers'
import Dividends from '../components/Dividends'

export default function HomeScreen() {

    const userSignin = useSelector(state => state.userSignin)
    const { userInfo } = userSignin
    const dispatch = useDispatch()

    useEffect(()=>{
        dispatch(listTickers())
        dispatch(listUserPortfolios())
    },[])

    return (
        <div className='homeScreen container'>
            {userInfo&&
            <>
            <div></div>
            <div className='mainSection'>
                <Tickers />
                <Dividends/>                        
            </div>

            </>
            }
        </div>
    )
}
