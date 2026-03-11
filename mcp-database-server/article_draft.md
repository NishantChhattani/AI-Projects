# Article Draft: Connecting Claude to Legacy Databases

**Title**: Connecting Claude to legacy Databases: Building an MCP Server in Java & Spring Boot

**Subtitle**: How to securely expose enterprise data to LLMs using the Model Context Protocol and Spring Boot.

## Introduction
The Model Context Protocol (MCP) is revolutionizing how AI interacts with external systems. While Python and TypeScript dominate the AI ecosystem, many large enterprises—banks, healthcare providers, and logistics companies—rely heavily on Java and Spring Boot for their backend infrastructure.

In this article, I’ll walk you through how I built an open-source MCP Server in **Java using Spring Boot** to securely expose a legacy relational database to Claude, allowing the LLM to write and execute SQL queries on the fly.

## The Challenge: LLMs Can't Access Your Data
One of the biggest limitations of models like Claude is that they don't have access to your proprietary data. If an analyst asks, *"How many active subscriptions did we have last month?"*, Claude can write the SQL, but it can't execute it. 

The traditional solution is to build a custom REST API or a GraphQL layer and give the LLM an OpenAPI spec. But that requires significant boilerplate, authentication handling, and continuous maintenance.

## Enter the Model Context Protocol (MCP)
MCP solves this by providing a standardized, open protocol that allows developers to write “tools” or "resources" that a model can interact with natively. 

Using MCP over standard input/output (stdio), we can create a lightweight binary that runs locally alongside Claude Desktop, connecting directly to our database.

## Architecture: Why Java and Spring Boot?
Given my background in distributed systems at IBM, I know that enterprise environments value robustness, type safety, and the extensive ecosystem of Java. Spring Boot provides `JdbcTemplate`, which makes dynamic database querying incredibly straightforward.

**The Tech Stack**:
- **Java 17+**
- **Spring Boot 3.x**
- **Jackson** for JSON-RPC parsing

## Building the Server
The core of the server is a standard JSON-RPC 2.0 implementation over `stdio`. 
In Spring Boot, I implemented a `CommandLineRunner` that loops continuously, reading from `System.in` and writing to `System.out`.

```java
// Snippet of the protocol handler
BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
String line;
while ((line = reader.readLine()) != null) {
    JsonRpcRequest request = objectMapper.readValue(line, JsonRpcRequest.class);
    JsonRpcResponse response = handleRequest(request);
    System.out.println(objectMapper.writeValueAsString(response));
}
```

### Exposing the Database Tools
I built three core tools that give Claude deep context into the database:
1. `list_tables`: Queries `information_schema.tables` to return all available tables.
2. `get_schema`: Takes a `table_name` argument and returns columns and datatypes.
3. `run_read_only_query`: Takes a `query` argument, enforces a `SELECT` check, and executes it via `JdbcTemplate.queryForList()`.

By wrapping these inside Spring `@Component` classes and registering them with the MCP Handler, new tools can be added seamlessly.

## Security Considerations
When giving an LLM access to a database, security is paramount.
- **Read-Only Enforcement**: The server intercepts the query and ensures it starts with `SELECT`.
- **Database Permissions**: I strongly recommend that the data source configured in `application.properties` uses a dedicated database user with strictly scoped read-only privileges.

## Testing it with Claude Desktop
To integrate this, you simply add the compiled Spring Boot jar to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "database-explorer": {
      "command": "java",
      "args": ["-jar", "/path/to/mcp-database-server-0.0.1-SNAPSHOT.jar"]
    }
  }
}
```
Restart Claude, and instantly, Claude can securely explore your database schema and answer complex analytical questions without you ever writing a single custom API endpoint.

## Conclusion
Building an MCP Server in Java demonstrates how modern AI workflows can integrate seamlessly with mature, enterprise-grade technologies. 

Check out the full open-source code on my GitHub!

*(Link to GitHub repository here)*
