from cassandra.cluster import Cluster
from uuid import uuid4
from prettytable import PrettyTable
from colorama import Fore, Back, Style, init
init()

name = "vm"

def main():
    cluster = Cluster(['127.0.0.1'], port=9042)
    session = cluster.connect('system')

	# Create a keyspace
    createKeyspace(session, name+"_user")

	# Create a table
    createTable(session, name+"_user", name+"_cfuser")

	# Truncate the table
    truncateTable(session, name+"_user", name+"_cfuser")
    
    # cluster.shutdown()
    insertData(session, name+"_user", name+"_cfuser", "KOULIBALY", "BAFODE", "KOULIBALY.BAFODE@ETU.UNILIM.FR", "2001-12-15", False)
    insertData(session, name+"_user", name+"_cfuser", "MAZABRAUD", "VALENTIN", "MAZABRAUD.VALENTIN@ETU.UNILIM.FR", "2002-05-10", False)
    insertData(session, name+"_user", name+"_cfuser", "BAURI", "ANTOINE", "BAURI.ANTOINE@ETU.UNILIM.FR", "2002-12-15", True)

    selectData(session, name+"_user", name+"_cfuser")

    cluster.shutdown()




def createKeyspace(session, keyspace):
    session.execute("""
    CREATE KEYSPACE IF NOT EXISTS %s WITH replication = {
        'class' : 'SimpleStrategy',
        'replication_factor' : 3
    }"""%(keyspace))
    print("\n" + " The " + keyspace + " keyspace has been created")

def createTable(session, keyspace, columnFamily):
    session.execute("CREATE TABLE IF NOT EXISTS %s.%s ( id UUID PRIMARY KEY, lastname text,	name text,	email text,	dateNaissance date,	supprime boolean, fullname map<text, text>);"%(keyspace, columnFamily))

    print("\n" + " The " + columnFamily + " table has been created ")

def truncateTable(session, keyspace, columnFamily):
    session.execute("TRUNCATE %s.%s"%(keyspace, columnFamily))

    print("\n" + " The " + columnFamily + " table has been emptied ")

def insertData(session, keyspace, columnFamily, lastname, name, email, dateNaissance, supprime):
    id = str(uuid4()) 
    
    session.execute("insert into "+keyspace+"."+columnFamily+" (id, lastname, name, email, dateNaissance, supprime, fullname) values (%s, '%s', '%s', '%s', '%s', %s, {'name': '%s', 'lastname': '%s'})"%(id, lastname, name, email, dateNaissance, supprime, name, lastname))


    print(" A user has been added (" + id + ")")

def selectData(session, keyspace, columnFamily):
    rows = session.execute("SELECT * FROM %s.%s"%(keyspace, columnFamily))
    table = PrettyTable([
        Fore.CYAN+'ID'+Style.RESET_ALL, 
        Fore.CYAN+'Lastname'+Style.RESET_ALL, 
        Fore.CYAN+'name'+Style.RESET_ALL, 
        Fore.CYAN+'email'+Style.RESET_ALL, 
        Fore.CYAN+'date de naissance'+Style.RESET_ALL, 
        Fore.CYAN+'nom complet'+Style.RESET_ALL, 
        Fore.CYAN+'supprime'+ Style.RESET_ALL])
    for row in rows:
        table.add_row([row.id, row.lastname, row.name, row.email, row.datenaissance, row.fullname, row.supprime])
        print(type(row.fullname))
    
    print(table)

main()