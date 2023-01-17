// .env
const env = require('dotenv');
env.config();

const cassandra = require('cassandra-driver');

// Connexion à la base
const client = new cassandra.Client({
    contactPoints: ['127.0.0.1:9042'],
    localDataCenter: 'datacenter1',
    keyspace: process.env.KEYSPACE,
    credentials: { username: process.env.DB_USER, password: process.env.DB_PASS }
});

// Selection de la table
const query = `SELECT * FROM ${process.env.KEYSPACE}.${process.env.TABLE_NAME}`;

// Execution de la requête
client.execute(query, []).then(result => console.table(result.rows));