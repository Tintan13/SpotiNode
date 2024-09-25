const Music = require('../models/Music');
const path = require('path');
const fs = require('fs');

exports.getAllMusic = (req, res) => {
    Music.getAll((err, results) => {
        if (err) {
            console.error('Error fetching songs from database:', err);
            res.render('index', { songs: [], dbStatus: 'Error', mysqlConnected: false });
        } else {
            const songs = results.map(result => ({
                id: result.id,
                filename: path.basename(result.file_path)
            }));
            res.render('index', { songs: songs, dbStatus: 'Connected', mysqlConnected: true });
        }
    });
};

exports.uploadMusic = (req, res) => {
    if (req.file) {
        const filePath = `/uploads/${req.file.filename}`;
        Music.insert(filePath, (err, result) => {
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
};

exports.deleteMusic = (req, res) => {
    const song = req.body.song;
    const filePath = `/uploads/${song}`;

    Music.delete(filePath, (err, result) => {
        if (err) {
            console.error('Error deleting song from database:', err);
            res.status(500).send('Error deleting song');
        } else {
            console.log('Song deleted from database');
            
            const fullPath = path.join(__dirname, '..', 'public', filePath);
            fs.unlink(fullPath, (err) => {
                if (err) {
                    console.error(`Failed to delete file: ${err}`);
                } else {
                    console.log(`${song} was deleted successfully.`);
                }
                res.redirect('/');
            });
        }
    });
};