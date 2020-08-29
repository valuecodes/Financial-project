import React,{useEffect, useState} from 'react'
import axios from 'axios'
import { useSelector,useDispatch } from 'react-redux'
import SearchBox from '../components/SearchBox'
import { listTickers } from '../actions/tickerActions';
import { 
    createPortfolio, 
    listUserPortfolios, 
    deletePortfolio,
    addTicker,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    deleteTicker, 
} from '../actions/portfolioActions';

export default function HomeScreen() {

    const dispatch = useDispatch()
    const userSignin = useSelector(state => state.userSignin)
    const { userInfo } = userSignin

    useEffect(()=>{
        dispatch(listTickers())
    },[])

    const portfolioAddTicker = useSelector(state => state.portfolioAddTicker)
    const { success:tickerAddSuccess, error:tickerAddError} = portfolioAddTicker

    const portfolioDeleteTicker = useSelector(state => state.portfolioDeleteTicker)
    const {success: tickerDeleteSuccess, error: tickerDeleteError} = portfolioDeleteTicker

    const portfolioCreate = useSelector(state => state.portfolioCreate)
    const { success:portfolioSuccess, error:portfolioError } = portfolioCreate 

    const portfolioDelete = useSelector(state => state.portfolioDelete)
    const { success:portfolioDeleteSucccess, error: portfolioDeleteError } = portfolioDelete

    const portfolioAddTransaction = useSelector(state => state.portfolioAddTransaction)
    const { success: transactionAddSuccess, error: transactionAddError} = portfolioAddTransaction

    const portfolioUpdateTransaction = useSelector(state => state.portfolioUpdateTransaction)
    const { success: transactionUpdateSuccess, error: transactionUpdateError } = portfolioUpdateTransaction

    const portfolioDeleteTransaction = useSelector(state => state.portfolioDeleteTransaction)
    const {success: transactionDeleteSuccess, error: transactionDeleteError} = portfolioDeleteTransaction

    useEffect(()=>{
        dispatch(listUserPortfolios())
    },[
        portfolioSuccess, 
        tickerAddSuccess, 
        tickerDeleteSuccess,
        portfolioDeleteSucccess,
        transactionAddSuccess,
        transactionUpdateSuccess,
        transactionDeleteSuccess
    ])

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

    const [modifyPortfolio, setModifyPortfolio] = useState(false)

    const [search, setSearch] = useState('')

    const dispatch = useDispatch()

    const results=!search?
    []:
    items.filter(ticker=>{
        return( ticker[1].toLowerCase().includes(search.toLocaleLowerCase())||ticker[2].toLowerCase().includes(search.toLocaleLowerCase()))
    })

    const submitHandler = (ticker) => {
        dispatch(addTicker(ticker, portfolio._id))
        setSearch('')
    }

    const deletePortfolioHandler= () => {
        dispatch(deletePortfolio(portfolio._id))
    }

    return(
        <div className='portfolio'>
            <div className='portfolioHead'>
                <p>{portfolio.name}</p>
                <button>Modify portfolio</button>
                {/* <label>Add ticker</label>
                <input type='text' onChange={e => setSearch(e.target.value)}/>
                <button className='delete' onClick={deletePortfolioHandler}>Delete portfolio</button> */}
            </div>
            {results.map((ticker,index) =>{
                if(index<10){
                    return <div 
                        key={ticker[1]}
                        className='searchResult' 
                        onClick={e => submitHandler(ticker)}
                        >
                            <p>{ticker[1]}</p> 
                            <p>{ticker[2]}</p> 
                        </div>
                }
            })}
            <div className='portfolioTickers'>
                {portfolio.tickers.map(ticker =>
                    <PortfolioTicker
                        ticker={ticker}
                        portfolio={portfolio}
                    />
                )}
            </div>
        </div>  
    )
}

