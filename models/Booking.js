const db = require('../config/db');

class Booking {
    static async createBooking(bookingData) {
        const { show_id, customer_name, customer_email, customer_phone, seats_booked } = bookingData;
        
        // Get show details
        const [showRows] = await db.query('SELECT * FROM shows WHERE id = ?', [show_id]);
        const show = showRows[0];
        const total_amount = show.price * seats_booked;
        
        // Generate booking ID
        const booking_id = 'BMS' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        const [result] = await db.query(
            'INSERT INTO bookings (booking_id, show_id, customer_name, customer_email, customer_phone, seats_booked, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [booking_id, show_id, customer_name, customer_email, customer_phone, seats_booked, total_amount]
        );
        
        // Update available seats
        await db.query(
            'UPDATE shows SET available_seats = available_seats - ? WHERE id = ?',
            [seats_booked, show_id]
        );
        
        return { booking_id, bookingId: result.insertId, total_amount };
    }

    static async getAllBookings() {
        const [rows] = await db.query(`
            SELECT b.*, s.show_date, s.show_time, s.theater_name, m.name as movie_name
            FROM bookings b
            JOIN shows s ON b.show_id = s.id
            JOIN movies m ON s.movie_id = m.id
            ORDER BY b.booking_date DESC
            LIMIT 50
        `);
        return rows;
    }
}

module.exports = Booking;