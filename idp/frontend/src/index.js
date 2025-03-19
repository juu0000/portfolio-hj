import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

function loadRuntimeConfig(){
  return new Promise((resolve, reject) => {
    if(process.env.NODE_ENV !=='production'){
      return resolve();
    }
    const script = document.createElement('script');
    script.src = 'config.js';
    script.async = false;
    script.onload = () => {
      console.log("config.js loaded successfully.");
      resolve();
    }
    script.onerror = () => reject(new Error('Failed to load config.js'));
    document.head.appendChild(script);
  });
}

loadRuntimeConfig()
  .then(()=>{
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // If you want to start measuring performance in your app, pass a function
    // to log results (for example: reportWebVitals(console.log))
    // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
    reportWebVitals();
  })
  .catch((error) => {
    console.error("Runtime config loading error:", error);

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // If you want to start measuring performance in your app, pass a function
    // to log results (for example: reportWebVitals(console.log))
    // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
    reportWebVitals();
  });


