const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const Citation = require('../models/File');

// @desc    Upload citation file and create excel summary
// @route   POST /api/files/upload
// @access  Protected
const uploadFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Save file metadata in DB
    const citation = new Citation({
      user: req.user.id,
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
    });

    await citation.save();

    // --- File analysis & Excel creation ---
    // For simplicity, assume file is CSV or text with comma-separated values

    // Read file content (assuming utf8 encoding)
    const fileContent = fs.readFileSync(file.path, 'utf8');

    // Split into rows by newline
    const rows = fileContent.split(/\r?\n/).filter(Boolean);

    // Parse rows into arrays of columns (split by comma)
    const data = rows.map(row => row.split(','));

    // Create new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data); // convert array of arrays to sheet

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Define export directory (make sure this directory exists or create it)
    const exportDir = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // Create a filename for the exported Excel file
    const excelFilename = `${file.filename}-export.xlsx`;
    const excelFilePath = path.join(exportDir, excelFilename);

    // Write workbook to file
    XLSX.writeFile(wb, excelFilePath);

    // Respond with citation data and Excel file path
    res.status(201).json({
      message: 'File uploaded and analyzed successfully',
      citation,
      excelFile: `/exports/${excelFilename}`, // Provide relative path for client access
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  uploadFile,
};
