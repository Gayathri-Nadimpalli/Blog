const mongoose = require('mongoose');

const { Schema } = mongoose;

const blogModel = new Schema(
  {
    title: { type: String },
    body: { type: String },
    approved: { type: String, default: 'N' },
  }
);

module.exports = mongoose.model('blog', blogModel);
