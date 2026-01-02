CREATE DATABASE IF NOT EXISTS bookmyshow_db;
USE bookmyshow_db;

-- Movies Table
CREATE TABLE movies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    duration VARCHAR(50),
    language VARCHAR(50),
    rating DECIMAL(3,1),
    poster_url VARCHAR(500),
    trailer_url VARCHAR(500),
    release_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shows Table
CREATE TABLE shows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    theater_name VARCHAR(255) NOT NULL,
    theater_location VARCHAR(500),
    price DECIMAL(8,2) NOT NULL,
    total_seats INT DEFAULT 100,
    available_seats INT DEFAULT 100,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- Bookings Table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    show_id INT,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    seats_booked INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'cancelled', 'pending') DEFAULT 'confirmed',
    payment_id VARCHAR(100),
    FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE
);

-- Insert Sample Movies
INSERT INTO movies (name, description, genre, duration, language, rating, poster_url, release_date) VALUES
('Avengers: Endgame', 'The remaining Avengers must figure out a way to bring back their vanquished allies for a final showdown with Thanos.', 'Action, Adventure, Drama', '3h 2m', 'English', 8.4, 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg', '2024-04-26'),
('The Batman', 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate.', 'Action, Crime, Drama', '2h 56m', 'English', 7.8, 'https://m.media-amazon.com/images/M/MV5BMDdmMTBiNTYtMDIzNi00NGVlLWIzMDYtZTk3MTQ3NGQxZGEwXkEyXkFqcGdeQXVyMzMwOTU5MDk@._V1_.jpg', '2024-03-04'),
('RRR', 'A fictitious story about two legendary revolutionaries and their journey away from home before they started fighting for their country.', 'Action, Drama', '3h 7m', 'Telugu', 8.0, 'https://m.media-amazon.com/images/M/MV5BODUwNDNjYzctODUxNy00ZTA2LWIyYTEtMDc5Y2E5ZjBmNTMzXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_FMjpg_UX1000_.jpg', '2024-01-07');

-- Insert Sample Shows
INSERT INTO shows (movie_id, show_date, show_time, theater_name, theater_location, price, total_seats, available_seats) VALUES
(1, '2024-12-20', '10:00:00', 'PVR Cinemas', 'Phoenix Marketcity, Pune', 350.00, 100, 85),
(1, '2024-12-20', '14:00:00', 'INOX', 'Amanora Town Centre, Pune', 400.00, 120, 100),
(2, '2024-12-20', '18:00:00', 'Cinepolis', 'Seasons Mall, Pune', 450.00, 150, 120),
(3, '2024-12-21', '11:00:00', 'City Pride', 'Kothrud, Pune', 300.00, 80, 60);