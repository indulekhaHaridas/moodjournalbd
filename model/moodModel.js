const mongoose = require('mongoose');

// Create schema
const moodsSchema = new mongoose.Schema({
  mood: {
    emoji: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  },
  score: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  userMail: {
    type: String,
    required: true
  }
});

// Create and export model
const moods = mongoose.model("moods", moodsSchema);
module.exports = moods;
