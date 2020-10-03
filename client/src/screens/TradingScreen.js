import React,{useEffect, useState} from 'react'
import { useSelector,useDispatch } from 'react-redux'
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
    updatePortfolio, 
} from '../actions/portfolioActions';

export default function TradingScreen() {

    const dispatch = useDispatch()
    const userSignin = useSelector(state => state.userSignin)
    const { userInfo } = userSignin

    const portfolioAddTicker = useSelector(state => state.portfolioAddTicker)
    const { success:tickerAddSuccess, error:tickerAddError} = portfolioAddTicker

    const portfolioDeleteTicker = useSelector(state => state.portfolioDeleteTicker)
    const {success: tickerDeleteSuccess, error: tickerDeleteError} = portfolioDeleteTicker

    const portfolioCreate = useSelector(state => state.portfolioCreate)
    const { success:portfolioSuccess, error:portfolioError } = portfolioCreate 

    const portfolioUpdate = useSelector(state => state.portfolioUpdate)
    const { success:portfolioUpdateSuccess, error:portfolioUpdateError } = portfolioUpdate

    const portfolioDelete = useSelector(state => state.portfolioDelete)
    const { success:portfolioDeleteSucccess, error: portfolioDeleteError } = portfolioDelete

    const portfolioAddTransaction = useSelector(state => state.portfolioAddTransaction)
    const { success: transactionAddSuccess, error: transactionAddError} = portfolioAddTransaction

    const portfolioUpdateTransaction = useSelector(state => state.portfolioUpdateTransaction)
    const { success: transactionUpdateSuccess, error: transactionUpdateError } = portfolioUpdateTransaction

    const portfolioDeleteTransaction = useSelector(state => state.portfolioDeleteTransaction)
    const {success: transactionDeleteSuccess, error: transactionDeleteError} = portfolioDeleteTransaction

    const errors=[
        tickerAddError,
        tickerDeleteError,
        portfolioError,
        portfolioUpdateError,
        portfolioDeleteError,
        transactionAddError,
        transactionUpdateError,
        transactionDeleteError
    ]

    useEffect(()=>{
        dispatch(listUserPortfolios())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[
        portfolioSuccess, 
        tickerAddSuccess, 
        tickerDeleteSuccess,
        portfolioDeleteSucccess,
        transactionAddSuccess,
        transactionUpdateSuccess,
        transactionDeleteSuccess,
        portfolioUpdateSuccess
    ])

    return (
        <div className='container'>
            {errors&&errors.map((item,index) => <div key={index}>{item}</div>)}
            {userInfo&&
                <div className='tickerList card'>
                    <CreatePortfolio userInfo={userInfo}/>
                    <UserPortfolios />  
                </div>            
            }
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
        return( ticker.ticker.toLowerCase().includes(search.toLocaleLowerCase())||ticker.name.toLowerCase().includes(search.toLocaleLowerCase()))
    })

    const submitHandler = (ticker) => {
        console.log(ticker)
        dispatch(addTicker(ticker, portfolio._id))
        setSearch('')
    }

    const deletePortfolioHandler= () => {
        dispatch(deletePortfolio(portfolio._id))
    }

    return(
        <div className='portfolio'>
            <div className='portfolioHead'>         
                <SmoothInput portfolio={portfolio}/>           
                <div className='portfolioInfo'>
                    {modifyPortfolio?
                        <>
                        <label>Add ticker</label>
                        <input type='text' onChange={e => setSearch(e.target.value)}/>
                        </>:
                        <>
                            <p>Type: Investing</p>    
                        </>
                    }
                    
                </div>
                
                <div className='headerButtons'>
                    <button 
                        onClick={e => {setModifyPortfolio(!modifyPortfolio)}}
                        className='button'
                    >Options</button>    
                    <button style={{display:modifyPortfolio?'':'none'}} className='delete' onClick={deletePortfolioHandler}>Delete Portfolio</button>      
                </div>
            </div>
            {results.map((ticker,index) =>
                index<10&&<div 
                    key={ticker[1]}
                    className='searchResult' 
                    onClick={e => submitHandler(ticker)}
                    >
                        <p>{ticker.ticker}</p> 
                        <p>{ticker.name}</p> 
                    </div>
            )}
            <div className='portfolioTickers'>
                {portfolio.tickers.map(ticker =>
                    <PortfolioTicker
                        key={ticker.ticker}
                        ticker={ticker}
                        portfolio={portfolio}
                    />
                )}
            </div>
        </div>  
    )
}

function SmoothInput({portfolio}){

    const [portfolioName, setPortfolioName] = useState('')
    const dispatch = useDispatch()
    useEffect(()=>{
        setPortfolioName(portfolio.name)
        // eslint-disable-next-line react-hooks/exhaustive-deps        
    },[])

    const [modify, setModify] = useState(false)

    const updatePortfolioHandler = () => {
        dispatch(updatePortfolio(portfolioName,portfolio._id))
        setModify(false)
    }

    return(
        <div className='smoothInput'>
        {modify? <input 
                
                className='headerInput'
                value={portfolioName} 
                type='text'
                onBlur={updatePortfolioHandler}
                onChange={e => setPortfolioName(e.target.value)}
                autoFocus
            />:
            <h3
                onClick={e => setModify(true)}
            >{portfolio.name}</h3>
        }
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
        <div className='tickerHeader'
        style={{backgroundColor:open&&'lightgray'}}
        >
            <p><b>{ticker.ticker}</b></p>
            <p><span>{ticker.name}</span></p> 
            {/* <p>{calculateTickerShareCount(ticker)} pcs</p> */}
            {/* <p><b>{calculateTickerTotal(ticker)}$</b></p> */}
            <div className='headerButtons'>
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
