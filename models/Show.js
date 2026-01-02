const db = require('../config/db');

class Show {
    static async getShowById(id) {
        const [rows] = await db.query(`
            SELECT s.*, m.name as movie_name, m.poster_url
            FROM shows s
            JOIN movies m ON s.movie_id = m.id
            WHERE s.id = ?
        `, [id]);
        return rows[0];
    }

    static async updateAvailableSeats(showId, seatsBooked) {
        await db.query(
            'UPDATE shows SET available_seats = available_seats - ? WHERE id = ? AND available_seats >= ?',
            [seatsBooked, showId, seatsBooked]
        );
    }
}

module.exports = Show;