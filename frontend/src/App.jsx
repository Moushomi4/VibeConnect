import React from 'react'
import {BrowserRouter, Routes,Route, Router} from 'react-router-dom'
import Login from './pages/user-login/Login'
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { ProtectedRoute, PublicRoute } from './Protected';

import HomePage from './components/HomePage';
import UserDetails from './components/UserDetails';
import Status from './pages/statusSection/Status';
import Setting from './pages/settingSection/Setting';
import useUserStore from './store/useUserStore';
import { useEffect } from 'react';
import { disconnectSocket, initializeSocket } from './services/chat.service';
import { useChatStore } from './store/chatStore';

const App = () => {
  const {user}=useUserStore();
  const {setCurrentUser,initSocketListener,cleanUp }=useChatStore();

  // const store = useChatStore();
// console.log("cleanup:", cleanup);
// console.log("typeof cleanup:", typeof cleanup);

  useEffect(()=>{
    if(user?._id){
      const socket=initializeSocket();

      if(socket){
        setCurrentUser(user);
        initSocketListener();
      }

    }
    return()=>{
      cleanUp();
      disconnectSocket();
    }
  },[user,setCurrentUser,initSocketListener,cleanUp])
  return (
    <>
    <ToastContainer position='top-right' autoClose={3000}/>
        <Routes>
            <Route element={<PublicRoute/>}>
              <Route path='/user-login' element={<Login/>}></Route>
            </Route>
            <Route element={<ProtectedRoute/>}>
                <Route path='/' element={<HomePage/>}/>
                <Route path='/user-profile' element={<UserDetails/>}/>
                <Route path='/status' element={<Status/>}/>
                <Route path='/setting' element={<Setting/>}/>
            </Route >
        </Routes>

        </>
    
  )
}

export default App
