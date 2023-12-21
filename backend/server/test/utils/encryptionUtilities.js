const crypto = require('crypto');
const bitcore = require('bitcore-lib');

// Use AWS keys here. 
const rawKey = process.env.ENCRYPTION_KEY || "Your encryption key";
const ENCRYPTION_KEY = Buffer.from(rawKey.padEnd(32, ' ').slice(0, 32));
const IV_LENGTH = 16;


function encrypt(text) {
    try {
        // Generate a random initialization vector
        let iv = crypto.randomBytes(IV_LENGTH);

        // Create a new AES-256-CBC cipher using our encryption key and the IV
        let cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);

        // Encrypt the input text
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Return the IV and the encrypted text, concatenated

        return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error("Encryption failed:", error.message);
        return null; // or throw the error, depending on your use-case
    }
}

function decrypt(text) {
    try {
        let textParts = String(text).split(':');
        if (textParts.length !== 2) {
            throw new Error("Invalid encrypted text format");
        }
        let iv = Buffer.from(textParts.shift(), 'hex');
        if (iv.length !== IV_LENGTH) {
            throw new Error("Invalid IV length");
        }
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Decryption failed:", error.message);
        return null; // or throw the error, depending on your use-case
    }
}

function generateSignatures(messageToHash, inputPrivateKey, inputPublicKey) {
    const randomMessage = messageToHash || crypto.randomBytes(16).toString('hex');
    const hash = bitcore.crypto.Hash.sha256(Buffer.from(randomMessage));
    const privateKey = inputPrivateKey || new bitcore.PrivateKey();

    const publicKey = inputPublicKey || privateKey.toPublicKey();

    const message = new bitcore.Message(hash.toString('hex'));

    const signatureBase64 = message.sign(privateKey);

    return { 
        hash: message,
        userPublicKey: publicKey, 
        signedMessage: signatureBase64,
        value: randomMessage,
        userName: "userName",
        privateKey : privateKey
    }
}

module.exports = {
    decrypt,
    encrypt,
    generateSignatures
};