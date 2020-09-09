import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../actions/userActions';

export default function Header() {

    const userSignin = useSelector(state => state.userSignin)
    const { userInfo } = userSignin
    const dispatch = useDispatch()

    const logOutHandler=()=>{
        dispatch(logout())
    }

    return (
        <header className='header'>
            <div className='headerContainer container'>
                <div className='mainLogo'>
                    <h1><Link to='/'>My logo</Link></h1> 
                </div>
                {userInfo&&<p style={{backgroundColor:'lime'}}>{userInfo.name}</p>}
                <nav className='navbar'>
                    <ul>
                        <li><Link to='/'>Home</Link></li>
                        {!userInfo && <li><Link to='/signin'>Signin</Link></li>} 
                        {/* <li><Link to='/register'>Register</Link></li> */}
                        <li><Link to='/addData'>Admin</Link></li>
                        {userInfo && <li>
                            <Link to='/trading'>Trading</Link>
                            <button onClick={logOutHandler}>Log out</button>
                        </li>} 
                    </ul>
                </nav>                
            </div>
        </header>
    )
}
