import React,{useState, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { signin } from '../actions/userActions';
import { Link } from 'react-router-dom'

export default function SigninScreen(props) {

    const [userInput, setUserInput] = useState({
        email:'',
        password:''
    })
    const dispatch = useDispatch()

    const userSignin = useSelector(state => state.userSignin)
    const { loading, userInfo, error } = userSignin

    useEffect(() => {
        if(userInfo){
            props.history.push('/')
        }
    }, [userInfo])

    const submitHandler=(e)=>{
        e.preventDefault()
        dispatch(signin(userInput))
    }
    
    return (
        <div className='signinScreen'>
            <form className='form'>
                <ul>
                    <li><h3>Login</h3> </li>
                    <li>
                        {error&&
                            <p>{error}</p>
                        }
                        {loading&&
                            <p>{loading}</p>
                        }                        
                    </li>

                    <li>
                        <label htmlFor='email'>Email</label>
                        <input className='formInput' id='email' name='email' type='text'
                            onChange={e => setUserInput({...userInput,email:e.target.value})}
                        />
                    </li>
                    <li>
                        <label htmlFor='password'>Password</label>
                        <input className='formInput' id='password' name='password' type='text'
                            onChange={e => setUserInput({...userInput,password:e.target.value})}
                        />
                    </li>
                    <li>
                        <button
                            onClick={submitHandler}
                            className='button'
                        >Login</button>                        
                    </li>
                    <li>
                        <p>Register <Link to='/register'>Here</Link></p>
                    </li>
                </ul>
            </form>
        </div>
    )
}
