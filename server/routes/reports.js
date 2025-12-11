const express = require('express');
const router = express.Router();
const AnalysisReport = require('../models/AnalysisReport');
// Middleware to verify token would go here

const { spawn } = require('child_process');
const path = require('path');

// @route   POST api/reports/analyze
// @desc    Trigger deforestation analysis via Python script
// @access  Private (or Public for demo)
router.post('/analyze', async (req, res) => {
    try {
        const { coordinates, startDate, endDate } = req.body;

        // Prepare data for Python script
        const inputData = JSON.stringify({ coordinates, startDate, endDate });

        const scriptPath = path.join(__dirname, '../python/inference.py');
        const pythonProcess = spawn('python', [scriptPath, inputData]);

        let resultData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}: ${errorData}`);
                return res.status(500).json({ msg: 'Analysis Failed', error: errorData });
            }
            try {
                const jsonResult = JSON.parse(resultData);
                res.json(jsonResult);
            } catch (e) {
                console.error('Failed to parse Python output:', resultData);
                res.status(500).json({ msg: 'Invalid Analysis Output' });
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const auth = require('../middleware/auth');

// @route   POST api/reports
// @desc    Save a new analysis report
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        console.log("Saving report for user:", req.user.id);
        const reportData = { ...req.body, userId: req.user.id };
        const newReport = new AnalysisReport(reportData);
        const report = await newReport.save();
        console.log("Report saved successfully:", report._id);
        res.json(report);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/reports
// @desc    Get all reports for load-in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        console.log("GET /reports called for user:", req.user.id);
        const reports = await AnalysisReport.find({ userId: req.user.id }).sort({ createdAt: -1 });
        console.log(`Found ${reports.length} reports for user.`);
        res.json(reports);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
