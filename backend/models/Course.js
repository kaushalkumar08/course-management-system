const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  contentUrl: { type: String, default: '' },
  durationMinutes: { type: Number, default: 10 }
});

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, index: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessons: [LessonSchema],
  createdAt: { type: Date, default: Date.now }
});

// Text index for fast search queries
CourseSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Course', CourseSchema);