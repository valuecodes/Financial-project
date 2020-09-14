import React,{useEffect} from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../actions/userActions';
import { listTickers } from '../actions/tickerActions';
import SearchBox from './SearchBox'
import { useHistory } from 'react-router';

export default function Header(props) {
    const history = useHistory();
    const dispatch = useDispatch()
    const tickerList = useSelector(state => state.tickerList)
    const { loading, tickers, error } = tickerList

    useEffect(()=>{
        dispatch(listTickers())
    },[])

    const selectTicker=(ticker)=>{
        history.push("/ticker/"+ticker[1]);
        console.log(history)
        console.log(ticker)
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

function MainLogo(){
    return(
        <div className='mainLogo'>
            <h1><Link to='/'>My logo</Link></h1> 
        </div>
    )
}

