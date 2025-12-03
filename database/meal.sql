-- CREATE DATABASE IF NOT EXISTS meals_db;
-- USE meals_db;

CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL,
    role ENUM('Admin', 'Manager', 'Soldier') NOT NULL,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    meal_type ENUM('Sáng','Trưa','Tối') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed data
INSERT INTO departments (name) VALUES ('Phòng A'),('Phòng B');

-- Mật khẩu plain text: '123456'
INSERT INTO users (name,email,password,role,department_id) VALUES
('Admin','admin','123456','Admin',NULL),
('QuanLyA','managerA','123456','Manager',1),
('QuanNhan1','soldier1','123456','Soldier',1),
('QuanNhan2','soldier2','123456','Soldier',1);
