const mongoose = require('mongoose');

// Definizione dello schema dell'utente
const docSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    id_files: mongoose.Schema.Types.ObjectId,
    data: Buffer,
    n: Number
});

// Modello dell'utente
const DocumentoDb = mongoose.model('DocumentoDb', docSchema,'fs.chunks');

module.exports = DocumentoDb;