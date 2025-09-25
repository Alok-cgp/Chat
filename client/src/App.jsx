import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import {Toaster} from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext.jsx'


const App = () => {
  const {authUser, isLoading} = useContext(AuthContext)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('/src/assets/bgImage.svg')] bg-contain">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-[url('/src/assets/bgImage.svg')] bg-contain">
      <Toaster/>
      <Routes>
        {/* Define your routes here */}
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login"/>} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/"/>} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login"/>} />
      </Routes>
    </div>
  )
}

export default App
