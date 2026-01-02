// BookMyShow Clone - Frontend JavaScript
const API_BASE_URL =  window.location.origin + '/api';
let currentMovieId = null;
let selectedShowId = null;
let currentShowPrice = 0;
let allMovies = [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('BookMyShow Clone Initializing...');
    loadMovies();
    loadWeather();
    setupEventListeners();
    
    // Check if server is running
    checkServerHealth();
});

// Check server health
async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        if (data.success) {
            console.log('✅ Server is running');
        }
    } catch (error) {
        console.error('❌ Server connection failed:', error);
        showNotification('Cannot connect to server. Please make sure the backend is running.', 'danger');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Booking form submission
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    // Update total amount when seats change
    const seatsInput = document.getElementById('seats');
    if (seatsInput) {
        seatsInput.addEventListener('input', updateTotalAmount);
    }
    
    // Search input with debounce
    const searchInput = document.getElementById('search-movies');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchMovies();
            }, 500);
        });
    }
}

// Load movies from backend
async function loadMovies() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/movies`);
        const data = await response.json();
        
        if (data.success) {
            allMovies = data.data;
            displayMovies(allMovies);
            showNotification(`Loaded ${allMovies.length} movies`, 'success');
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        showNotification('Failed to load movies. Using sample data.', 'warning');
        displayMovies(getSampleMovies());
    } finally {
        showLoading(false);
    }
}

// Display movies in grid
function displayMovies(movies) {
    const container = document.getElementById('movies-container');
    const noResults = document.getElementById('no-results');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!movies || movies.length === 0) {
        container.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    if (noResults) noResults.style.display = 'none';
    container.style.display = 'flex';
    
    movies.forEach((movie, index) => {
        const movieCard = createMovieCard(movie, index);
        container.appendChild(movieCard);
    });
}

// Create movie card element
function createMovieCard(movie, index) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 col-xl-3';
    col.style.animationDelay = `${index * 0.1}s`;
    
    const priceRange = movie.min_price === movie.max_price 
        ? `₹${movie.min_price}` 
        : `₹${movie.min_price} - ₹${movie.max_price}`;
    
    col.innerHTML = `
        <div class="movie-card h-100">
            <div class="movie-poster-container">
                <img src="${movie.poster_url}" 
                     class="movie-poster" 
                     alt="${movie.name}"
                     onerror="this.src=''">
                <div class="movie-rating-badge">
                    <i class="fas fa-star me-1"></i>${movie.rating || 'N/A'}
                </div>
            </div>
            <div class="movie-info">
                <h5 class="movie-title">${movie.name}</h5>
                <div class="movie-meta">
                    <span class="movie-genre">${movie.genre?.split(',')[0] || 'Movie'}</span>
                    <span class="movie-language">${movie.language || 'English'}</span>
                </div>
                <p class="text-muted small mb-3">${movie.duration || 'Duration not specified'}</p>
                <div class="movie-price-info">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="movie-price-label">Starting from</div>
                            <div class="movie-price">${priceRange}</div>
                        </div>
                        <button class="btn btn-primary btn-book-now" onclick="showMovieDetails(${movie.id})">
                            <i class="fas fa-ticket-alt me-2"></i>Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Show movie details modal
