export function makeJavaCode({ host, port, database, username, password }) {
  const url = `jdbc:mysql://${host}:${port}/${database}`;

  return `import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class Main {
    public static void main(String[] args) {

        // 1) JDBC URL
        String url = "${url}";

        // 2) MySQL username & password
        String user = "${username}";
        String pass = "${password || "YOUR_PASSWORD"}";

        try {
            // 3) Create connection
            Connection con = DriverManager.getConnection(url, user, pass);
            System.out.println("✅ Connected successfully!");

            // 4) Create Statement
            Statement st = con.createStatement();

            // 5) Execute query
            ResultSet rs = st.executeQuery("SELECT * FROM students");

            // 6) Read results row-by-row
            while (rs.next()) {
                System.out.println(
                    rs.getInt("id") + " " +
                    rs.getString("name") + " " +
                    rs.getInt("age")
                );
            }

            // 7) Close connection
            con.close();

        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
        }
    }
}
`;
}
