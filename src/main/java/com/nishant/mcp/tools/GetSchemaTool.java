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
public class GetSchemaTool implements McpToolHandler {

    private final JdbcTemplate jdbcTemplate;
    private final McpTool definition;

    public GetSchemaTool(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "object");
        ObjectNode properties = objectMapper.createObjectNode();
        
        ObjectNode tableNameProp = objectMapper.createObjectNode();
        tableNameProp.put("type", "string");
        tableNameProp.put("description", "The name of the table to get the schema for.");
        
        properties.set("table_name", tableNameProp);
        schema.set("properties", properties);
        schema.set("required", objectMapper.createArrayNode().add("table_name"));

        this.definition = new McpTool(
            "get_schema",
            "Returns the schema (columns, types) for a specific database table.",
            schema
        );
    }

    @Override
    public McpTool getDefinition() {
        return definition;
    }

    @Override
    public McpToolCallResult execute(JsonNode arguments) {
        if (!arguments.has("table_name")) {
            return new McpToolCallResult(List.of(new McpToolCallResult.Content("text", "Missing required argument: table_name")), true);
        }

        String tableName = arguments.get("table_name").asText();

        try {
            String query = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ?";
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(query, tableName);
            
            if (rows.isEmpty()) {
                 // Try upper case since some DBs (H2, Oracle) use uppercase tablenames
                 rows = jdbcTemplate.queryForList(query, tableName.toUpperCase());
            }

            if (rows.isEmpty()) {
                return new McpToolCallResult(List.of(new McpToolCallResult.Content("text", "Table not found: " + tableName)), true);
            }

            String resultText = rows.stream()
                .map(row -> row.get("COLUMN_NAME") + " (" + row.get("DATA_TYPE") + ")")
                .collect(Collectors.joining("\n"));

            return new McpToolCallResult(List.of(new McpToolCallResult.Content("text", resultText)), false);
        } catch (Exception e) {
            return new McpToolCallResult(List.of(new McpToolCallResult.Content("text", "Error executing query: " + e.getMessage())), true);
        }
    }
}
