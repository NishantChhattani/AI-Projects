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
public class ListTablesTool implements McpToolHandler {

    private final JdbcTemplate jdbcTemplate;
    private final McpTool definition;

    public ListTablesTool(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "object");
        schema.set("properties", objectMapper.createObjectNode());
        
        this.definition = new McpTool(
            "list_tables",
            "Lists all available tables in the connected database.",
            schema
        );
    }

    @Override
    public McpTool getDefinition() {
        return definition;
    }

    @Override
    public McpToolCallResult execute(JsonNode arguments) {
        try {
            // This query works for PostgreSQL and H2
            String query = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' OR table_schema = 'PUBLIC'";
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(query);
            
            String resultText = rows.stream()
                .map(row -> row.get("TABLE_NAME").toString())
                .collect(Collectors.joining("\n"));

            if (resultText.isEmpty()) {
                resultText = "No tables found in the public schema.";
            }

            return new McpToolCallResult(List.of(new McpToolCallResult.Content("text", resultText)), false);
        } catch (Exception e) {
            return new McpToolCallResult(List.of(new McpToolCallResult.Content("text", "Error executing query: " + e.getMessage())), true);
        }
    }
}
