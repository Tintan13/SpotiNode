const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const musicController = require('./controllers/musicController');

const app = express();

// Configure Body-Parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Storage setup for multer to store uploaded files in 'public/uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes
app.get('/', musicController.getAllMusic);
app.post('/upload', upload.single('mp3file'), musicController.uploadMusic);
app.post('/delete', musicController.deleteMusic);

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});