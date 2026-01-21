export const javaLineExplanations = {
  1: {
    title: "Import JDBC classes",
    meaning: "Imports Connection, DriverManager etc. required for database work.",
    error: "Compilation error if you remove imports.",
    fix: "Keep imports or use full class path.",
  },
  10: {
    title: "JDBC URL",
    meaning: "Tells Java where MySQL is located and which DB to connect.",
    error: "Wrong db name or port gives Communications failure / Unknown database.",
    fix: "Verify URL format: jdbc:mysql://host:3306/dbname",
  },
  18: {
    title: "Connection opened",
    meaning: "Creates a connection between Java app and MySQL.",
    error: "Access denied for user",
    fix: "Check username/password and MySQL user permissions.",
  },

  22: {
    title: "Create Statement",
    meaning: "Statement sends SQL query to the MySQL database.",
    error: "Statement created before connection -> NullPointerException",
    fix: "Always create Statement after successful connection.",
  },
  25: {
    title: "Execute Query",
    meaning: "Runs SELECT SQL query and stores result in ResultSet.",
    error: "Table doesn't exist: students",
    fix: "Create table first OR update table name.",
  },
  28: {
    title: "Read ResultSet",
    meaning: "Moves row-by-row and reads columns by name/id.",
    error: "Column not found",
    fix: "Check column names exactly match DB table.",
  },
  36: {
    title: "Close Connection",
    meaning: "Closes connection to free memory and avoid resource leaks.",
    error: "Not closing connection can cause app slowdown.",
    fix: "Always use con.close() or try-with-resources.",
  },
};
