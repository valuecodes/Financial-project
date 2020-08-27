import React,{useState, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { register } from '../actions/userActions';

export default function RegisterScreen(props) {

    const dispatch = useDispatch()

    const [userInput, setUserInput] = useState({
        name:'',
        email:'',
        password:'',
        rePassword:''
    })

    const userSignin = useSelector(state => state.userSignin)
    const { loading, userInfo, error } = userSignin

    useEffect(() => {
        if(userInfo){
            props.history.push('/')
        }
    }, [userInfo])

    const submitHandler=(e)=>{
        e.preventDefault()
        dispatch(register(userInput))
    }

    return (
        <div className='signinScreen'>
            <form className='form'>
                <ul>
                    <li><h3>Login</h3> </li>
                    <li>
                        <label for='name'>Name</label>
                        <input className='formInput' id='name' name='name' type='text'
                            onChange={e => setUserInput({...userInput,name:e.target.value})}
                        />
                    </li>
                    <li>
                        <label for='email'>Email</label>
                        <input className='formInput' id='email' name='email' type='text'
                            onChange={e => setUserInput({...userInput,email:e.target.value})}
                        />
                    </li>
                    <li>
                        <label for='password'>Password</label>
                        <input className='formInput' id='password' name='password' type='password'
                            onChange={e => setUserInput({...userInput,password:e.target.value})}
                        />
                    </li>
                    <li>
                        <label for='repassword'>RePassword</label>
                        <input className='formInput' id='password' name='password' type='password'
                            onChange={e => setUserInput({...userInput,rePassword:e.target.value})}
                        />
                    </li>
                    <li>
                        <button
                            onClick={submitHandler}
                            className='button'
                        >Login</button>                        
                    </li>
                    <li>
                        <p>Signin <Link to='/signin'>Here</Link></p>
                    </li>
                </ul>
            </form>
        </div>
    )
}
