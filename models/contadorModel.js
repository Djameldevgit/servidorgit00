const mongoose = require('mongoose');

const CountdownSchema = new mongoose.Schema({
  years: {
    type: Number,
    required: true,
  },
  months: {
    type: Number,
    required: true,
  },
  days: {
    type: Number,
    required: true,
  },
  hours: {
    type: Number,
    required: true,
  },
  minutes: {
    type: Number,
    required: true,
  },
  seconds: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('contador', CountdownSchema);
