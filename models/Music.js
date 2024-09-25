const db = require('../config/db');

class Music {
    static getAll(callback) {
        const query = 'SELECT * FROM musics';
        db.query(query, callback);
    }

    static insert(filePath, callback) {
        const query = 'INSERT INTO musics (file_path) VALUES (?)';
        db.query(query, [filePath], callback);
    }

    static delete(filePath, callback) {
        const query = 'DELETE FROM musics WHERE file_path = ?';
        db.query(query, [filePath], callback);
    }
}

module.exports = Music;