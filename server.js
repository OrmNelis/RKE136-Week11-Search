const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/search', (req, res) => {
    res.render('search', {movieDetails:''});
});

app.post('/search', (req, res) => {
    let movieTitle = req.body.movieTitle;

    let movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=54550313e3c18136a8321c93223864f6&query=${movieTitle}`;
    let genresUrl = 'https://api.themoviedb.org/3/genre/movie/list?api_key=54550313e3c18136a8321c93223864f6&language=en-US';
   
    let endpoints = [movieUrl, genresUrl];

    axios.all(endpoints.map((endpoint) => axios.get(endpoint)))
    .then(axios.spread((movie, genres) => {
            const [general] = movie.data.results;
            const movieGenreIds = general.genre_ids;        
            const movieGenres = genres.data.genres; 
            
            let genresArray = [];
            for(let i = 0; i < movieGenreIds.length; i++) {
                for(let j = 0; j < movieGenres.length; j++) {
                    if(movieGenreIds[i] === movieGenres[j].id) {
                        genresArray.push(movieGenres[j].name)
                    }
                    
                }
            }

            let genresToDisplay = '';
            genresArray.forEach(genre => {
                genresToDisplay = genresToDisplay+ `${genre}, `;
            });

            genresToDisplay = genresToDisplay.slice(0, -2) + '.';
            

            let movieObject = {
                title: general.original_title,
                year: new Date(general.release_date).getFullYear(),
                overview: general.overview,
                posterUrl: `https://image.tmdb.org/t/p/w500/${general.poster_path}`,
                genres: genresToDisplay

            };

            res.render('search', {movieDetails: movieObject});
        })
      );
    
});

app.listen(process.env.PORT || 3000, () => {
    console.log('server is running');
});