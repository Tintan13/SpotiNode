const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2');

const app = express();

// Configure Body-Parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the 'public' folder
app.use(express.static('public'));

// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root', // Replace with your MySQL username if it's not root
    password: '', // Replace with your MySQL password if you have set one
    database: 'spotinode'
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        console.error('Error code:', err.code);
        console.error('Error message:', err.sqlMessage);
    } else {
        console.log('Connected to MySQL database');
    }
});

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

// Route for homepage
app.get('/', (req, res) => {
    const dbStatus = connection.state === 'authenticated' ? 'Connected' : 'Disconnected';
    
    // Fetch songs from the database
    const query = 'SELECT * FROM musics';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching songs from database:', err);
            res.render('index', { songs: [], dbStatus: dbStatus, mysqlConnected: dbStatus === 'Connected' });
        } else {
            res.render('index', { songs: results.map(result => path.basename(result.file_path)), dbStatus: dbStatus, mysqlConnected: dbStatus === 'Connected' });
        }
    });
});

// Route to handle file upload
app.post('/upload', upload.single('mp3file'), (req, res) => {
    if (req.file) {
        const filePath = `/uploads/${req.file.filename}`;
        const query = 'INSERT INTO musics (file_path) VALUES (?)';
        connection.query(query, [filePath], (err, result) => {
            if (err) {
                console.error('Error inserting song into database:', err);
            } else {
                console.log('Song inserted into database');
            }
            res.redirect('/');
        });
    } else {
        res.status(400).send('No file uploaded');
    }
});

// Route to handle deleting a song
app.post('/delete', (req, res) => {
    const song = req.body.song;
    const filePath = path.join(__dirname, 'public/uploads', song);

    // Delete from database
    const query = 'DELETE FROM musics WHERE file_path = ?';
    connection.query(query, [`/uploads/${song}`], (err, result) => {
        if (err) {
            console.error('Error deleting song from database:', err);
        } else {
            console.log('Song deleted from database');
            
            // Delete file from filesystem
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Failed to delete file: ${err}`);
                } else {
                    console.log(`${song} was deleted successfully.`);
                }
                res.redirect('/');
            });
        }
    });
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});