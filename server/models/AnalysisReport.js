const mongoose = require('mongoose');

const AnalysisReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    areaName: {
        type: String,
        default: 'Untitled Area'
    },
    coordinates: {
        type: Object, // GeoJSON or simple bounds { ne, sw }
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalForestArea: {
        type: Number
    },
    deforestedArea: {
        type: Number
    },
    deforestationPercent: {
        type: Number
    },
    mapImageUrl: {
        type: String
    },
    isSubscribedToMonthlyUpdates: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AnalysisReport', AnalysisReportSchema);
