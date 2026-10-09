const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const { auth, authorize } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// --- AUTHENTICATION ENDPOINTS ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: role || 'student' });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error during registration.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, error: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error during login.' });
  }
});

// --- COURSE MANAGEMENT ENDPOINTS ---
app.get('/api/courses', async (req, res) => {
  try {
    const { search, category, level } = req.query;
    let query = {};

    if (search) {
      query.$text = {$search: search };
    }
    if (category) {
      query.category = { $regex: new RegExp(category, 'i') };
    }
    if (level) {
      query.level = level;
    }

    const courses = await Course.find(query).populate('instructor', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: courses.length, courses });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch courses.' });
  }
});

app.post('/api/courses', auth, authorize('admin'), async (req, res) => {
  try {
    const { title, description, category, level, lessons } = req.body;
    const course = new Course({
      title,
      description,
      category,
      level,
      lessons: lessons || [],
      instructor: req.user.id
    });
    await course.save();
    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Failed to create course.' });
  }
});

// --- ENROLLMENT & PROGRESS TRACKING ENDPOINTS ---
app.post('/api/enrollments/:courseId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, error: 'Course not found.' });

    const existing = await Enrollment.findOne({ student: req.user.id, course: req.params.courseId });
    if (existing) return res.status(400).json({ success: false, error: 'Already enrolled in this course.' });

    const enrollment = new Enrollment({ student: req.user.id, course: req.params.courseId });
    await enrollment.save();

    res.status(201).json({ success: true, message: 'Successfully enrolled!', enrollment });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Enrollment failed.' });
  }
});

app.get('/api/enrollments/my-courses', auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({ path: 'course', populate: { path: 'instructor', select: 'name' } });
    res.json({ success: true, enrollments });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch enrollments.' });
  }
});

app.patch('/api/enrollments/:courseId/progress', auth, async (req, res) => {
  try {
    const { lessonId } = req.body;
    const enrollment = await Enrollment.findOne({ student: req.user.id, course: req.params.courseId });
    const course = await Course.findById(req.params.courseId);

    if (!enrollment || !course) return res.status(404).json({ success: false, error: 'Record not found.' });

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    const totalLessons = course.lessons.length || 1;
    enrollment.overallProgress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
    if (enrollment.overallProgress >= 100) enrollment.status = 'completed';

    await enrollment.save();
    res.json({ success: true, progress: enrollment.overallProgress, enrollment });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update progress.' });
  }
});

const PORT = process.env.PORT || 3800;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/course_system')
  .then(() => app.listen(PORT, () => console.log(`Course System Backend running on port ${PORT}`)))
  .catch(err => console.error('MongoDB connection error:', err));