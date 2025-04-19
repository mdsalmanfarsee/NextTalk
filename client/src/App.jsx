import React, { useEffect } from 'react'
import { Loader } from 'lucide-react'
import { Routes, Route, Navigate } from 'react-router-dom'


import { useThemeStore } from './store/useThemeStore.js'
import { useAuthStore } from './store/useAuthStore.js'


import Navbar from './components/Navbar.jsx'


import SettingPage from './pages/SettingPage'
import SignUp from './pages/signup.jsx'


function App() {
  const { theme } = useThemeStore();
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();


  // useEffect(() => {
  //   checkAuth();
  // }, [checkAuth])

  //console.log({ authUser }); //for debug purposes
  // if (isCheckingAuth && !authUser) {
  //   return (
  //     <div className='flex justify-center items-center h-screen' data-theme={theme}>
  //       <Loader className='size-10 animate-spin bg-base-100' />
  //     </div>
  //   )
  // }

  
  

  return (
    <div data-theme={theme}>
      {/* <Navbar /> */}
      <SettingPage />

      <Routes>
        <Route path="/signup" element={ <SignUp /> } />
        
      </Routes>


    </div>
  )
}

export default App
