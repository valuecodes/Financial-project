import React,{useEffect,useState} from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../actions/userActions';
import { listTickers } from '../actions/tickerActions';
import SearchBox from './SearchBox'
import { useHistory } from 'react-router';
import { listUserPortfolios, selectPortfolio } from '../actions/portfolioActions';
import { getExhangeRates } from '../actions/exhangeRateActions';

export default function Header(props) {
    
    const [page, setPage]=useState('')
    const history = useHistory();
    const dispatch = useDispatch()
    const tickerList = useSelector(state => state.tickerList)
    const { tickers } = tickerList
    const userSignin = useSelector(state => state.userSignin)
    const { userInfo } = userSignin

    useEffect(()=>{
        dispatch(getExhangeRates())
    },[])

    useEffect(()=>{
        dispatch(listTickers())
    },[dispatch])

    const selectTicker=(ticker)=>{
        history.push("/ticker/"+ticker.ticker);
    }

    return (
        <header className='header'>
            <div className='headerContainer container'>
                <MainLogo setPage={setPage}/>
                <SearchBox  tickers={tickers} addItem={selectTicker} placeholder={'Search tickers...'}/>
                <Navbar userInfo={userInfo}/>
            </div>
            <SubHeader userInfo={userInfo} setPage={setPage}/>
        </header>
    )
}

function SubHeader({userInfo,setPage}){

    const exhangeRateList = useSelector(state => state.exhangeRateList)
    const { loading, exhangeRate, error } = exhangeRateList
    const [eRate,setERate] = useState('USD')
    const history = useHistory();
    let path = history.location.pathname

    return(
        <div className='subHeader'>
            <div className='container subHeaderNav'>
                <ul>
                    <li>
                        <Link
                            style={{
                                backgroundColor: path==='/'&&'rgba(0, 0, 0, 0.2)',
                                borderBottom: path==='/'&&'0.2rem solid lightgreen'}}
                            onClick={()=>setPage('/')} to='/'
                        >
                            Home
                        </Link>
                    </li>
                    {userInfo &&   
                        <li><Link
                                style={{
                                backgroundColor: path==='/trading'&&'rgba(0, 0, 0, 0.2)',
                                borderBottom: path==='/trading'&&'0.2rem solid lightgreen'}} 
                                onClick={()=>setPage('/trading')} 
                                to='/trading'
                            >
                                Trading
                            </Link></li>
                    }
                    
                    {userInfo?userInfo.isAdmin &&
                        <li>
                            <Link 
                                style={{
                                    backgroundColor: path==='/addData'&&'rgba(0, 0, 0, 0.2)',
                                    borderBottom: path==='/addData'&&'0.2rem solid lightgreen'}} 
                                onClick={()=>setPage('/addData')} 
                                to='/addData'
                            >
                                Admin
                            </Link>
                        </li>:<div></div>} 
                </ul>
                {exhangeRate&&
                    <div className='headerCurrencies'>
                        <p className='currencyText'>EUR / </p>
                            <select 
                                className='selectERate currencyText' name='eRates' 
                                id={'eRates'}
                                value={eRate}
                                onChange={(e) => setERate(e.target.value)}
                            >
                                {Object.keys(exhangeRate.rates).map(rate =>
                                    <option key={rate} value={rate}>{rate}</option>
                                )}
                            </select>
                        <p className='currencyText'>{exhangeRate.rates[eRate]}</p>
                    </div>
                }
            </div>
        </div>
    )
}

function Navbar({userInfo}){

    const dispatch = useDispatch()
    const logOutHandler=()=>{
        dispatch(logout())
    }

    return(
        <nav className='navbar'>
            <ul>
                {userInfo &&
                    <SelectUserPortfolio/>
                }
                
                {!userInfo &&
                    <li><Link to='/signin'>Signin</Link></li>
                } 
                {userInfo &&                    
                    <button className='button' onClick={logOutHandler}>Log out</button>
                } 
            </ul>
        </nav>   
    )
}

function SelectUserPortfolio(){

    const dispatch = useDispatch()
    const [userPortfolios,setUserPortfolios] = useState(null)
    const portfolioUserList = useSelector(state => state.portfolioUserList)
    const { loading, portfolios,error } = portfolioUserList
    const portfolioSelected = useSelector(state => state.portfolioSelected)
    const { selectedPortfolio } = portfolioSelected

    useEffect(()=>{
        dispatch(listUserPortfolios())
    },[])

    useEffect(()=>{
        if(portfolios && userPortfolios===null){
           if(portfolios.length>0){
                setUserPortfolios(portfolios)
                dispatch(selectPortfolio(portfolios[0]))
           } 
        }
    },[portfolios])

    const selectPortfolioHandler=(portfolioId)=>{
        const selectedPortfolio = userPortfolios.find(item => item._id===portfolioId)
        dispatch(selectPortfolio(selectedPortfolio))
    }

    return( 
        <div className='selectPortfolio'>
            {userPortfolios&&
            <>
                <label htmlFor="portfolios">Selected Portfolio</label>
                <select 
                    name='portfolios' id='portfolios'
                    onChange={e => selectPortfolioHandler(e.target.value)}
                >
                    {userPortfolios.map(portfolio =>
                        <option key={portfolio._id} value={portfolio._id}>{portfolio.name}</option>
                    )}                    
                </select>
            </>
            }
        </div>
    )
}
function MainLogo({setPage}){
    return(
        <div className='mainLogo'>
            <Link onClick={() => setPage('/')} to='/'>Financial Project</Link>
        </div>
    )
}

