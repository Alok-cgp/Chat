import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast";
import {io} from 'socket.io-client'


const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({children})=>{

    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUser, setOnlineUser] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async ()=>{
        try {
           const {data} = await axios.get('/api/auth/check');
           if(data.success){
            setAuthUser(data.user)
            connectSocket(data.user)
           }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false);
        }
    }


    const login = async (state, credentials)=>{
        try {
            const {data} = await axios.post(`/api/auth/${state}`, credentials);
            if(data.success){
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token)
                toast.success(data.message)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }


    const logout = async()=>{
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUser([]);
        axios.defaults.headers.common["token"] = null;
        socket.disconnect();
        toast.success("Logged out successfully");
    }


    const updateProfile = async (body)=>{
        try {
            const {data} = await axios.put('/api/auth/update-profile', body);
            if(data.success){
                setAuthUser(data.user);
                toast.success("Profile updated successfully")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    
    const connectSocket = (userData)=>{
        if(!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds)=>{
            console.log("Online users updated:", userIds);
            setOnlineUser(userIds);
        })

        newSocket.on("connect", ()=>{
            console.log("Socket connected for user:", userData._id);
        })

        newSocket.on("disconnect", ()=>{
            console.log("Socket disconnected for user:", userData._id);
        })
    }
    
    
    useEffect(()=>{
        if(token){
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth();
    },[])


    const value = {
        axios,
        authUser,
        onlineUser,
        socket,
        isLoading,
        login,
        logout,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}