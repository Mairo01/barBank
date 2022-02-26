import React, {Dispatch, ReactElement, useEffect, useState} from 'react';
import {NavLink, Outlet} from 'react-router-dom';
import './App.css';
import authService from "./services/authService"

export default function App(): ReactElement {
  const [isLoggedIn, setIsLoggedIn]: [boolean, Dispatch<boolean>] = useState(authService.isLoggedIn())

  const logOut = (): void => {
    authService.logOut()
    .finally(() => window.location.href = "/login")
  }

  function returnToLoginPage(): void {
    const paths = ["/login", "/register"]
    const url = window.location.pathname

    if (!isLoggedIn && !paths.includes(url)) {
      window.location.href = "/login"
    }
  }

  useEffect(() => {
    returnToLoginPage()
  }, [])

  const navBar = (): JSX.Element => {

    return isLoggedIn
      ? <>
          <div className="App-header-nav-links">
            <NavLink to="/current">Profile</NavLink>

            <NavLink to="/make-transaction">Transfer Funds</NavLink>
            <NavLink to="/transaction-history">History</NavLink>
          </div>

          <div className="App-header-nav-login">
            <div onClick={() => logOut()}>Logout</div>
          </div>
        </>

      : <div className="App-header-nav-links">
          <NavLink to="/register">Register</NavLink>
          <NavLink to="/login">Login</NavLink>
        </div>
  }

  return (
    <div className="App">

      <header className="App-header">
        <h1>barBank</h1>

        <nav className="App-header-nav">
          { navBar() }
        </nav>

      </header>

      <div className="App-content">
        <Outlet />
      </div>

    </div>
  )
}
