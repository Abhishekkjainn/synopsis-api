const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Route: GET /process-files
 * Description: Reads three local files and processes them using a Python script.
 */
app.get('/process-files', (req, res) => {
  try {
    // Define file paths for the local text files
    const filePaths = [
      path.resolve(__dirname, 'file1.txt'),
      path.resolve(__dirname, 'file2.txt'),
      path.resolve(__dirname, 'file3.txt'),
    ];

    // Check if all files exist before proceeding
    for (const filePath of filePaths) {
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          error: `File not found: ${path.basename(filePath)}`,
        });
      }
    }

    // Spawn a Python process and pass file paths as arguments
    const pythonProcess = spawn('python3', ['process.py', ...filePaths]);

    let output = '';
    let errorOutput = '';

    // Collect standard output from the Python script
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Capture any errors from the Python script
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          // Parse output as JSON (assuming Python script returns JSON)
          const parsedOutput = JSON.parse(output.trim());
          return res.status(200).json(parsedOutput);
        } catch (parseError) {
          return res.status(500).json({
            error: 'Failed to parse Python script output',
            details: output.trim(),
          });
        }
      } else {
        return res.status(500).json({
          error: 'Python script execution failed',
          details: errorOutput.trim() || 'Unknown error occurred',
        });
      }
    });

    // Handle unexpected process termination
    pythonProcess.on('error', (err) => {
      return res.status(500).json({
        error: 'Failed to start Python process',
        details: err.message,
      });
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal Server Error',
      details: err.message,
    });
  }
});

// Start Express server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