function PortfolioTicker({ticker, portfolio}){

    const [open, setOpen] = useState(false)

    return(
        <div key={ticker.ticker} className='portfolioTicker'>
            <TickerHeader portfolio={portfolio} ticker={ticker} open={open} setOpen={setOpen}/>
            <div className='tickerTransactions'
                style={{height:open?'auto':0}}
            >
                {ticker.transactions.map(transaction =>
                    <TickerTransaction key={transaction._id} portfolio={portfolio} ticker={ticker} transaction={transaction} />
                )}
                <AddTickerTransaction ticker={ticker} portfolio={portfolio}/>
            </div>
        </div>    
    )
}

function TickerHeader({ticker, portfolio, open, setOpen}){

    const dispatch = useDispatch()

    const deleteTickerHandler=()=>{
        dispatch(deleteTicker(portfolio._id,ticker._id))
    }

    return(
        <div className='tickerHeader'>
            <p><b>{ticker.ticker}</b></p>
            <p><span>{ticker.name}</span></p> 
            <p>Shares:</p>
            <div className='tickerHeaderButtons'>
                <button onClick={e => setOpen(!open)}>Modify</button>   
                <button
                    className='delete'
                    style={{display:open?'':'none'}}
                    onClick={deleteTickerHandler}>Delete</button>         
            </div>
        </div>
    )
}

function TickerTransaction({portfolio, ticker, transaction,}){

    const dispatch = useDispatch()
    const [transact, setTransact] = useState({
        count:'',
        price:'',
        date:'',
        type:'buy'
    })

    useEffect(()=>{
        setTransact(transaction)
    },[transaction])

    const deleteTransactionHandler = () => {
        dispatch(deleteTransaction(portfolio._id, ticker._id, transaction._id))
    }

    const updateTransactionHandler = () => {
        dispatch(updateTransaction(transact,portfolio._id, ticker._id, transaction._id))
    }
 
    return(
        <div className='transaction'>
            <input 
                value={transact.count} 
                onChange={e=> setTransact({...transact,count:Number(e.target.value)})} 
                type='number'
            />
            <p>pcs</p>
            <input 
                value={transact.price} 
                onChange={e=> setTransact({...transact,price:Number(e.target.value)})} 
                type='number'
            />
            <p>$</p>
            <b>{transact.price*transact.count}$</b>
            <p>{transact.type}</p>
            <input 
                id='shareDate' 
                value={transact.date.split('T')[0]} 
                onChange={e=> setTransact({...transact,date:e.target.value})} 
                type='date'
            />
            <button onClick={updateTransactionHandler}>Save</button>
            <button onClick={deleteTransactionHandler}>Delete</button>
        </div>
    )
}

function AddTickerTransaction({ticker, portfolio}){

    const dispatch = useDispatch()
    const [transaction, setTransaction] = useState({
        count:'',
        price:'',
        date:'',
        type:'buy'
    })

    const addTransactionHandler = () => {
        dispatch(addTransaction(transaction,portfolio._id,ticker._id))
    }

    return(
        <div className='addTickerTransaction'>
            <ul>
                <li>
                    <label htmlFor='shareCount'>Shares</label>
                    <input id='shareCount' type='number' onChange={e => setTransaction({...transaction, count: e.target.value})}/> 
                </li>
                <li>
                    <label htmlFor='sharePrice'>Price</label>      
                    <input id='sharePrice' type='number' onChange={e => setTransaction({...transaction, price: e.target.value})}/>                    
                </li>
                <li>
                    <label htmlFor='shareDate'>Date</label>
                    <input className='shareDate' id='shareDate' type='date' onChange={e => setTransaction({...transaction, date: e.target.value})}/>
                </li>
                <li className='transactionType'>
                    <div>
                        <label htmlFor='shareBuy'>Buy</label>
                        <input id='shareBuy' name='shareAction' type='radio'
                        onChange={e => setTransaction({...transaction, type: 'buy'})}/>
                    </div>
                    <div>
                        <label htmlFor='shareSell'>Sell</label>
                        <input id='shareSell' name='shareAction' type='radio'
                         onChange={e => setTransaction({...transaction, type: 'sell'})}
                        />  
                    </div>
                </li>
                <li>
                    <button onClick={addTransactionHandler}>Add Transaction</button>
                </li>
            </ul>
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
