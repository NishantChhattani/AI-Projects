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
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class RunQueryTool implements McpToolHandler {

    private final JdbcTemplate jdbcTemplate;
    private final McpTool definition;

    public RunQueryTool(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "object");
        ObjectNode properties = objectMapper.createObjectNode();
        
        ObjectNode queryProp = objectMapper.createObjectNode();
        queryProp.put("type", "string");
        queryProp.put("description", "The SQL query to execute. MUST be a read-only SELECT statement.");
        
        properties.set("query", queryProp);
        schema.set("properties", properties);
        schema.set("required", objectMapper.createArrayNode().add("query"));

        this.definition = new McpTool(
            "run_read_only_query",
            "Executes a read-only SQL query against the database.",
            schema
        );
    }

    @Override
    public McpTool getDefinition() {
        return definition;
    }

    @Override
    public McpToolCallResult execute(JsonNode arguments) {
        if (!arguments.has("query")) {
            return new McpToolCallResult(List.of(new McpToolCallResult.Content("text", "Missing required argument: query")), true);
        }

        String query = arguments.get("query").asText();

        // Basic security check (Not foolproof but good enough for demo)
        if (!query.trim().toUpperCase().startsWith("SELECT")) {
            return new McpToolCallResult(List.of(new McpToolCallResult.Content("text", "Error: Only SELECT queries are allowed.")), true);
        }

        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(query);
            
            if (rows.isEmpty()) {
                return new McpToolCallResult(List.of(new McpToolCallResult.Content("text", "Query executed successfully. 0 rows returned.")), false);
            }

            // Convert result list of maps to a readable text representation
            String resultText = rows.stream()
                .map(row -> row.entrySet().stream()
                    .map(entry -> entry.getKey() + "=" + entry.getValue())
                    .collect(Collectors.joining(", ")))
                .collect(Collectors.joining("\n"));

            return new McpToolCallResult(List.of(new McpToolCallResult.Content("text", resultText)), false);
        } catch (Exception e) {
            return new McpToolCallResult(List.of(new McpToolCallResult.Content("text", "Error executing query: " + e.getMessage())), true);
        }
    }
}
