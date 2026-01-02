const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// Movie routes
router.get('/movies', movieController.getAllMovies);
router.get('/movies/:id', movieController.getMovieById);
router.get('/movies/:id/shows', movieController.getMovieShows);

module.exports = router;