-- OAuth2 Client Credentials Schema
CREATE TABLE IF NOT EXISTS oauth_clients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  client_id VARCHAR(255) UNIQUE NOT NULL,
  client_secret_hash VARCHAR(255) NOT NULL,
  client_name VARCHAR(255),
  scopes TEXT, -- JSON array of allowed scopes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP NULL -- Optional expiry for clients
);

-- Access Tokens Table (for token management)
CREATE TABLE IF NOT EXISTS access_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  scopes TEXT, -- JSON array of granted scopes
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_revoked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (client_id) REFERENCES oauth_clients(client_id) ON DELETE CASCADE
);

-- Users Table for Basic Authentication
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  avatar_url VARCHAR(500),
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP NULL,
  last_login TIMESTAMP NULL,
  login_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
  preferences JSON, -- User settings/preferences
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Sessions Table (for Basic Auth tokens)
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  device_info VARCHAR(500), -- Browser/device information
  ip_address VARCHAR(45), -- Support IPv6
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_revoked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert demo OAuth2 client for testing
INSERT INTO oauth_clients (client_id, client_secret_hash, client_name, scopes) 
VALUES (
  'demo-client',
  '$2b$10$O3StEM3Nb/4HDRHaWqZmXezvnibtStUnc1/9Se8cf1WAZWa0h7cf6', -- bcrypt hash of 'demo-secret'
  'Demo Client for Hoppscotch',
  '["api:read", "api:write", "api:admin"]'
) ON DUPLICATE KEY UPDATE client_secret_hash = VALUES(client_secret_hash);

-- Insert demo user for testing Basic Auth
INSERT INTO users (username, email, password_hash, first_name, last_name, email_verified) 
VALUES (
  'demo',
  'demo@hoppscotch.io',
  '$2b$10$lKagY22db6eJHIyjQ2zvH.8XgPlElsNLLESCvX1cfTOJsiLFmsbSm', -- bcrypt hash of 'password'
  'Demo',
  'User',
  TRUE
) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);

-- Create indexes for performance
CREATE INDEX idx_oauth_clients_client_id ON oauth_clients(client_id);
CREATE INDEX idx_access_tokens_token_hash ON access_tokens(token_hash);
CREATE INDEX idx_access_tokens_client_id ON access_tokens(client_id);
CREATE INDEX idx_access_tokens_expires_at ON access_tokens(expires_at);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
