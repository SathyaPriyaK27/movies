// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Home from './components/Home';
import SearchMovies from './components/SearchMovies';
import MovieList from './components/MovieList';
import ProtectedRoute from './components/ProtectedRoute';
import Display from './components/Display'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<SignIn />} />
            <Route path="/search" element={<SearchMovies/>} />
            <Route path="/list" element={<MovieList/>} />
            <Route path="/display" element={<Display/>} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
