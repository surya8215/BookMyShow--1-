const db = require('../config/db');

const bookingController = {
    createBooking: async (req, res) => {
        try {
            const { show_id, customer_name, customer_email, customer_phone, seats_booked } = req.body;
            
            // Validate input
            if (!show_id || !customer_name || !customer_email || !seats_booked) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }
            
            // Get show details
            const [showRows] = await db.query(
                'SELECT * FROM shows WHERE id = ?', 
                [show_id]
            );
            
            if (showRows.length === 0) {
                return res.status(404).json({ success: false, message: 'Show not found' });
            }
            
            const show = showRows[0];
            
            if (show.available_seats < seats_booked) {
                return res.status(400).json({ success: false, message: 'Not enough seats available' });
            }
            
            const total_amount = show.price * seats_booked;
            const booking_id = 'BMS' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
            
            // Create booking
            const [bookingResult] = await db.query(
                'INSERT INTO bookings (booking_id, show_id, customer_name, customer_email, customer_phone, seats_booked, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [booking_id, show_id, customer_name, customer_email, customer_phone, seats_booked, total_amount]
            );
            
            // Update available seats
            await db.query(
                'UPDATE shows SET available_seats = available_seats - ? WHERE id = ?',
                [seats_booked, show_id]
            );
            
            res.status(201).json({ 
                success: true, 
                message: 'Booking confirmed successfully!',
                data: { 
                    booking_id: booking_id,
                    bookingId: bookingResult.insertId,
                    total_amount: total_amount
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getAllBookings: async (req, res) => {
        try {
            const [bookings] = await db.query(`
                SELECT b.*, s.show_date, s.show_time, s.theater_name, m.name as movie_name
                FROM bookings b
                JOIN shows s ON b.show_id = s.id
                JOIN movies m ON s.movie_id = m.id
                ORDER BY b.booking_date DESC
                LIMIT 50
            `);
            res.json({ success: true, data: bookings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getBookingById: async (req, res) => {
        try {
            const [rows] = await db.query(`
                SELECT b.*, s.show_date, s.show_time, s.theater_name, s.theater_location, 
                       s.price, m.name as movie_name, m.poster_url
                FROM bookings b
                JOIN shows s ON b.show_id = s.id
                JOIN movies m ON s.movie_id = m.id
                WHERE b.booking_id = ? OR b.id = ?
            `, [req.params.id, req.params.id]);
            
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = bookingController;