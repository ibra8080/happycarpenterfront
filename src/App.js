import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import styles from './App.module.css'; // We'll create this CSS module file

const Home = () => <h1>Welcome to Happy Carpenter</h1>;
const Login = () => <h2>Login Page</h2>;
const Register = () => <h2>Register Page</h2>;

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