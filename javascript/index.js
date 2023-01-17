const env = require('dotenv');
env.config();

// Connexion à la base cassandra
let cassandra = require('cassandra-driver');
let authProvider = new cassandra.auth.PlainTextAuthProvider('root', 'root');
let contactPoints = ['127.0.0.1:9042', '127.0.0.1:9043', '127.0.0.1:9044'];
let localDataCenter = 'datacenter1';
let client = new cassandra.Client({ contactPoints: contactPoints, authProvider: authProvider, localDataCenter: localDataCenter, keyspace: process.env.KEYSPACE });

// Requête de selection
const query = `SELECT name, type FROM ${process.env.KEYSPACE}.${process.env.TABLE_NAME}`;
let q1 = client.execute(query, []).then(result => { console.table(result.rows); }).catch((err) => { console.log('Erreur à la récupération de la colonne : ', err); });
// Exit the program after all queries are complete
Promise.allSettled([q1]).finally(() => client.shutdown());
