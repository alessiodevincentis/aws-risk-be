const ReportDb = require('../../model/report.js')
const ExcelJS = require('exceljs');

// retrieve and return all utente
exports.find = (req, res)=>{
    ReportDb.find()
        .then(reportGenerati => {
            res.send(reportGenerati)
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving report information" })
        })
}

exports.insert = (req, res)=>{
    const workbook = new ExcelJS.Workbook();

// Creare un nuovo foglio di lavoro
    const worksheet = workbook.addWorksheet('Sheet 1');

// Aggiungere dati al foglio di lavoro
    worksheet.addRow(['Nome', 'Cognome', 'Età']);
    worksheet.addRow(['Mario', 'Rossi', 30]);
    worksheet.addRow(['Luigi', 'Verdi', 25]);

// Specificare il percorso del file Excel da generare
    const excelFilePath = 'output.xlsx';

// Scrivere il workbook nel file Excel
    workbook.xlsx.writeFile(excelFilePath)
        .then(() => {
            console.log(`File Excel generato con successo: ${excelFilePath}`);
        })
        .catch((err) => {
            console.error('Errore nella generazione del file Excel:', err);
        });
    res.send({status: "ok"})
    /*ReportDb.create(req.body.report)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send({ message : err.message || "Error Occurred while inserting report" })
        })*/
}