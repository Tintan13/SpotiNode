const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root', 
    password: '',
    database: 'spotinode'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        console.error('Error code:', err.code);
        console.error('Error message:', err.sqlMessage);
    } else {
        console.log('Connected to MySQL database');
    }
});

module.exports = connection;