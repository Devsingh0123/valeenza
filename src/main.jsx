import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { ToastContainer } from 'react-toastify';

import App from './App.jsx';
import './index.css';
import { store } from './redux/store.js';

createRoot(document.getElementById('root')).render(
  <>
    <ToastContainer position="top-right" autoClose={2000} style={{ zIndex: 999999 }} />
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </>
);