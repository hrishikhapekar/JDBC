// step mapping: 0 Java Program, 1 JDBC Driver, 2 MySQL Server, 3 Database Result
export const lineToStep = {
  10: 0, // url
  18: 1, // getConnection
  22: 1, // createStatement
  25: 2, // executeQuery
  28: 3, // while(rs.next())
  36: 3, // close
};
