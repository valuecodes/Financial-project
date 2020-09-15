import React,{useEffect,useState} from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../actions/userActions';
import { listTickers } from '../actions/tickerActions';
import SearchBox from './SearchBox'
import { useHistory } from 'react-router';
import { listUserPortfolios, selectPortfolio } from '../actions/portfolioActions';

export default function Header(props) {
    const history = useHistory();
    const dispatch = useDispatch()
    const tickerList = useSelector(state => state.tickerList)
    const { tickers } = tickerList

    useEffect(()=>{
        dispatch(listTickers())
    },[dispatch])

    const selectTicker=(ticker)=>{
        history.push("/ticker/"+ticker[1]);
    }

    return (
        <header className='header'>
            <div className='headerContainer container'>
                <MainLogo/>
                <SearchBox items={tickers} addItem={selectTicker} placeholder={'Search tickers'}/>
                <Navbar/>
            </div>
        </header>
    )
}



function Navbar(){

    const dispatch = useDispatch()
    const userSignin = useSelector(state => state.userSignin)
    const { userInfo } = userSignin
    
    const logOutHandler=()=>{
        dispatch(logout())
    }

    return(
        <nav className='navbar'>
            <ul>
                {userInfo &&
                    <SelectUserPortfolio/>
                }
                <li><Link to='/'>Home</Link></li>
                {!userInfo &&
                    <li><Link to='/signin'>Signin</Link></li>
                } 
                {userInfo &&
                    <>    
                    <li><Link to='/trading'>Trading</Link></li>
                    <button onClick={logOutHandler}>Log out</button>
                    {userInfo.isAdmin &&
                        <li>
                            <Link to='/addData'>Admin</Link>
                        </li>}
                    </>
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
function MainLogo(){
    return(
        <div className='mainLogo'>
            <h1><Link to='/'>My logo</Link></h1> 
        </div>
    )
}

