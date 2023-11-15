const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    tipologia: {type: String},
    nomeFile: {type: String},
    dataGenerazione: {type: Date},
    idStorage: {
        type: mongoose.Schema.Types.ObjectId
    },
    idStoragePdf: {
        type: mongoose.Schema.Types.ObjectId
    }
});

const ReportDb = mongoose.model('ReportDb', schema, 'report');

module.exports = ReportDb;