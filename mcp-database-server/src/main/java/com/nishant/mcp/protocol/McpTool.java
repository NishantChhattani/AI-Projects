package com.nishant.mcp.protocol;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;

public class McpTool {
    private String name;
    private String description;
    private JsonNode inputSchema;

    public McpTool(String name, String description, JsonNode inputSchema) {
        this.name = name;
        this.description = description;
        this.inputSchema = inputSchema;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public JsonNode getInputSchema() { return inputSchema; }
    public void setInputSchema(JsonNode inputSchema) { this.inputSchema = inputSchema; }
}
