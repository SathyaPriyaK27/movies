import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import '../styles.css';  // Import the CSS file

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous error
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      localStorage.setItem('UEMAIL', email); // Set the email in localStorage
      navigate('/home');
    } catch (error) {
      console.error('Error signing up:', error);
      setError('An error occurred while signing up. Please try again later.');
    }
  };

  return (
    <div className="sign-in-container">
      <div className="sign-in-box">
        <h2>Sign Up</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSignUp}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Sign Up</button>
        </form>
        <p>Already have an account? <a href="/">Sign In</a></p>
      </div>
    </div>
  );
};

export default SignUp;
