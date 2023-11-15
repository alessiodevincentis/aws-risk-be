const ReportDb = require('../../model/report.js')
const ExcelJS = require('exceljs');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const PDFDocument = require('pdfkit');

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
        const pdfFilePath = await createPdfFileFromExcel(filePath);
        const response = await uploadFileToDb(filePath);
        const responsePdf = await uploadFileToDb(pdfFilePath);
        await createReportDb(response,responsePdf,req.body);
        res.send({status: "ok"});
    } catch (err) {
        console.error(err)
        res.status(500).send({ message : err.message || "Error Occurred while inserting report" })
    }
}

async function createWorkBook(bodyRequest) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');
    const row = worksheet.addRow(['Nome Azienda']);
    row.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' }}
    row.alignment = { vertical: 'middle' };
    row.font = { bold: true };
    row.height = 60;
    const excelFilePath = 'uploads/'+ bodyRequest.tipologia +'-' + (new Date().getTime()) + '.xlsx';
    await workbook.xlsx.writeFile(excelFilePath);
    console.log(`File Excel generato con successo: ${excelFilePath}`);
    return excelFilePath;
}

async function createPdfFileFromExcel(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    const pdfDoc = new PDFDocument();
    const pdfFilePath = filePath.replaceAll('.xlsx','.pdf');
    const pdfStream = fs.createWriteStream(pdfFilePath);
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            pdfDoc.text(cell.value.toString(), colNumber * 100, rowNumber * 20);
        });
    });
    pdfDoc.pipe(pdfStream);
    pdfDoc.end();
    return pdfFilePath;
}

async function uploadFileToDb(filePath) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    return await axios.post('http://localhost:8080/api/documento', formData, {headers: {'Content-Type': 'multipart/form-data'}});
}

async function createReportDb(response,responsePdf,bodyRequest) {
    return new Promise((resolve, reject) => {
        ReportDb.create({nomeFile: response.data.file.filename,tipologia: bodyRequest.tipologia,dataGenerazione: new Date(),idStorage: response.data.file.id,idStoragePdf: responsePdf.data.file.id})
            .then(result => {
                resolve();
            })
            .catch(err => {
                console.error(err);
                reject();
            })
    })
}