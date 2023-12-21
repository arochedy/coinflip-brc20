CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    public_key TEXT NOT NULL UNIQUE,
    user_name TEXT NOT NULL,
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    current_loss_streak INTEGER DEFAULT 0,
    highest_streak INTEGER DEFAULT 0,
    highest_loss_streak INTEGER DEFAULT 0,
    last_login TIMESTAMP,
    current_position INTEGER,
    best_position INTEGER,
    btc_derivation_counter INT DEFAULT 0, 
);

CREATE TABLE games (
    game_nonce VARCHAR(255) PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    bet_amount DECIMAL(16, 8) NOT NULL,
    choice BOOLEAN NOT NULL,  -- True for Heads, False for Tails
    outcome BOOLEAN,          -- True for Heads, False for Tails
    did_win BOOLEAN,
    commitmentTimestamp TIMESTAMP,
    selectionTimestamp TIMESTAMP,
    revealTimestamp TIMESTAMP,
    verificationTimestamp TIMESTAMP DEFAULT null,
    signedGameNonce VARCHAR(255),
    outcomeHash VARCHAR(255),
    verified BOOLEAN DEFAULT false, 
    vrn BYTEA NOT NULL,      -- encrypted VRF
    secret_nonce BYTEA NOT NULL, -- encrypted nonce
    commitment VARCHAR(255) NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('completed', 'pending')), -- type of action
    txID VARCHAR(255),
);

CREATE TABLE user_balances (
    balance_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(user_id), 
    balance DECIMAL(16, 8) DEFAULT 0,
    status VARCHAR(10) NOT NULL CHECK (status IN ('completed', 'pending')), -- type of action
    txID VARCHAR(255),
);

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    type VARCHAR(10) NOT NULL CHECK (type IN ('referral', 'game', 'systemFee')), -- type of transaction
    status VARCHAR(10) NOT NULL CHECK (status IN ('completed', 'invalid', 'pending')), -- type of action
    amount DECIMAL(16, 8), -- amount involved in the transaction
    transaction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    txID VARCHAR(255),
);

CREATE TABLE referral_codes (
    referral_code VARCHAR(255) PRIMARY KEY,  -- Making referral_code as the primary key
    referrer_id INT NOT NULL REFERENCES users(user_id)
);

CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    referral_code VARCHAR(255) NOT NULL REFERENCES referral_codes(referral_code), -- Foreign key reference to referral_codes table
    referrer_id INT NOT NULL REFERENCES users(user_id),
    referred_id INT NOT NULL REFERENCES users(user_id) UNIQUE,  -- ensures a user can't be referred more than once
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT no_self_referral CHECK (referrer_id != referred_id)  -- prevents self-referral
);

CREATE TABLE ipfs (
    ipfs_id SERIAL PRIMARY KEY, -- Unique ID for each record
    game_nonce VARCHAR(255) UNIQUE REFERENCES games(game_nonce), -- Foreign Key referencing game_nonce in games table
    commitment TEXT,
    selection TEXT,
    outcome TEXT
);

CREATE TABLE daily_logins (
    daily_login_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    login_date DATE NOT NULL,
    UNIQUE(user_id, login_date)
);

CREATE TABLE achievements (
    achievement_id SERIAL PRIMARY KEY,
    achievement_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_achievements (
    user_achievement_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    achievement_id INTEGER REFERENCES achievements(achievement_id),
    game_nonce VARCHAR(255) REFERENCES games(game_nonce),
    date_earned TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(10) NOT NULL CHECK (status IN ('completed', 'pending')), -- type of action
    tx_id JSONB DEFAULT '[{"txID":"", "balance": 0}]'::jsonb,
);

CREATE TABLE leaderboard (
    user_id INTEGER PRIMARY KEY REFERENCES users(user_id),
    total_points INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE btc_deposits (
    deposit_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    deposit_address VARCHAR(64) UNIQUE NOT NULL,
    amount_received DECIMAL(16, 8) DEFAULT 0.0,
    transaction_id VARCHAR(64) UNIQUE,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'expired')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster querying
CREATE INDEX idx_referrer ON referrals(referrer_id);
CREATE INDEX idx_referred ON referrals(referred_id);
CREATE INDEX idx_points ON leaderboard(total_points DESC);

CREATE OR REPLACE FUNCTION update_leaderboard_row() RETURNS TRIGGER AS $$
BEGIN
    -- Update the leaderboard for all users
    WITH UpdatedLeaderboard AS (
        SELECT u.user_id, u.total_points, RANK() OVER (ORDER BY u.total_points DESC) AS rank
        FROM users u
    )
    INSERT INTO leaderboard (user_id, total_points)
    SELECT user_id, total_points FROM UpdatedLeaderboard
    ON CONFLICT (user_id) 
    DO UPDATE SET total_points = EXCLUDED.total_points, last_updated = CURRENT_TIMESTAMP;

    -- Update the current and best positions for all users
    UPDATE users u
    SET current_position = l.rank,
        best_position = LEAST(u.best_position, l.rank)
    FROM (
        SELECT user_id, RANK() OVER (ORDER BY total_points DESC) AS rank
        FROM leaderboard
    ) l
    WHERE u.user_id = l.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER after_user_update
AFTER UPDATE OF total_points ON users
FOR EACH ROW
WHEN (OLD.total_points IS DISTINCT FROM NEW.total_points)
EXECUTE FUNCTION update_leaderboard_row();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to fire the update_updated_at_column function 
-- before each update on btc_deposits table
CREATE TRIGGER update_btc_dep_updated_at
BEFORE UPDATE ON btc_deposits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
