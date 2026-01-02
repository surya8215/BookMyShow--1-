const db = require('../config/db');

class Movie {
    static async getAllMovies() {
        const [rows] = await db.query(`
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
        return rows;
    }

    static async getMovieById(id) {
        const [rows] = await db.query('SELECT * FROM movies WHERE id = ? AND is_active = true', [id]);
        return rows[0];
    }

    static async getShowsByMovieId(movieId, date = null) {
        let query = `
            SELECT s.*, m.name as movie_name, m.poster_url
            FROM shows s
            JOIN movies m ON s.movie_id = m.id
            WHERE s.movie_id = ? AND s.available_seats > 0
        `;
        
        const params = [movieId];
        
        if (date) {
            query += ' AND s.show_date = ?';
            params.push(date);
        }
        
        query += ' ORDER BY s.show_date, s.show_time';
        
        const [rows] = await db.query(query, params);
        return rows;
    }
}

module.exports = Movie;