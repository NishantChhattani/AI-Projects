import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runStandaloneQuery() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error("Usage: npm run query \"<YOUR_SQL_QUERY>\"");
        process.exit(1);
    }

    const queryToRun = args[0];
    const upperQuery = queryToRun.trim().toUpperCase();
    const isUpdate = upperQuery.startsWith("INSERT") || upperQuery.startsWith("UPDATE") || upperQuery.startsWith("DELETE");
    const toolName = isUpdate ? "run_update_query" : "run_read_only_query";

    const jarPath = path.join(__dirname, "..", "target", "mcp-database-server-0.0.1-SNAPSHOT.jar");

    const transport = new StdioClientTransport({
        command: "java",
        args: ["-jar", jarPath],
    });

    const client = new Client(
        { name: "cli-client", version: "1.0.0" },
        { capabilities: {} }
    );

    try {
        await client.connect(transport);

        const result = await client.callTool({
            name: toolName,
            arguments: {
                query: queryToRun
            }
        });

        console.log(`\n--- Query Result ---`);
        console.log(result.content[0].text);
        console.log(`--------------------\n`);

    } catch (error) {
        console.error("Error executing query:", error.message || error);
    } finally {
        await transport.close();
    }
}

runStandaloneQuery();
