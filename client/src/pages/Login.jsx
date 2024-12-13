import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {

    const navigate = useNavigate()

    // Getting data from context
    const {backendUrl, setIsLoggedin, getUserData} = useContext(AppContext)

    const [state, setState] = useState('Sign Up')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const onSubmitHandler = async (e) =>{
        try {
            e.preventDefault();

            axios.defaults.withCredentials = true
            if(state === 'Sign Up'){
                // making API call
                const {data} = await axios.post(backendUrl + '/api/auth/register', {name, email, password} )

                if(data.success){
                    setIsLoggedin(true)
                    getUserData()
                    navigate('/')
                }else{
                    toast.error(data.message)
                }
            }else{
                const {data} = await axios.post(backendUrl + '/api/auth/login', {email, password} )

                if(data.success){
                    setIsLoggedin(true)
                    getUserData()
                    navigate('/')
                }else{
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }


  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <img onClick={()=>navigate('/')} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-10 w-10 sm:w-15 cursor-pointer' />
      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>{state === 'Sign Up' ? "Create  account" : "Login"}</h2>
        <p className=' text-center mb-6 text-sm'>{state === 'Sign Up' ? "Create your account" : "Login to your account"}</p>

        <form onSubmit={onSubmitHandler} >
            {/* This code is to show some fields on a particular page */}
            {state === "Sign Up" && ( 
                <div className='mb-4 gap-3 w-full px-5 py-2.5 rounded-full flex items-center bg-[#333a5c]'>
                    <img src={assets.person_icon} alt="" />
                    <input onChange={e => setName(e.target.value)} value={name} className='bg-transparent outline-none' type="text" placeholder='Full Name' required />
                </div>
            )}
           
            <div className='mb-4 gap-3 w-full px-5 py-2.5 rounded-full flex items-center bg-[#333a5c]'>
                <img src={assets.mail_icon} alt="" />
                <input onChange={e => setEmail(e.target.value)} value={email} className='bg-transparent outline-none' type="email" placeholder='Email' required />
            </div>
            <div className='mb-4 gap-3 w-full px-5 py-2.5 rounded-full flex items-center bg-[#333a5c]'>
                <img src={assets.lock_icon} alt="" />
                <input onChange={e => setPassword(e.target.value)} value={password} className='bg-transparent outline-none' type="password" placeholder='Password' required />
            </div>

            <p onClick={()=>navigate('/reset-password')} className='mb-4 cursor-pointer text-indigo-500'>Forgot Password</p>

            <button className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'>{state}</button>
        </form>


            {/* This code is to show some fields on a particular page */}
            {state === "Sign Up" ? (
                    <p className='text-gray-400 text-center text-xs mt-4'>Already have an account?{' '}
                    <span className='text-blue-400 cursor-pointer underline' onClick={()=>setState('Login')}>Login here</span>
                    </p>
                ) 
                 : (
                    <p className='text-gray-400 text-center text-xs mt-4'>Don't have an account?{' '}
                    <span className='text-blue-400 cursor-pointer underline' onClick={()=>setState('Sign Up')}>Sign Up</span>
                    </p>
            )}
        

        
      </div>
    </div>
  )
}

export default Login
