const db = require('../config/db');

const movieController = {
    getAllMovies: async (req, res) => {
        try {
            const [movies] = await db.query(`
                SELECT m.*, 
                       MIN(s.price) as min_price,
                       MAX(s.price) as max_price,
                       GROUP_CONCAT(DISTINCT DATE_FORMAT(s.show_date, '%Y-%m-%d')) as available_dates
                FROM movies m
                LEFT JOIN shows s ON m.id = s.movie_id
                WHERE m.is_active = true
                GROUP BY m.id
                ORDER BY m.release_date DESC
            `);
            res.json({ success: true, data: movies });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getMovieById: async (req, res) => {
        try {
            const [rows] = await db.query(
                'SELECT * FROM movies WHERE id = ? AND is_active = true', 
                [req.params.id]
            );
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Movie not found' });
            }
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getMovieShows: async (req, res) => {
        try {
            const { date } = req.query;
            let query = `
                SELECT s.*, m.name as movie_name, m.poster_url
                FROM shows s
                JOIN movies m ON s.movie_id = m.id
                WHERE s.movie_id = ? AND s.available_seats > 0
            `;
            
            const params = [req.params.id];
            
            if (date) {
                query += ' AND s.show_date = ?';
                params.push(date);
            }
            
            query += ' ORDER BY s.show_date, s.show_time';
            
            const [shows] = await db.query(query, params);
            res.json({ success: true, data: shows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = movieController;