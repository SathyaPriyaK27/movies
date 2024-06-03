import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust the path to your firebaseConfig
import './searchMovies.css';  // Import the specific CSS file

const SearchMovies = ({ setSelectedMovie }) => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovieState] = useState(null);
  const [privateList, setPrivateList] = useState([]);
  const [publicList, setPublicList] = useState([]);
  const [movieLists, setMovieLists] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const userEmail = localStorage.getItem('UEMAIL');
  const apiKey = process.env.REACT_APP_OMDB_API_KEY;

  useEffect(() => {
    fetchMovieLists();
    fetchAllMovieLists();
  }, []);

  const fetchMovieLists = async () => {
    try {
      const listRef = doc(db, 'MovieList', userEmail);
      const docSnap = await getDoc(listRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        await fetchMovieDetails(data.private, setPrivateList);
        await fetchMovieDetails(data.public, setPublicList);
      }
    } catch (error) {
      console.error('Error fetching movie lists:', error);
    }
  };

  const fetchMovieDetails = async (movieTitles, setList) => {
    const detailedMovies = await Promise.all(
      movieTitles.map(async (title) => {
        const response = await fetch(`https://www.omdbapi.com/?t=${title}&apikey=${apiKey}`);
        return await response.json();
      })
    );
    setList(detailedMovies);
  };

  const fetchAllMovieLists = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'movieLists'));
      const lists = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().email === userEmail) {
          lists.push({ id: doc.id, name: doc.data().name });
        }
      });
      setMovieLists(lists);
    } catch (error) {
      console.error('Error fetching all movie lists:', error);
    }
  };

  const handleSearch = async () => {
    setError(''); // Reset error message
    if (query.trim() === '') {
      setError('Please enter a movie title.');
      return;
    }

    const url = `https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.Response === 'True') {
        setMovies(data.Search);
      } else {
        setError(data.Error);
      }
    } catch (error) {
      setError('An error occurred while fetching data.');
      console.error('Error fetching data from OMDB API:', error);
    }
  };

  const handleSelectMovie = (movie) => {
    setSelectedMovieState(movie);
  };

  const handleAddToCollection = async (movie) => {
    if (!selectedList) {
      setError('Please select a list.');
      return;
    }

    try {
      const listRef = doc(db, 'movieLists', selectedList);
      const docSnap = await getDoc(listRef);

      if (!docSnap.exists()) {
        setError('Selected list does not exist.');
        return;
      }

      const movieToAdd = {
        title: movie.Title,
        imdbID: movie.imdbID

      };

      await updateDoc(listRef, {
        movies: arrayUnion(movieToAdd)
      });

      console.log(`Added movie ${movie.Title} to list ${selectedList}`);

      // Fetch updated lists
      fetchMovieLists();

      // Reset state
      setSelectedMovieState(null);
      setMovies([]); // Clear movie list after selecting a movie
    } catch (error) {
      setError('Error adding movie to list.');
      console.error('Error adding movie to list:', error);
    }
  };

  return (
    <div className="search-container">
      <h2>Search Movies</h2>
      <div className="search-box">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a movie..."
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">Search</button>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="movies-container">
        {movies.map((movie) => (
          <div key={movie.imdbID} className="movie-item">
            <div className="movie-details">
              <h3>{movie.Title}</h3>
              <p>{movie.Year}</p>
              {movie.Poster !== 'N/A' && (
                <img src={movie.Poster} alt={movie.Title} className="movie-poster" />
                
              )}
            </div>
            <div className="movie-actions">
              <select
                value={selectedList}
                onChange={(e) => setSelectedList(e.target.value)}
                className="movie-list-select"
              >
                <option value="" disabled>Select List</option>
                {movieLists.map((list) => (
                  <option key={list.id} value={list.id}>{list.name}</option>
                ))}
              </select>
              <button 
                onClick={() => handleAddToCollection(movie)} 
                className="add-button"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchMovies;
