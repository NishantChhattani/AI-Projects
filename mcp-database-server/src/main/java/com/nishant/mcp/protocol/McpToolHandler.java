package com.nishant.mcp.protocol;

import com.fasterxml.jackson.databind.JsonNode;

public interface McpToolHandler {
    McpTool getDefinition();
    McpToolCallResult execute(JsonNode arguments);
}
