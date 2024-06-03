import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, updateDoc, arrayUnion, arrayRemove, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthProvider';
import './movieList.css';  // Import the CSS file
import { useNavigate } from 'react-router-dom';

const MovieList = () => {
  const { currentUser } = useAuth();
  const [movieLists, setMovieLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [listVisibility, setListVisibility] = useState('public');
  const [selectedListId, setSelectedListId] = useState('');
  const [selectedMovie, setSelectedMovie] = useState('');
  const [error, setError] = useState('');
  const [movies, setMovies] = useState([]);
  const [showPublicLists, setShowPublicLists] = useState(false);
  const [showPrivateLists, setShowPrivateLists] = useState(false);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [genre, setGenre] = useState('horror');
  const userEmail = localStorage.getItem('UEMAIL');
  const Navigate = useNavigate();
  

  useEffect(() => {
    if (currentUser) {
      const fetchLists = async () => {
        try {
          const q = query(collection(db, 'movieLists'), where('userId', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          const lists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMovieLists(lists);
        } catch (error) {
          console.error('Error fetching movie lists:', error);
        }
      };
      fetchLists();
    }
  }, [currentUser]);

  useEffect(() => {
    // Fetch recommended movies based on selected genres and popular movies
    const fetchRecommendedMovies = async () => {
      try {
        const responseAnimation = await fetch(`https://www.omdbapi.com/?s=animation&apikey=${process.env.REACT_APP_OMDB_API_KEY}`);
        const responseHorror = await fetch(`https://www.omdbapi.com/?s=horror&apikey=${process.env.REACT_APP_OMDB_API_KEY}`);
        const responseComedy = await fetch(`https://www.omdbapi.com/?s=comedy&apikey=${process.env.REACT_APP_OMDB_API_KEY}`);
        const responseLove = await fetch(`https://www.omdbapi.com/?s=love&apikey=${process.env.REACT_APP_OMDB_API_KEY}`);
        const responsePopular = await fetch(`https://www.omdbapi.com/?s=popular&apikey=${process.env.REACT_APP_OMDB_API_KEY}`);
  
        const dataAnimation = await responseAnimation.json();
        const dataHorror = await responseHorror.json();
        const dataComedy = await responseComedy.json();
        
        const dataPopular = await responsePopular.json();
  
        const recommendedMovies = [
          ...dataAnimation.Search,
          ...dataHorror.Search,
          ...dataComedy.Search,
          
          ...dataPopular.Search.slice(0, 10), // include top 10 popular movies
        ];
  
        if (recommendedMovies) {
          setRecommendedMovies(recommendedMovies);
        } else {
          setError('No recommended movies found.');
        }
      } catch (error) {
        setError('Error fetching recommended movies.');
        console.error('Error fetching recommended movies:', error);
      }
    };
    fetchRecommendedMovies();
  }, []);
  

  
  

  const createList = async () => {
    if (!newListName.trim()) {
      setError('List name cannot be empty.');
      return;
    }

    try {
      await addDoc(collection(db, 'movieLists'), {
        name: newListName,
        userId: currentUser.uid,
        email: userEmail,
        visibility: listVisibility,
        movies: [],
      });
      setNewListName('');
      setListVisibility('public');
      
      // Fetch lists again to update UI
      const q = query(collection(db, 'movieLists'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const lists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMovieLists(lists);
      Navigate('/home')
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleAddMovieToList = async () => {
    if (!selectedListId || !selectedMovie) {
      setError('Please select a list and a movie.');
      return;
    }
    try {
      const listRef = doc(db, 'movieLists', selectedListId);
      const selectedMovieObject = movies.find(movie => movie.imdbID === selectedMovie);
      await updateDoc(listRef, {
        movies: arrayUnion(selectedMovieObject),
      });
      // Reset selected movie
      setSelectedMovie('');
    } catch (error) {
      setError('Error adding movie to list.');
      console.error('Error adding movie to list:', error);
    }
  };

  const handleRemoveMovieFromList = async (listId, movie) => {
    try {
      const listRef = doc(db, 'movieLists', listId);
      await updateDoc(listRef, {
        movies: arrayRemove(movie),
      });
    } catch (error) {
      setError('Error removing movie from list.');
      console.error('Error removing movie from list:', error);
    }
  };

  return (
    <div className="movie-list-container">
      <h3>My Movie Lists</h3>
      <div className="create-list-box">
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New list name"
          className="create-list-input"
        />
        <select 
          value={listVisibility} 
          onChange={(e) => setListVisibility(e.target.value)} 
          className="create-list-select"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <button onClick={createList} className="create-list-button">Create List</button>
      </div>
      
      <div className="list-container">
        {movieLists.map((list) => (
          (list.visibility === 'public' && showPublicLists) ||
          (list.visibility === 'private' && showPrivateLists)
          ? (
            <div key={list.id} className="list-item">
              <h4>{list.name} ({list.visibility})</h4>
              <ul>
                {list.movies.map((movie) => (
                  <li key={movie.imdbID}>
                    {movie.Title}
                    <button onClick={() => handleRemoveMovieFromList(list.id, movie)} className="remove-button">Remove</button>
                  </li>
                ))}
              </ul>
              <button onClick={() => setSelectedListId(list.id)} className="add-movie-button">Add Movie to List</button>
            </div>
          ) : null
        ))}
        {selectedListId && (
          <div className="add-movie-container">
            <h4>Add Movie to Selected List</h4>
            <select 
              value={selectedMovie} 
              onChange={(e) => setSelectedMovie(e.target.value)} 
              className="add-movie-select"
            >
              <option value="">Select Movie</option>
              {movies.map((movie) => (
                <option key={movie.imdbID} value={movie.imdbID}>{movie.Title}</option>
              ))}
            </select>
            <button onClick={handleAddMovieToList} className="add-movie-button">Add Movie</button>
          </div>
        )}
      </div>
      {error && <p className="error-message">{error}</p>}

      <div className="recommendations-container">
        <h3>Recommended Movies</h3>
        <div className="genre-buttons">
          <button onClick={() => setGenre('horror')} className="genre-button">Horror</button>
          <button onClick={() => setGenre('love')} className="genre-button">Love</button>
          <button onClick={() => setGenre('comedy')} className="genre-button">Comedy</button>
        </div>
        <div className="recommended-movies">
          {recommendedMovies.map((movie) => (
            <div key={movie.imdbID} className="recommended-movie">
              <img src={movie.Poster} alt={movie.Title} className="recommended-movie-poster" />
              <h4>{movie.Title}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieList;
