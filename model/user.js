const mongoose = require('mongoose');

// Definizione dello schema dell'utente
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    roles: [String]
});

// Modello dell'utente
const UserDb = mongoose.model('UserDb', userSchema,'users');

module.exports = UserDb;