import React,{useEffect, useState} from 'react'
import axios from 'axios'
import { useSelector,useDispatch } from 'react-redux'
import SearchBox from '../components/SearchBox'
import { listTickers } from '../actions/tickerActions';
import { createPortfolio } from '../actions/portfolioActions';

export default function HomeScreen() {
    const dispatch = useDispatch()
    const tickerList = useSelector(state => state.tickerList)
    const {tickers, loading, error} = tickerList
    

    useEffect(()=>{
        dispatch(listTickers())
    },[])

    const userSignin = useSelector(state => state.userSignin)
    const { userInfo } = userSignin
    console.log(userInfo)
    return (
        <div className='homeScreen container'>
            {tickers&&userInfo&&
            <>
                <TickerList allTickers={tickers} userInfo={userInfo}/>
                <div className='tickerGraph card'>tickerGraph</div>
                <div className='dividendGraph card'>dividendGraph</div>
            </>
            }
        </div>
    )
}

function TickerList({allTickers,userInfo}){
    const dispatch = useDispatch()

    return(
        <div className='tickerList card'>
            {/* <SearchBox items={allTickers} addItem={addItem}/> */}
            <CreatePortfolio userInfo={userInfo}/>
            <UserPortfolios userInfo={userInfo}/>
        </div>
    )
}

function UserPortfolios({userInfo}){
    return(
        <div className='userPortfolios'>
            {userInfo.portfolios.map(portfolio =>
                <p>{portfolio.name}</p>
            )}
        </div>
    )
}

function CreatePortfolio({userInfo}){

    const [name, setName] = useState('')
    const dispatch = useDispatch()

    const submitHandler=()=>{
        dispatch(createPortfolio(name))
    }

    return(
        <div className='createPortfolio'>
            <label>Add portfolio</label>
            <input type='text' onChange={e => setName(e.target.value)} placeholder='Portfolio name...'/>
            <button onClick={submitHandler}>Add</button>
        </div>
    )
}
