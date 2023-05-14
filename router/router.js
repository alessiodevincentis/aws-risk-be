const express = require('express');
const route = express.Router()
const multer = require('multer');
const storage = require('./../database/grid-fs-storage');
const mongoose = require('mongoose');
let Grid = require('gridfs-stream');

const dittaController = require('../controller/azienda/ditta-controller.js');
const documentoController = require('../controller/documento/documento-controller.js');
const impostazioniController = require('../controller/impostazioni/impostazioni-controller.js');
const duvriController = require('../controller/duvri/duvri-controller.js');
const planimetriaController = require('../controller/planimetria/planimetria-controller.js');
const attivitaLavorativaController = require('../controller/attivita-lavorativa/attivita-lavorativa-controller.js');
const loginController = require('../controller/login/login-controller.js');

// API

// LOGIN
route.post('/api/login',loginController.auth);

// DITTA
route.post('/api/ditta', dittaController.insert);
route.put('/api/ditta', dittaController.update);
route.get('/api/ditta', dittaController.find);
route.get('/api/ditta-by-id', dittaController.findById);
route.delete('/api/ditta', dittaController.delete);

// IMPOSTAZIONI
route.post('/api/impostazioni', impostazioniController.save);
route.get('/api/impostazioni', impostazioniController.find);

// DUVRI
route.post('/api/duvri', duvriController.insert);
route.put('/api/duvri', duvriController.update);
route.get('/api/duvri', duvriController.find);
route.delete('/api/duvri', duvriController.delete);

// PLANIMETRIA
route.post('/api/planimetria', planimetriaController.insert);
route.put('/api/planimetria', planimetriaController.update);
route.get('/api/planimetria', planimetriaController.find);
route.delete('/api/planimetria', planimetriaController.delete);

// ATTIVITA LAVORATIVA
route.post('/api/attivita', attivitaLavorativaController.insert);
route.put('/api/attivita', attivitaLavorativaController.update);
route.get('/api/attivita', attivitaLavorativaController.find);
route.delete('/api/attivita', attivitaLavorativaController.delete);

// DOCUMENTO
// Route for file upload
const upload = multer({ storage: storage });
route.post('/api/documento', upload.single('file'),
    function (req,res) {
    res.send({file: req.file})
});
route.get('/api/documento',
    function (req,res) {
        const gfs = Grid(mongoose.connection.db, mongoose.mongo);
        gfs.files.findOne({filename: 'products (1) (1) (2).pdf'}, function (err,file){
            console.log('DENTRO FI')
            if (err) {
                return res.status(400).send({error: err});
            }
            if (!file) {
                return res.status(400).send({error:'File not found'})
            }
            const readstream = gfs.createReadStream(file._id);
            res.set('Content-Type',file.contentType);
            res.set('Content-Disposition','attachment; filename="' +file.filename+'"');
            readstream.pipe(res);
        })
    });

module.exports = route