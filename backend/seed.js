const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Course = require('./models/Course');

const sampleCourses = [
  {
    title: 'Full-Stack MERN Web Development',
    description: 'Master MongoDB, Express.js, React, and Node.js with real-world projects, authentication, and deployment.',
    category: 'Web Development',
    level: 'Beginner',
    lessons: [
      { title: 'Introduction to Node.js & Express', durationMinutes: 20 },
      { title: 'Building RESTful APIs', durationMinutes: 35 },
      { title: 'MongoDB Data Modeling', durationMinutes: 40 }
    ]
  },
  {
    title: 'Advanced Backend Engineering with FastAPI & Redis',
    description: 'Learn high-performance microservices, rate limiting middleware, distributed caching, and asynchronous Python.',
    category: 'Backend Engineering',
    level: 'Advanced',
    lessons: [
      { title: 'Asynchronous Architecture in FastAPI', durationMinutes: 30 },
      { title: 'Redis Caching & Lua Scripting', durationMinutes: 45 },
      { title: 'Token Bucket Rate Limiting', durationMinutes: 50 }
    ]
  },
  {
    title: 'Data Science & Machine Learning with Python',
    description: 'Comprehensive guide to Pandas, NumPy, Scikit-Learn, PyTorch, and building real-time prediction pipelines.',
    category: 'Data Science',
    level: 'Intermediate',
    lessons: [
      { title: 'Data Cleaning with Pandas', durationMinutes: 25 },
      { title: 'Model Training with PyTorch', durationMinutes: 60 }
    ]
  },
  {
    title: 'System Design & Distributed Architectures',
    description: 'Learn load balancing, database sharding, message queues with Kafka, and high-availability system designs.',
    category: 'Backend Engineering',
    level: 'Advanced',
    lessons: [
      { title: 'Horizontal vs Vertical Scaling', durationMinutes: 15 },
      { title: 'Kafka Event Streams', durationMinutes: 40 }
    ]
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/course_system');
    console.log('MongoDB Connected for seeding...');

    // Create an Admin Instructor if not present
    let admin = await User.findOne({ email: 'admin@coursehub.com' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = new User({
        name: 'Kaushal Kumar',
        email: 'admin@coursehub.com',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Created Admin User: admin@coursehub.com / admin123');
    }

    // Insert sample courses attached to the admin instructor
    await Course.deleteMany({}); // Clears existing sample courses
    const coursesWithInstructor = sampleCourses.map(course => ({
      ...course,
      instructor: admin._id
    }));

    await Course.insertMany(coursesWithInstructor);
    console.log('Successfully seeded 4 courses into database!');

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();