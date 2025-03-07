// const express = require('express');
// const cors = require('cors');
// const { spawn } = require('child_process');
// const path = require('path');
// const fs = require('fs');
// const multer = require('multer');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Configure multer for file uploads
// const upload = multer({ dest: 'uploads/' });

// /**
//  * Route: POST /process-files
//  * Description: Accepts three files from the user and processes them using a Python script.
//  */
// app.post('/process-files', upload.array('files', 3), (req, res) => {
//   try {
//     if (!req.files || req.files.length !== 3) {
//       return res
//         .status(400)
//         .json({ error: 'Exactly three files must be uploaded' });
//     }

//     // Get uploaded file paths
//     const filePaths = req.files.map((file) => file.path);

//     // Spawn a Python process and pass file paths as arguments
//     const pythonProcess = spawn('python3', ['process.py', ...filePaths]);

//     let output = '';
//     let errorOutput = '';

//     // Collect standard output from the Python script
//     pythonProcess.stdout.on('data', (data) => {
//       output += data.toString();
//     });

//     // Capture any errors from the Python script
//     pythonProcess.stderr.on('data', (data) => {
//       errorOutput += data.toString();
//     });

//     // Handle process completion
//     pythonProcess.on('close', (code) => {
//       // Delete uploaded files after processing
//       filePaths.forEach((filePath) => fs.unlinkSync(filePath));

//       if (code === 0) {
//         try {
//           // Parse output as JSON (assuming Python script returns JSON)
//           const parsedOutput = JSON.parse(output.trim());
//           return res.status(200).json(parsedOutput);
//         } catch (parseError) {
//           return res.status(500).json({
//             error: 'Failed to parse Python script output',
//             details: output.trim(),
//           });
//         }
//       } else {
//         return res.status(500).json({
//           error: 'Python script execution failed',
//           details: errorOutput.trim() || 'Unknown error occurred',
//         });
//       }
//     });

//     // Handle unexpected process termination
//     pythonProcess.on('error', (err) => {
//       return res.status(500).json({
//         error: 'Failed to start Python process',
//         details: err.message,
//       });
//     });
//   } catch (err) {
//     return res.status(500).json({
//       error: 'Internal Server Error',
//       details: err.message,
//     });
//   }
// });

// // Start Express server
// const PORT = 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

/**
 * Route: POST /process-files
 * Description: Accepts three files and forwards them to the Flask API for processing.
 */
app.post('/process-files', upload.array('files', 3), async (req, res) => {
  try {
    if (!req.files || req.files.length !== 3) {
      return res
        .status(400)
        .json({ error: 'Exactly three files must be uploaded' });
    }

    // Create a FormData object to send files to Flask
    const formData = new FormData();
    req.files.forEach((file) => {
      formData.append('files', fs.createReadStream(file.path));
    });

    // Send request to Flask API
    const flaskApiUrl = 'https://synopsisareaapi.onrender.com/process-files'; // Change if Flask is hosted remotely

    const response = await axios.post(flaskApiUrl, formData, {
      headers: { ...formData.getHeaders() },
    });

    // Delete uploaded files after sending to Flask
    req.files.forEach((file) => fs.unlinkSync(file.path));

    // Send Flask API response to the client
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error processing files:', error.message);
    res.status(500).json({
      error: 'Failed to process files',
      details: error.response?.data || error.message,
    });
  }
});

// Start Express server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
