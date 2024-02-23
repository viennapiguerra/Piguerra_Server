// Import required modules
const express = require('express');
const mongoose = require('mongoose');

// Create an Express application
const app = express();

// Set the port for the server to listen on
const port = process.env.PORT || 3000;

// Import courses data
const coursesData = require('./courses.json');

// Define the course schema
const coursesSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  tags: [String]
});

// Define the Course model using the schema
const Course = mongoose.model('Course', coursesSchema);

// Middleware to handle JSON parsing
app.use(express.json());

// Route to handle requests to '/api/test'
app.get('/api/test', (req, res) => {
    res.json([{ id: 1, text: "Test Objects-Test Objects" }]);
});

// Route to find a course by name
app.get('/api/courses/byname', async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ error: 'Name query parameter is required' });
        }

        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const query = { description: { $regex: escapedName, $options: 'i' } };

        const course = await Course.findOne(query);

        if (!course) {
            return res.status(404).json({ error: 'Course not found with the provided name' });
        }

        res.json(course);
    } catch (error) {
        console.error('Error retrieving course by name:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to retrieve all BSIS courses
app.get('/api/courses/bsis', (req, res) => {
  try {
    const bsisCourses = coursesData.flatMap(year => Object.values(year)).flat().filter(course => course.tags.includes('BSIS'));
    res.json(bsisCourses);
  } catch (error) {
    console.error('Error retrieving BSIS courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to retrieve all BSIT courses
app.get('/api/courses/bsit', (req, res) => {
  try {
    const bsitCourses = coursesData.flatMap(year => Object.values(year)).flat().filter(course => course.tags.includes('BSIT'));
    res.json(bsitCourses);
  } catch (error) {
    console.error('Error retrieving BSIT courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to check if a course belongs to a backend course based on its tags
function isBackendCourse(course) {
  const backendTags = ['Database', 'System', 'Software', 'Enterprise', 'Web', 'Information'];
  return course.tags.some(tag => backendTags.includes(tag));
}

// Route to retrieve all backend courses alphabetically
app.get('/api/backend-courses', (req, res) => {
  try {
    const backendCourses = coursesData.flatMap(year => Object.values(year)).flat().filter(course => isBackendCourse(course));
    backendCourses.sort((a, b) => a.description.localeCompare(b.description));
    res.json(backendCourses);
  } catch (error) {
    console.error('Error retrieving backend courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to retrieve course details
app.get('/api/course-details', (req, res) => {
  try {
    const courseDetails = [];
    coursesData.forEach(year => {
      Object.values(year).forEach(courseList => {
        courseList.forEach(course => {
          const { description, tags } = course;
          const name = tags[0];
          const specialization = tags[1];
          courseDetails.push({ name, specialization });
        });
      });
    });
    res.json(courseDetails);
  } catch (error) {
    console.error('Error retrieving course details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mongo-test', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => console.error('Connection failed...', err));

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
