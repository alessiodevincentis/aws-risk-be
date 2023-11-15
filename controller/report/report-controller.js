const ReportDb = require('../../model/report.js')
const ExcelJS = require('exceljs');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// retrieve and return all utente
exports.find = (req, res)=>{
    ReportDb.find().sort({dataGenerazione: -1})
        .then(reportGenerati => {
            res.send(reportGenerati)
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving report information" })
        })
}

exports.insert = async (req, res) => {
    try {
        const filePath = await createWorkBook(req.body);
        const response = await uploadFileToDb(filePath);
        await createReportDb(response,req.body);
        res.send({status: "ok"});
    } catch (err) {
        console.error(err)
        res.status(500).send({ message : err.message || "Error Occurred while inserting report" })
    }
}

async function createWorkBook(bodyRequest) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');
    worksheet.addRow(['Nome', 'Cognome', 'Età']);
    worksheet.addRow(['Mario', 'Rossi', 30]);
    worksheet.addRow(['Luigi', 'Verdi', 25]);
    const excelFilePath = 'uploads/'+ bodyRequest.tipologia +'-' + (new Date().getTime()) + '.xlsx';
    await workbook.xlsx.writeFile(excelFilePath);
    console.log(`File Excel generato con successo: ${excelFilePath}`);
    return excelFilePath;
}

async function uploadFileToDb(filePath) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    return await axios.post('http://localhost:8080/api/documento', formData, {headers: {'Content-Type': 'multipart/form-data'}});
}

async function createReportDb(response,bodyRequest) {
    return new Promise((resolve, reject) => {
        ReportDb.create({nomeFile: response.data.file.filename,tipologia: bodyRequest.tipologia,dataGenerazione: new Date(),idStorage: response.data.file.id})
            .then(result => {
                resolve();
            })
            .catch(err => {
                console.error(err);
                reject();
            })
    })
}