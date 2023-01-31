import com.datastax.oss.driver.api.core.CqlSession;
import com.datastax.oss.driver.api.core.cql.ResultSet;
import com.datastax.oss.driver.api.core.cql.Row;
import java.time.LocalDate;
import java.util.UUID;

public class Main {
    public static void main(String[] args) {

        public static final String HOST = "127.0.0.1:9042", "127.0.0.1:9043", "127.0.0.1:9044";
        public static final int PORT = 9042;
        public static final String KEYSPACE = "system";
        public static final String TABLE_NAME = "vm_cfuser";
        public static final String USER_NAME = "vm_user";


        try (CqlSession session = CqlSession.builder().addContactPointsWithPorts(HOST).build()) {
            createKeyspace(session, USER_NAME);
            createTable(session, USER_NAME, TABLE_NAME);
            truncateTable(session, USER_NAME, TABLE_NAME);
            insertData(session, USER_NAME, TABLE_NAME, "KOULIBALY", "BAFODE", "KOULIBALY.BAFODE@ETU.UNILIM.FR", LocalDate.of(2001, 12, 15), false);
            insertData(session, USER_NAME, TABLE_NAME, "MAZABRAUD", "VALENTIN", "MAZABRAUD.VALENTIN@ETU.UNILIM.FR", LocalDate.of(2002, 5, 10), false);
            insertData(session, USER_NAME, TABLE_NAME, "BAURI", "ANTOINE", "BAURI.ANTOINE@ETU.UNILIM.FR", LocalDate.of(2002, 12, 15), true);
            selectData(session, USER_NAME, TABLE_NAME);
        }
    }

    public static void createKeyspace(CqlSession session, String keyspace) {
        String query = String.format("CREATE KEYSPACE IF NOT EXISTS %s WITH replication = {'class':'SimpleStrategy', 'replication_factor':3}", keyspace);
        session.execute(query);
        System.out.println("📦 The " + keyspace + " keyspace has been created");
    }

    public static void createTable(CqlSession session, String keyspace, String nameTable) {
        String query = String.format("CREATE TABLE IF NOT EXISTS %s.%s (id UUID PRIMARY KEY, lastname text, name text, email text, dateNaissance date, supprime boolean);", keyspace, nameTable);
        session.execute(query);
        System.out.println("📁 The " + nameTable + " table has been created");
    }

    public static void truncateTable(CqlSession session, String keyspace, String nameTable {
        String query = String.format("TRUNCATE %s.%s", keyspace, nameTable);
        session.execute(query);
        System.out.println("🚫 The " + nameTable + " table has been emptied ");
    }

    public static void insertData(CqlSession session, String keyspace, String columnFamily, String lastname, String name, String email, LocalDate dateNaissance, boolean supprime) {
        UUID id = UUID.randomUUID();
        String query = String.format("INSERT INTO %s.%s (id, lastname, name, email, dateNaissance, supprime) VALUES (?, ?, ?, ?, ?, ?)", keyspace, columnFamily);
        session.execute(query, id, lastname, name, email, dateNaissance, supprime);
    }

    public static void selectData(CqlSession session, String keyspace, String nameTable) {
        String query = String.format("SELECT * FROM %s.%s", keyspace, nameTable);
        ResultSet result = session.execute(query);
        for (Row row : result) {
            UUID id = row.getUuid("id");
            String lastname = row.getString("lastname");
            String name = row.getString("name");
            String email = row.getString("email");
            LocalDate dateNaissance = row.getLocalDate("dateNaissance");
            boolean supprime = row.getBoolean("supprime");
            System.out.println("id : " + id + ", lastname : " + lastname + ", name : " + name + ", email : " + email + ", dateNaissance : " + dateNaissance + ", supprime : " + supprime);
        }
    }
}