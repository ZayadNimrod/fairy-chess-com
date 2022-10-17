import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const r = document.getElementById('root');
if (r!=null){
ReactDOM.createRoot(r).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
}else{
    console.log("Page root not found!");
}