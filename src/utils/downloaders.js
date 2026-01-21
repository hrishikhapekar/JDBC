import JSZip from "jszip";

export function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export async function downloadMavenZip({ javaCode, artifactId = "jdbc-demo" }) {
  const zip = new JSZip();

  // pom.xml
  const pom = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.example</groupId>
  <artifactId>${artifactId}</artifactId>
  <version>1.0-SNAPSHOT</version>

  <properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
  </properties>

  <dependencies>
    <dependency>
      <groupId>mysql</groupId>
      <artifactId>mysql-connector-j</artifactId>
      <version>9.0.0</version>
    </dependency>
  </dependencies>
</project>
`;

  zip.file(`${artifactId}/pom.xml`, pom);
  zip.file(
    `${artifactId}/src/main/java/Main.java`,
    javaCode
  );

  zip.file(
    `${artifactId}/README.txt`,
`Steps to run:
1) Install Java (17+) and Maven
2) Open terminal inside folder ${artifactId}
3) Run:
   mvn compile exec:java -Dexec.mainClass=Main

If exec plugin not available, open in IntelliJ and run Main.java
`
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${artifactId}.zip`;
  a.click();

  URL.revokeObjectURL(url);
}
