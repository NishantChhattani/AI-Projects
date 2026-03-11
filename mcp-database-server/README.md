# Database Explorer MCP Server

A Model Context Protocol (MCP) server written in Java using Spring Boot that allows AI models (like Claude) to securely inspect and query your SQL databases.

## 🚀 Overview
The Model Context Protocol (MCP) is an open standard that enables AI models to securely access external tools and data sources. This repository provides a lightweight, robust Java implementation of an MCP server designed specifically for exploring relational databases (PostgreSQL, H2, etc.).

By connecting this to Claude Desktop, you give Claude the ability to:
- See all tables in your database (`list_tables`)
- Inspect the schema, columns, and data types of specific tables (`get_schema`)
- Execute read-only SQL queries to analyze your data (`run_read_only_query`)

## 🛠️ Tech Stack
- **Java 17+**
- **Spring Boot 3.x**
- **Spring Data JDBC**
- **Jackson** (for JSON-RPC parsing)

## 📦 Getting Started

### 1. Build the Server
This project uses Maven. To build the executable jar, run:
```bash
mvn clean install
```
This will generate `target/mcp-database-server-0.0.1-SNAPSHOT.jar`.

### 2. Configure Database Connection
By default, the server runs with an in-memory H2 database for demonstration purposes.
To connect to your own database (e.g., PostgreSQL), edit `src/main/resources/application.properties` before building:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/yourdb
spring.datasource.username=your_user
spring.datasource.password=your_password
spring.datasource.driverClassName=org.postgresql.Driver
```

### 3. Connect to Claude Desktop
To use this with Claude Desktop, you need to add the server to your Claude configuration file.

On macOS, edit `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "database-explorer": {
      "command": "java",
      "args": [
        "-jar",
        "/absolute/path/to/your/mcp-database-server/target/mcp-database-server-0.0.1-SNAPSHOT.jar"
      ]
    }
  }
}
```
*Note: Make sure to replace the path with the absolute path to your built jar file.*

Restart Claude Desktop, and you will see the database tools available! You can then prompt Claude: 
*"What tables are in my database?"* or *"Write a query to find the top 5 users from the users table."*

## 🔒 Security Note
The `run_read_only_query` tool explicitly enforces a check to only allow `SELECT` statements. However, for production systems, it is highly recommended to configure the database user specified in `application.properties` with strict **READ-ONLY** permissions at the database level.

---

## 🚀 Alternative Testing (Without Claude Desktop)

If you don't have Claude Desktop, you can still test and use this MCP server using several other methods:

### Method 1: The Provided Node.js Client
We have included a basic Node.js test script that programmatically connects to the Java server and runs the tools.
1. Ensure you have Node.js installed.
2. Navigate to the `test-client` directory:
   ```bash
   cd test-client
   npm install
   node index.mjs
   ```
3. This will launch the Java server in the background, connect to it, list the tools, and run a sample query.

### Method 2: Cursor IDE
If you use the [Cursor IDE](https://www.cursor.com/), it has built-in support for MCP and allows you to use Gemini, Claude, or OpenAI models.
1. In Cursor, open **Settings** > **Features** > **MCP**.
2. Click **+ Add New MCP Server**.
3. Set the name to `database-explorer`.
4. Set the Type to `command`.
5. Set the Command to: `java -jar /absolute/path/to/mcp-database-server/target/mcp-database-server-0.0.1-SNAPSHOT.jar`.
6. Save it. You can now open the Cursor Chat (Cmd+L) and ask the AI (including Gemini 1.5 Pro) to *"Explore my database tables using the database-explorer tool."*

### Method 3: Cline (VS Code Extension)
[Cline](https://github.com/cline/cline) is a powerful open-source AI assistant for VS Code that supports MCP and Gemini.
1. Install the Cline extension in VS Code.
2. Open the Cline MCP configuration file by clicking the MCP icon in the Cline panel.
3. Add the exact same configuration block shown above for Claude Desktop.
4. Select your Gemini API key in the Cline provider settings, and you are ready to go!
