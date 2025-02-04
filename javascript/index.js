// .env
const env = require('dotenv');
const crypto = require('crypto')
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
async function main() {

    // Ajoute le keyspace
    await createKeyspace(`${name}_user`);

    // Suppression de la table 
    // (utile pour ceux qui avaient déjà une ancienne version de la table, qui n'avait pas la même structure ce qui provoquait un crash)
    await dropTable(`${name}_user`, `${name}_cfuser`);

    // Ajoute la table 
    await createTable(`${name}_user`, `${name}_cfuser`);

    // Vide la table
    await truncateTable(`${name}_user`, `${name}_cfuser`);

    // Ajout d'un utilisateur
    // promise.all pour attendre le resulat de toutes les promesse a l'interieur du tableau
    await Promise.all([
        createUser(`${name}_user`, `${name}_cfuser`, crypto.randomUUID(), 'Sounalet', 'Alexandre', 'miamo.fr', '2002-02-01', 0),
        createUser(`${name}_user`, `${name}_cfuser`, crypto.randomUUID(), 'Duchesne', 'Tom', 'tom.feur', '1947-02-17', 0),
        createUser(`${name}_user`, `${name}_cfuser`, crypto.randomUUID(), 'Sounalet', 'Alexandre', 'miamo.fr', '2002-02-01', 0)
    ])

    // Listage des utilisateurs
    await listColumns(`${name}_user`, `${name}_cfuser`);

}
main();

/**
 * createKeyspace() ajoute à la base de données un keyspace à partir d'un nom donné
 * @param {String} keyspace
 */
async function createKeyspace(keyspace) {
    await client.execute(`CREATE KEYSPACE IF NOT EXISTS ${keyspace}
    WITH replication = {
        'class' : 'SimpleStrategy',
        'replication_factor' : 3
    }`);
    console.log(`⭐ Keyspace ${keyspace} ajouté à la base`);
}

/**
 * listColumns() liste toutes les colonnes de la table indiquée en paramètres
 */
async function listColumns(keyspace, table) {
    const query = `SELECT * FROM ${keyspace}.${table}`;
    const result = await client.execute(query, [])
    console.table(result.rows.map(row => ({...row, id: row.id.toString(), datenaissance: row.datenaissance.toString() })));
    client.shutdown();
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
		email text,
		dateNaissance date,
		fullname map<text, text>,
		supprime boolean,
	);`;
    await client.execute(query);
    console.log(`⭐ Table ${tableName} ajoutée à la base`);
}

/**
 * dropTable() supprime une table dans la base à partir d'un keyspace et d'un nom de table
 * @param {String} keyspace Nom du keyspace existant
 * @param {String} tablename Nom de la table à supprimer
 */
async function dropTable(keyspace, tableName) {
    const query = `DROP TABLE IF EXISTS ${keyspace}.${tableName};`;
    await client.execute(query);
    console.log(`⭐ Table ${tableName} a bien été supprimé`);
}

/**
 * truncateTable() supprime toutes les données d'une table à partir d'un keyspace et d'un nom de table
 * @param {String} keyspace Nom du keyspace existant
 * @param {String} tablename Nom de la table à vider
 */
async function truncateTable(keyspace, tableName) {
    const query = `TRUNCATE ${keyspace}.${tableName}`;
    await client.execute(query);
    console.log(`⭐ Table ${tableName} vidée`);
}

/**
 * createUser() ajoute un utilisateur en fonction d'un keyspace, d'une table et des données de l'utilisateur
 * @param {String} keyspace Nom du keyspace existant
 * @param {String} columnFamily Nom de la table dans laquelle insérer l'utilisateur
 * @param {String} id Id de l'utilisateur
 * @param {String} lastname Nom de famille de l'utilisateur
 * @param {String} name Prénom de l'utilisateur
 * @param {String} email Email de l'utilisateur
 * @param {String} dateNaissance Date de naissance de l'utilisateur
 * @param {int} supprime Indicateur de suppression de l'utilisateur
 */
async function createUser(keyspace, columnFamily, id, lastname, name, email, dateNaissance, supprime) {
    let fullname = {"name": name, "lastname": lastname}

    const query = `insert into ${keyspace}.${columnFamily} (id, lastname, name, email, dateNaissance, fullname, supprime) values (?, ?, ?, ?, ?, ?, ?)`;
    await client.execute(query, [id, lastname, name, email, dateNaissance, fullname, supprime], {prepare: true});

    console.log(`⭐ Utilisateur ${name} ajouté à la base ${columnFamily}`);
}
