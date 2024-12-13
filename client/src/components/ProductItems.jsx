import React from 'react'
import { AppContext } from '../context/AppContext'
import { Link } from 'react-router-dom';


const ProductItems = ({id,image,name,price}) => {
  return (
    <Link to={`/product/${id}`} className='cursor-pointer text-gray-700'>
        <div className="overflow-hidden">
            <img src={image[0]} className='hover:scale-110 transition ease-in-out' />
        </div>
        <p className='pt-3 pb-1 text-sm'>{name}</p>
        <p className='text-sm font-medium'>{price}</p>
    </Link>
  )
}

export default ProductItems
