import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import '../styles.css';  // Import the CSS file

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous error

    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('UEMAIL', email); // Set the email in localStorage
      navigate('/home');
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError('An error occurred while signing in. Please try again later.');
        console.error('Error signing in:', error);
      }
    }
  };

  return (
    <div className="sign-in-container">
      <div className="sign-in-box">
        <h2>Sign In</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSignIn}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email or mobile number"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Sign In</button>
        </form>
        <div className="additional-options">
          
          <p>New to app? <a href="/signup">Sign up now.</a></p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
