const db = require('./databaseManager');
const { encrypt } = require('../encryptionUtilities');

const updateBalance = async (userId, btcChange, brcChange) => {
    await db.query("UPDATE user_balances SET pending_balance = pending_balance + $2, balance = balance + $3 WHERE user_id = $1", [userId, btcChange, brcChange]);
}

const lockAndGetUserBalance = async (username) => {
    const { rows } = await db.query({
        text: 'SELECT pending_balance, balance FROM user_balances WHERE user_id=$1 FOR UPDATE',
        values: [username]
    });

    return rows[0];
};

const insertNewGame = async (gameVRN, gameNonce, secretNonce, commitmentTimestamp, commitment, userId) => {
    const encryptedVRN = await encrypt(gameVRN);
    const encryptedSecretNonce = await encrypt(secretNonce);
    await db.query({
        text: "INSERT INTO games(user_id, game_nonce, bet_amount, choice, vrn, secret_nonce, commitment, commitmentTimestamp) VALUES($1, $2, $3, $4, $5, $6, $7, to_timestamp($8 / 1000.0)) RETURNING game_id",
        values: [userId, gameNonce, 1000, true, encryptedVRN, encryptedSecretNonce, commitment, commitmentTimestamp],
        rowMode: 'array',
        timeout: 5000
    });

    return
}

const userInsertion = async (userPublicKey, userName) => {
    let { rows } = await db.query("INSERT INTO users(public_key, user_name) VALUES($1, $2) RETURNING user_id", [userPublicKey, userName]);
    return rows[0].user_id || null;
};

const insertInitialBalance = async (userId) => {
    await db.query(
        "INSERT INTO user_balances(user_id, pending_balance, balance) VALUES($1, 0, 0)", [userId]
    );
}

async function insertReferralCode(referral_code, referrer_id) {
    await db.query("INSERT INTO referral_codes (referral_code, referrer_id) VALUES ($1, $2)", [referral_code, referrer_id]);
}

async function insertReferral(referralCode, referrerId, userId) {
    const query = `
        INSERT INTO referrals (referral_code, referrer_id, referred_id)
        VALUES ($1, $2, $3);
    `;
    await db.query(query, [referralCode, referrerId, userId]);
}

async function getUserIdByPublicKey(publicKey) {
    const { rows } = await db.query("SELECT user_id FROM users WHERE public_key = $1", [publicKey]);
    return (rows.length > 0) ? rows[0].user_id : null;
}

const truncateTables = async () => {
    await db.query(`
    TRUNCATE 
    transactions, 
    commitments, 
    games, 
    referrals, 
    user_balances, 
    referral_codes, 
    users 
    CASCADE;`);
}

const insertBRC20DepositTransaction = async (userId, transactionId, token) => {
    await db.query(
        "INSERT INTO transactions(user_id, type, status, tx_id, token) VALUES($1, $2, $3, $4, $5)",
        [userId, "deposit", "confirming", transactionId, token]
    );
    return;
};

const selectBalance = async (userId) => {
    const { rows: balance } = await db.query(
        "SELECT pending_balance, balance FROM user_balances WHERE user_id=$1",
        [userId]
    );
    return balance.length > 0 ? balance[0] : null;
};

const insertConfirmedTransaction = async (userId, transactionId, token) => {
    await db.query(
        "INSERT INTO transactions(user_id, type, status, tx_id, token) VALUES($1, $2, $3, $4, $5)",
        [userId, "deposit", "analyzing", transactionId, token]
    );
    return;
};

module.exports = {
    updateBalance,
    lockAndGetUserBalance,
    userInsertion,
    insertInitialBalance,
    insertReferralCode,
    insertReferral, 
    truncateTables, 
    insertNewGame,
    getUserIdByPublicKey,
    insertBRC20DepositTransaction,
    selectBalance,
    insertConfirmedTransaction
};
