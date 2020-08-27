import React,{useEffect, useState} from 'react'
import axios from 'axios'
import { useSelector,useDispatch } from 'react-redux'
import SearchBox from '../components/SearchBox'
import { listTickers } from '../actions/tickerActions';
import { createPortfolio, listUserPortfolios, addTickerToPortfolio } from '../actions/portfolioActions';

export default function HomeScreen() {

    const dispatch = useDispatch()
    const userSignin = useSelector(state => state.userSignin)
    const { userInfo } = userSignin

    useEffect(()=>{
        dispatch(listTickers())
    },[])

    const portfolioAddTicker = useSelector(state => state.portfolioAddTicker)
    const { success:tickerAddSuccess, error:tickerAddError} = portfolioAddTicker

    const portfolioCreate = useSelector(state => state.portfolioCreate)
    const { success:portfolioSuccess, error:portfolioError } = portfolioCreate 

    useEffect(()=>{
        dispatch(listUserPortfolios())
    },[portfolioSuccess, tickerAddSuccess])

    return (
        <div className='homeScreen container'>
            {userInfo&&
            <>
                <TickerList userInfo={userInfo}/>
                <div className='tickerGraph card'>tickerGraph</div>
                <div className='dividendGraph card'>dividendGraph</div>
            </>
            }
        </div>
    )
}

function TickerList({userInfo}){
    const dispatch = useDispatch()

    return(
        <div className='tickerList card'>
            {/* <SearchBox items={allTickers} addItem={addItem}/> */}
            <CreatePortfolio userInfo={userInfo}/>
            <UserPortfolios />
        </div>
    )
}

function UserPortfolios(){

    const portfolioUserList = useSelector(state => state.portfolioUserList)
    const { loading, portfolios,error } = portfolioUserList

    const tickerList = useSelector(state => state.tickerList)
    const { tickers } = tickerList

    return(
        <div className='userPortfolios'>
            {loading?loading:error?error:
                portfolios.map(portfolio =>
                    <Portfolio key={portfolio._id} portfolio={portfolio} items={tickers}/>
                )                 
            }
        </div>
    )
}

function Portfolio({portfolio,items=[]}){

    const [search, setSearch] = useState('')

    const dispatch = useDispatch()

    const results=!search?
    []:
    items.filter(ticker=>{
        return( ticker[1].toLowerCase().includes(search.toLocaleLowerCase())||ticker[2].toLowerCase().includes(search.toLocaleLowerCase()))
    })

    const submitHandler = (ticker) => {
        dispatch(addTickerToPortfolio(ticker, portfolio._id))
        setSearch('')
    }

    return(
        <div className='portfolio'>
            <div className='portfolioHead'>
                <p>{portfolio.name}</p>
                <label>Add ticker</label>
                <input type='text' onChange={e => setSearch(e.target.value)}/>
                <button>Add</button>
            </div>
            {results.map((ticker,index) =>{
                if(index<10){
                    return <div 
                        key={ticker[1]}
                        className='searchResult' 
                        onClick={e => submitHandler(ticker[1])}
                        >
                            <p>{ticker[1]}</p> 
                            <p>{ticker[2]}</p> 
                        </div>
                }
            })}
            <div className='portfolioTickers'>
                {portfolio.tickers.map(ticker =>
                    <p>{ticker.ticker}</p>
                )}
            </div>
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
