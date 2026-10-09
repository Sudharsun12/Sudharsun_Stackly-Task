-- ============================================================
-- EDABIP Mini — MySQL Schema
-- Run this entire file in MySQL Workbench 8.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS edabip_mini;
USE edabip_mini;

CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100)  NOT NULL,
    email      VARCHAR(100)  NOT NULL UNIQUE,
    password   VARCHAR(255)  NOT NULL,
    role       ENUM('admin','analyst','viewer') DEFAULT 'viewer',
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS metrics (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT            NOT NULL,
    metric_name   VARCHAR(100)   NOT NULL,
    metric_value  DECIMAL(15,2)  NOT NULL,
    recorded_on   DATE           NOT NULL,
    uploaded_by   INT            NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (uploaded_by)   REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS activity_log (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    action     VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
