let cassandra = require('cassandra-driver');

// Replace 'Username' and 'Password' with the username and password from your cluster settings
let authProvider = new cassandra.auth.PlainTextAuthProvider('root', 'root');
// Replace the PublicIPs with the IP addresses of your clusters
let contactPoints = ['127.0.0.1:9042', '127.0.0.1:9043', '127.0.0.1:9044'];
// Replace DataCenter with the name of your data center, for example: 'AWS_VPC_US_EAST_1'
let localDataCenter = 'datacenter1';

let client = new cassandra.Client({ contactPoints: contactPoints, authProvider: authProvider, localDataCenter: localDataCenter, keyspace: 'grombluche' });
// Define and execute the queries

let query = 'SELECT name, type FROM grombluche.miamonx ALLOW FILTERING';
let q1 = client.execute(query, []).then(result => { console.table(result.rows); }).catch((err) => { console.log('Erreur à la récupération de la colonne', err); });
// Exit the program after all queries are complete
Promise.allSettled([q1]).finally(() => client.shutdown());
