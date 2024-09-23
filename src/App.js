import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import styles from './App.module.css';

const Home = () => <h1>Welcome to Happy Carpenter</h1>;

function App() {
  return (
    <Router>
      <div className={styles.App}>
        <Header />
        <main className={styles.Main}>
          <div className={styles.Content}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;