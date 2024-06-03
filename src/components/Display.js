import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './Display.css';

const Home = () => {
  const [userEmail, setUserEmail] = useState(localStorage.getItem('UEMAIL'));
  const [movieLists, setMovieLists] = useState([]);
  const [movieDetails, setMovieDetails] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMovieLists();
  }, [userEmail]);

  useEffect(() => {
    movieLists.forEach(list => {
      list.movies.forEach(movie => {
        fetchMovieDetails(movie.imdbID);
      });
    });
  }, [movieLists]);

  const fetchMovieLists = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'movieLists'));
      const lists = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.visibility === 'public' || (data.visibility === 'private' && data.email === userEmail)) {
          lists.push({ id: doc.id, name: data.name, movies: data.movies, visi: data.visibility });
        }
      });
      setMovieLists(lists);
    } catch (error) {
      console.error('Error fetching movie lists:', error);
      setError('Error fetching movie lists');
    }
  };

  const fetchMovieDetails = async (imdbID) => {
    const apiKey = process.env.REACT_APP_OMDB_API_KEY;
    const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      setMovieDetails((prevDetails) => ({
        ...prevDetails,
        [imdbID]: data,
      }));
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Explore Movies</h1>
      </div>
      {error && <div className="error">{error}</div>}
      {movieLists.map((list) => (
        <div key={list.id} className="movie-list">
          <h3>{list.name} - {list.visi}</h3>
          <div className="scrolling-container">
            {list.movies.map((movie) => (
              <div key={movie.imdbID} className="movie-item">
                <div>
                  <h3>{movie.title}</h3>
                  {movieDetails[movie.imdbID] && (
                    <>
                      <p>{movieDetails[movie.imdbID].Year}</p>
                      {movieDetails[movie.imdbID].Poster !== 'N/A' && (
                        <img src={movieDetails[movie.imdbID].Poster} alt={movieDetails[movie.imdbID].Title} />
                      )}
                      <p>Director: {movieDetails[movie.imdbID].Director}</p>
                      <p>Plot: {movieDetails[movie.imdbID].Plot}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;