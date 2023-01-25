// .env
const env = require('dotenv');
env.config();

const cassandra = require('cassandra-driver');

const name = 'vm';

// Connexion à la base
const client = new cassandra.Client({
    contactPoints: ['127.0.0.1:9042'],
    localDataCenter: 'datacenter1',
    keyspace: 'system',
    credentials: { username: process.env.DB_USER, password: process.env.DB_PASS }
});

/**
 * listKeyspaces() retourne l'objet de tous les keyspaces de la base de données
 */
async function listKeyspaces() {
    const keySpaces = await client.execute('DESCRIBE KEYSPACES');
    console.table(keySpaces.rows);
}
listKeyspaces();


/**
 * main() gère la différentes requêtes à effectuer sur la base
 */
function main() {

    // Ajoute le keyspace
    createKeyspace(`${name}_user`);

    // Ajoute la table 
    createTable(`${name}_user`, `${name}_cfuser`);


    // Vide la table
    truncateTable(`${name}_user`, `${name}_cfuser`);



    // Ajout d'un utilisateur
    /*
    createUser(`${name}_user`, `${name}_cfuser`, 'Sounalet', 'Alexandre', 'miamo.fr', '2002-02-01', 0);
    createUser(`${name}_user`, `${name}_cfuser`, 'Duchesne', 'Tom', 'tom.feur', '1947-02-17', 0);*/
    createUser(`${name}_user`, `${name}_cfuser`, 'Corentin', 'Danvin', {"1" : "cd.fr", "2" : "cd.com"}, 0);

    // Listage des utilisateurs
    listColumns(`${name}_user`, `${name}_cfuser`);

}
main();

/**
 * createKeyspace() ajoute à la base de données un keyspace à partir d'un nom donné
 * @param {String} keyspace
 */
function createKeyspace(keyspace) {
    client.execute(`CREATE KEYSPACE IF NOT EXISTS ${keyspace}
    WITH replication = {
        'class' : 'SimpleStrategy',
        'replication_factor' : 3
    }`);
    console.log(`⭐ Keyspace ${keyspace} ajouté à la base`);
}

/**
 * listColumns() liste toutes les colonnes de la table indiquée en paramètres
 */
function listColumns(keyspace, table) {
    const query = `SELECT * FROM ${keyspace}.${table}`;
    client.execute(query, []).then(result => console.table(result.rows));
}

/**
 * createTable() crée une nouvelle table dans la base à partir d'un keyspace et d'un nom de table
 * @param {String} keyspace Nom du keyspace existant
 * @param {String} tablename Nom de la table à ajouter
 */
async function createTable(keyspace, tableName) {
    const query = `CREATE TABLE IF NOT EXISTS ${keyspace}.${tableName}(
		id UUID PRIMARY KEY,
		lastname text,
		name text,
		email map <text, text>,
		supprime boolean
	);`;
    await client.execute(query);
    console.log(`⭐ Table ${tableName} ajoutée à la base`);
}

async function truncateTable(keyspace, tableName) {
    const query = `TRUNCATE ${keyspace}.${tableName}`;
    await client.execute(query);
    console.log(`⭐ Table ${tableName} vidée`);
}

async function createUser(keyspace, columnFamily, lastname, name, email, supprime) {
    const query = `insert into ${keyspace}.${columnFamily} (id, lastname, name, email, supprime) values (uuid(), ?, ?, ?, ?)`;


    await client.execute(query, [lastname, name, email, supprime]);
    console.log(`⭐ Utilisateur ${name} ajouté à la base ${columnFamily}`);
}