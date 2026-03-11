import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Starting Java MCP Server...");

  // Path to the built jar file
  const jarPath = path.join(__dirname, "..", "target", "mcp-database-server-0.0.1-SNAPSHOT.jar");

  // Configure the Stdio Transport to spawn the Java process
  const transport = new StdioClientTransport({
    command: "java",
    args: ["-jar", jarPath],
  });

  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  try {
    console.log("Connecting to server...");
    await client.connect(transport);
    console.log("Connected successfully!\n");

    // 1. List available tools
    console.log("--- Available Tools ---");
    const toolsResponse = await client.listTools();
    toolsResponse.tools.forEach(t => console.log(`- ${t.name}: ${t.description}`));
    console.log("\n");

    // 2. Call list_tables
    console.log("--- Calling: list_tables ---");
    const listTablesResult = await client.callTool({
      name: "list_tables",
      arguments: {}
    });
    console.log(listTablesResult.content[0].text);
    console.log("\n");

    // 3. Call run_read_only_query
    console.log("--- Calling: run_read_only_query ---");
    const queryResult = await client.callTool({
      name: "run_read_only_query",
      arguments: {
        query: "SELECT * FROM information_schema.tables WHERE table_schema='PUBLIC'"
      }
    });
    console.log(queryResult.content[0].text);
    console.log("\n");

    // 4. Skip update query for this run
    // console.log("--- Calling: run_update_query ---");

    // 5. Verify the insertion using run_read_only_query
    console.log("--- Calling: run_read_only_query (Get Employees Table) ---");
    const verifyResult = await client.callTool({
      name: "run_read_only_query",
      arguments: {
        query: "SELECT * FROM employees"
      }
    });
    console.log(verifyResult.content[0].text);
    console.log("\n");

  } catch (error) {
    console.error("Error during MCP communication:", error);
  } finally {
    console.log("Closing connection...");
    // The Java process runs as a daemon listening to stdio, closing transport kills the child process gracefully.
    await transport.close();
  }
}

main();
