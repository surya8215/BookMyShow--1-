const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// Initialize express app
const app = express();
// Load environment variables
dotenv.config();
app.use(express.static('public'));
// Import routes
const movieRoutes = require('./routes/movieRoutes');
const bookingRoutes = require('./routes/bookingRoutes');



// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', movieRoutes);
app.use('/api', bookingRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'BookMyShow API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});