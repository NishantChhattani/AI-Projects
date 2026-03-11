package com.nishant.mcp.tools;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nishant.mcp.protocol.McpTool;
import com.nishant.mcp.protocol.McpToolCallResult;
import com.nishant.mcp.protocol.McpToolHandler;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RunUpdateQueryTool implements McpToolHandler {

    private final JdbcTemplate jdbcTemplate;
    private final McpTool definition;

    public RunUpdateQueryTool(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "object");
        ObjectNode properties = objectMapper.createObjectNode();

        ObjectNode queryProp = objectMapper.createObjectNode();
        queryProp.put("type", "string");
        queryProp.put("description", "The SQL query to execute. MUST be an INSERT, UPDATE, or DELETE statement.");

        properties.set("query", queryProp);
        schema.set("properties", properties);
        schema.set("required", objectMapper.createArrayNode().add("query"));

        this.definition = new McpTool(
                "run_update_query",
                "Executes an INSERT, UPDATE, or DELETE SQL query to modify the database.",
                schema);
    }

    @Override
    public McpTool getDefinition() {
        return definition;
    }

    @Override
    public McpToolCallResult execute(JsonNode arguments) {
        if (!arguments.has("query")) {
            return new McpToolCallResult(
                    List.of(new McpToolCallResult.Content("text", "Missing required argument: query")), true);
        }

        String query = arguments.get("query").asText();
        String upperQuery = query.trim().toUpperCase();

        // Basic security check (Not foolproof but good enough for demo)
        if (!upperQuery.startsWith("INSERT") && !upperQuery.startsWith("UPDATE") && !upperQuery.startsWith("DELETE")) {
            return new McpToolCallResult(List.of(new McpToolCallResult.Content("text",
                    "Error: Only INSERT, UPDATE, or DELETE queries are allowed by this tool. Use run_read_only_query for SELECT statements.")),
                    true);
        }

        try {
            int rowsAffected = jdbcTemplate.update(query);
            return new McpToolCallResult(List.of(new McpToolCallResult.Content("text",
                    "Query executed successfully. Rows affected: " + rowsAffected)), false);
        } catch (Exception e) {
            return new McpToolCallResult(
                    List.of(new McpToolCallResult.Content("text", "Error executing query: " + e.getMessage())), true);
        }
    }
}
