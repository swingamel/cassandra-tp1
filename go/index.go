package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/fatih/color"
	"github.com/gocql/gocql"
	"github.com/rodaine/table"
)

const name = "vm"

func main() {
	// Connect to a cluster
	cluster := gocql.NewCluster("127.0.0.1:9042", "127.0.0.1:9043", "127.0.0.1:9044")

	// Create session
	c := *cluster
	c.Keyspace = "system"
	c.Timeout = 20 * time.Second
	session, err := c.CreateSession()
	if err != nil {
		log.Fatal(err)
	}

	// Create a keyspace
	createKeyspace(session, name+"_user")

	// Create a table
	createTable(session, name+"_user", name+"_cfuser")

	// Truncate the table
	truncateTable(session, name+"_user", name+"_cfuser")

	// Insert data x3
	fmt.Println()
	insertData(session, name+"_user", name+"_cfuser", "KOULIBALY", "BAFODE", "KOULIBALY.BAFODE@ETU.UNILIM.FR", "2001-12-15", false)
	insertData(session, name+"_user", name+"_cfuser", "MAZABRAUD", "VALENTIN", "MAZABRAUD.VALENTIN@ETU.UNILIM.FR", "2002-05-10", false)
	insertData(session, name+"_user", name+"_cfuser", "BAURI", "ANTOINE", "BAURI.ANTOINE@ETU.UNILIM.FR", "2002-12-15", true)
	fmt.Println()

	// Select data
	selectData(session, name+"_user", name+"_cfuser")
}

func createKeyspace(session *gocql.Session, keyspace string) {
	err := session.Query(fmt.Sprintf(`CREATE KEYSPACE IF NOT EXISTS %s
    WITH replication = {
        'class' : 'SimpleStrategy',
        'replication_factor' : 3
    }`, keyspace)).Exec()

	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("\n" + `📦 The ` + keyspace + ` keyspace has been created`)
}

func createTable(session *gocql.Session, keyspace string, nameTable string) {
	err := session.Query(`CREATE TABLE IF NOT EXISTS ` + keyspace + `.` + nameTable + `(
		id UUID PRIMARY KEY,
		lastname text,
		name text,
		email text,
		dateNaissance date,
		fullname map<text, text>,
		supprime boolean
	);`).Exec()

	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("\n" + `📁 The ` + nameTable + ` table has been created `)
}

func truncateTable(session *gocql.Session, keyspace string, nameTable string) {
	err := session.Query(`TRUNCATE ` + keyspace + `.` + nameTable).Exec()

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("\n" + `🚫 The ` + nameTable + ` table has been emptied `)
}

func insertData(session *gocql.Session, keyspace string, columnFamily string, lastname string, name string, email string, dateNaissance string, supprime bool) {

	id, _ := gocql.RandomUUID()

	fullname := map[string]string{"name": name, "lastname": lastname}

	if err := session.Query(`insert into `+keyspace+`.`+columnFamily+` (id, lastname, name, email, dateNaissance, supprime, fullname) values (?, ?, ?, ?, ?, ?, ?)`, id, lastname, name, email, dateNaissance, supprime, fullname).Exec(); err != nil {
		log.Fatal(err)
	}

	fmt.Println(`➕ A user has been added (`, color.CyanString(id.String()), `)`)
}

func selectData(session *gocql.Session, keyspace string, nameColumn string) {
	// configure table renderer
	headerFmt := color.New(color.FgGreen, color.Underline).SprintfFunc()
	columnFmt := color.New(color.FgYellow).SprintfFunc()

	tbl := table.New("ID", "Prénom", "Nom", "Email", "Date de naissance", "Nom complet", "Supprime")
	tbl.WithHeaderFormatter(headerFmt).WithFirstColumnFormatter(columnFmt)

	var id gocql.UUID
	var name string
	var lastname string
	var dateNaissance string
	var email string
	var supprime bool
	var fullname map[string]string

	scanner := session.Query(`SELECT * FROM ` + keyspace + `.` + nameColumn).Iter().Scanner()
	for scanner.Next() {
		err := scanner.Scan(&id, &dateNaissance, &email, &fullname, &lastname, &name, &supprime)
		if err != nil {
			log.Fatal(err)
		}

		json, err := json.Marshal(fullname)
		if err != nil {
			log.Fatal(err)
		}

		tbl.AddRow(id, name, lastname, email, dateNaissance, string(json), supprime)
	}
	tbl.Print()
	fmt.Println()
}
