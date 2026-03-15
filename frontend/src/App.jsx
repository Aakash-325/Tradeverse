import react from 'react';
import AppRouter from './router';
import { ToastContainer } from "react-toastify";
import SocketInitializer from './utils/SocketInitializer';

function App() {
  return (
    <>
    <AppRouter />
    <ToastContainer />
    <SocketInitializer />
    </>
  );
}

export default App;
