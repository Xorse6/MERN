import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const Header = () => {

  const navigate = useNavigate()

    const {userData} = useContext(AppContext)


  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center text-gray-800'>
      <img onClick={()=>navigate('/')} src={assets.header_img} alt="" className='w-36 h-36 rounded-full mb-6' />
      <h1 className='flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2'>Hey {userData ? userData.name : 'User!'}   </h1>
      <h2 className='text-3xl sm:text-5xl mb-4 font-semibold'>Welcome To Niche Studios</h2>
      <p className='mb-8 max-w-md'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero neque quae est eveniet fugit odit.</p>
      <button onClick={()=>navigate('/packages')} className='border border-gray-500 rounded-full px-8 py-2 hover:bg-gray-100 transition-all'>Get Started</button>
    </div>
  )
}

export default Header
