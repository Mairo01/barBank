import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Register from "./routes/Register/Register";
import Login from "./routes/Login/Login";
import Current from "./routes/Current/Current";
import TransferFunds from "./routes/TransferFunds/TransferFunds";
import TransactionHistory from "./routes/TransactionHistory/TransactionHistory";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ <App/> }>
          <Route path="/register" element={ <Register/> } />
          <Route path="/login" element={ <Login/> } />
          <Route path="/current" element={ <Current/> } />
          <Route path="/make-transaction" element={ <TransferFunds/> } />
          <Route path="/transaction-history" element={ <TransactionHistory/> } />
          <Route path="*" element={ <p>This page does not exist</p> } />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);