async function showMovieDetails(movieId) {
    currentMovieId = movieId;
    showLoading(true);
    
    try {
        // Load movie details
        const movieResponse = await fetch(`${API_BASE_URL}/movies/${movieId}`);
        const movieData = await movieResponse.json();
        
        // Load shows for this movie
        const showsResponse = await fetch(`${API_BASE_URL}/movies/${movieId}/shows`);
        const showsData = await showsResponse.json();
        
        if (movieData.success && showsData.success) {
            const movie = movieData.data;
            const shows = showsData.data;
            
            // Update modal title
            document.getElementById('movieModalTitle').textContent = movie.name;
            
            // Display movie details
            const detailsDiv = document.getElementById('movie-details');
            detailsDiv.innerHTML = `
                <div class="row">
                    <div class="col-md-4">
                        <img src="${movie.poster_url}" 
                             class="img-fluid rounded shadow" 
                             alt="${movie.name}"
                             style="max-height: 400px; object-fit: cover;">
                    </div>
                    <div class="col-md-8">
                        <h4 class="mb-3">${movie.name}</h4>
                        <div class="row mb-3">
                            <div class="col-6">
                                <strong><i class="fas fa-film me-2"></i>Genre:</strong><br>
                                <span class="text-muted">${movie.genre || 'N/A'}</span>
                            </div>
                            <div class="col-6">
                                <strong><i class="fas fa-clock me-2"></i>Duration:</strong><br>
                                <span class="text-muted">${movie.duration || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-6">
                                <strong><i class="fas fa-language me-2"></i>Language:</strong><br>
                                <span class="text-muted">${movie.language || 'N/A'}</span>
                            </div>
                            <div class="col-6">
                                <strong><i class="fas fa-star me-2"></i>Rating:</strong><br>
                                <span class="text-muted">${movie.rating || 'N/A'}/10</span>
                            </div>
                        </div>
                        <div class="mb-3">
                            <strong><i class="fas fa-calendar me-2"></i>Release Date:</strong><br>
                            <span class="text-muted">${movie.release_date ? new Date(movie.release_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : 'N/A'}</span>
                        </div>
                        <div class="mb-3">
                            <strong><i class="fas fa-info-circle me-2"></i>Description:</strong><br>
                            <p class="text-muted mt-2">${movie.description || 'No description available.'}</p>
                        </div>
                    </div>
                </div>
            `;
            
            // Display shows
            const showsList = document.getElementById('shows-list');
            const noShows = document.getElementById('no-shows');
            
            if (shows.length > 0) {
                showsList.innerHTML = shows.map(show => {
                    const showDate = new Date(show.show_date);
                    const formattedDate = showDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    });
                    
                    return `
                        <div class="show-card">
                            <div class="row align-items-center">
                                <div class="col-lg-3 mb-3 mb-lg-0">
                                    <div class="show-date">${formattedDate}</div>
                                    <div class="show-time">${show.show_time.substring(0, 5)}</div>
                                </div>
                                <div class="col-lg-4 mb-3 mb-lg-0">
                                    <div class="show-theater">${show.theater_name}</div>
                                    <div class="show-location">${show.theater_location}</div>
                                </div>
                                <div class="col-lg-3 mb-3 mb-lg-0">
                                    <div class="show-price">₹${show.price}</div>
                                    <div class="seats-available">${show.available_seats} seats available</div>
                                </div>
                                <div class="col-lg-2">
                                    <button class="btn btn-book-now w-100" 
                                            onclick="bookShow(${show.id}, '${show.movie_name}', '${show.show_date}', '${show.show_time}', '${show.theater_name}', ${show.price})">
                                        Book
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
                
                showsList.style.display = 'block';
                if (noShows) noShows.style.display = 'none';
            } else {
                showsList.style.display = 'none';
                if (noShows) noShows.style.display = 'block';
            }
            
            // Show modal
            const movieModal = new bootstrap.Modal(document.getElementById('movieModal'));
            movieModal.show();
            
        } else {
            throw new Error('Failed to load movie details');
        }
    } catch (error) {
        console.error('Error loading movie details:', error);
        showNotification('Failed to load movie details. Please try again.', 'danger');
    } finally {
        showLoading(false);
    }
}

// Book a show
function bookShow(showId, movieName, showDate, showTime, theaterName, price) {
    selectedShowId = showId;
    currentShowPrice = price;
    
    const showInfo = document.getElementById('show-info');
    const showDateObj = new Date(showDate);
    const formattedDate = showDateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    showInfo.innerHTML = `
        <h6 class="mb-2">${movieName}</h6>
        <div class="row">
            <div class="col-6">
                <small><i class="fas fa-calendar me-1"></i> ${formattedDate}</small><br>
                <small><i class="fas fa-clock me-1"></i> ${showTime.substring(0, 5)}</small>
            </div>
            <div class="col-6 text-end">
                <small><i class="fas fa-building me-1"></i> ${theaterName}</small><br>
                <small><i class="fas fa-rupee-sign me-1"></i> ₹${price} per ticket</small>
            </div>
        </div>
    `;
    
    // Update total amount
    updateTotalAmount();
    
    // Show booking modal
    const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
    bookingModal.show();
}

// Update total amount based on seats
function updateTotalAmount() {
    const seatsInput = document.getElementById('seats');
    const totalAmountDiv = document.getElementById('total-amount');
    
    if (seatsInput && totalAmountDiv && currentShowPrice) {
        const seats = parseInt(seatsInput.value) || 1;
        const total = seats * currentShowPrice;
        totalAmountDiv.textContent = `₹${total}`;
    }
}

// Handle booking submission
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const bookingData = {
        show_id: selectedShowId,
        customer_name: document.getElementById('customer-name').value.trim(),
        customer_email: document.getElementById('customer-email').value.trim(),
        customer_phone: document.getElementById('customer-phone').value.trim(),
        seats_booked: parseInt(document.getElementById('seats').value) || 1
    };
    
    // Validate input
    if (!bookingData.customer_name || !bookingData.customer_email || !bookingData.customer_phone) {
        showNotification('Please fill in all required fields.', 'warning');
        return;
    }
    
    if (!validateEmail(bookingData.customer_email)) {
        showNotification('Please enter a valid email address.', 'warning');
        return;
    }
    
    if (!validatePhone(bookingData.customer_phone)) {
        showNotification('Please enter a valid 10-digit phone number.', 'warning');
        return;
    }
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success modal
            document.getElementById('booking-id-display').textContent = result.data.booking_id;
            document.getElementById('success-message').textContent = result.message;
            
            // Hide booking modal and show success modal
            const bookingModal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
            bookingModal.hide();
            
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
            
            // Reset form
            document.getElementById('booking-form').reset();
            updateTotalAmount();
            
            // Reload movies to update available seats
            setTimeout(() => {
                loadMovies();
            }, 2000);
            
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Booking error:', error);
        showNotification(`Booking failed: ${error.message}`, 'danger');
    } finally {
        showLoading(false);
    }
}

// Show booking modal (My Bookings)
async function showBookingModal() {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        const data = await response.json();
        
        const bookingsList = document.getElementById('bookings-list');
        const noBookings = document.getElementById('no-bookings');
        
        if (data.success && data.data && data.data.length > 0) {
            bookingsList.innerHTML = data.data.map(booking => {
                const bookingDate = new Date(booking.booking_date);
                const showDate = new Date(booking.show_date);
                
                return `
                    <div class="booking-item mb-3">
                        <div class="row align-items-center">
                            <div class="col-md-2 text-center mb-3 mb-md-0">
                                <div class="bg-primary text-white rounded p-3">
                                    <div class="fw-bold">${booking.seats_booked}</div>
                                    <small>Seats</small>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3 mb-md-0">
                                <h6 class="mb-1">${booking.movie_name}</h6>
                                <p class="mb-1 small">
                                    <i class="fas fa-calendar me-1"></i> ${showDate.toLocaleDateString()} at ${booking.show_time.substring(0, 5)}<br>
                                    <i class="fas fa-building me-1"></i> ${booking.theater_name}<br>
                                    <i class="fas fa-ticket-alt me-1"></i> Booking ID: ${booking.booking_id}
                                </p>
                            </div>
                            <div class="col-md-4 text-md-end">
                                <div class="fw-bold text-success">₹${booking.total_amount}</div>
                                <small class="text-muted">Booked on ${bookingDate.toLocaleDateString()}</small><br>
                                <span class="badge bg-success mt-1">${booking.status}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            bookingsList.style.display = 'block';
            if (noBookings) noBookings.style.display = 'none';
        } else {
            bookingsList.style.display = 'none';
            if (noBookings) noBookings.style.display = 'block';
        }
        
        const viewBookingsModal = new bootstrap.Modal(document.getElementById('viewBookingsModal'));
        viewBookingsModal.show();
        
    } catch (error) {
        console.error('Error loading bookings:', error);
        showNotification('Failed to load bookings. Please try again.', 'danger');
    }
}

// Load live weather
async function loadWeather() {
    try {
        const response = await fetch(`${API_BASE_URL}/weather`);
        const data = await response.json();
        
        if (data.success) {
            const weather = data.data;
            document.getElementById('weather-temp').textContent = `${weather.temperature}°C`;
            document.getElementById('weather-city').textContent = weather.city;
            
            // Add weather icon
            const weatherIcon = document.createElement('i');
            weatherIcon.className = getWeatherIcon(weather.description);
            weatherIcon.style.marginRight = '5px';
            
            const tempSpan = document.getElementById('weather-temp');
            tempSpan.parentNode.insertBefore(weatherIcon, tempSpan);
        }
    } catch (error) {
        console.error('Error loading weather:', error);
        // Set default weather
        document.getElementById('weather-temp').textContent = `28°C`;
        document.getElementById('weather-city').textContent = 'Pune';
    }
}

// Get weather icon based on description
function getWeatherIcon(description) {
    const desc = description.toLowerCase();
    if (desc.includes('sunny')) return 'fas fa-sun';
    if (desc.includes('cloud')) return 'fas fa-cloud';
    if (desc.includes('rain')) return 'fas fa-cloud-rain';
    if (desc.includes('clear')) return 'fas fa-sun';
    return 'fas fa-cloud-sun';
}

// Search movies
function searchMovies() {
    const searchTerm = document.getElementById('search-movies').value.toLowerCase();
    const filterGenre = document.getElementById('filter-genre').value;
    
    if (!searchTerm && !filterGenre) {
        displayMovies(allMovies);
        return;
    }
    
    const filteredMovies = allMovies.filter(movie => {
        const matchesSearch = !searchTerm || 
            movie.name.toLowerCase().includes(searchTerm) ||
            movie.genre?.toLowerCase().includes(searchTerm) ||
            movie.language?.toLowerCase().includes(searchTerm) ||
            movie.description?.toLowerCase().includes(searchTerm);
        
        const matchesFilter = !filterGenre || 
            movie.genre?.toLowerCase().includes(filterGenre.toLowerCase());
        
        return matchesSearch && matchesFilter;
    });
    
    displayMovies(filteredMovies);
}

// Filter movies by genre
function filterMovies() {
    searchMovies();
}

// Show/hide loading spinner
function showLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification alert alert-${type} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^\d{10}$/;
    return re.test(phone);
}

// Sample movies for fallback
function getSampleMovies() {
    return [
        {
            id: 1,
            name: 'Sample Movie 1',
            description: 'This is a sample movie description.',
            genre: 'Action, Drama',
            duration: '2h 30m',
            language: 'English',
            rating: 7.5,
            poster_url: '',
            min_price: 300,
            max_price: 500
        },
        {
            id: 2,
            name: 'Sample Movie 2',
            description: 'Another sample movie for testing.',
            genre: 'Comedy',
            duration: '1h 45m',
            language: 'Hindi',
            rating: 8.0,
            poster_url: '',
            min_price: 250,
            max_price: 400
        }
    ];
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .custom-notification.fade {
        animation: slideOut 0.3s ease forwards;
    }
`;
document.head.appendChild(style);