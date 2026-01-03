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
        const { coordinates, range1, range2 } = req.body;

        // Prepare data for Python script
        const inputData = JSON.stringify({ coordinates, range1, range2 });

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
                console.error(`Python script exited with code ${code}:`);
                console.error(`STDERR: ${errorData}`);
                console.error(`STDOUT: ${resultData}`);
                return res.status(500).json({ msg: 'Analysis Failed', error: errorData || resultData });
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

// @route   PUT api/reports/:id
// @desc    Update a report (e.g. rename)
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { areaName } = req.body;

        let report = await AnalysisReport.findById(req.params.id);
        if (!report) return res.status(404).json({ msg: 'Report not found' });

        // Ensure user owns report
        if (report.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        if (areaName) report.areaName = areaName;

        await report.save();
        res.json(report);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/reports/:id
// @desc    Delete a report
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const report = await AnalysisReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ msg: 'Report not found' });
        }

        // Check user
        if (report.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await report.deleteOne();

        res.json({ msg: 'Report removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Report not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
