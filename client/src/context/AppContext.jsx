import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props)=>{

    axios.defaults.withCredentials = true;

    // connection between backend and frontend
    const backendUrl = import.meta.env.VITE_BACKEND_URL


    // This state will help display items on the frontend
    const [products, setProducts] = useState([])


    const [isLoggedin, setIsLoggedin] = useState(false)
    const [userData, setUserData] = useState(false)


    const getAuthState = async() =>{
        try {
            const {data} = await axios.get(backendUrl + '/api/auth/is-auth')
            if(data.success){
                setIsLoggedin(true)
                getUserData()
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // User data API call
    const getUserData = async ()=>{
        try {
            const {data} = await axios.get(backendUrl + '/api/user/data')
            data.success ? setUserData(data.userData) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Calling the function after page reload
    useEffect(()=>{
        getAuthState();
    },[])

    const value = {
        backendUrl,
        isLoggedin,setIsLoggedin,
        userData,setUserData,
        getUserData,
        products

    }


    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}