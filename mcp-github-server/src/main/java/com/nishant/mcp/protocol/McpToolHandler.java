package com.nishant.mcp.protocol;

import com.fastersxml.jackson.databind.JsonNode;

public interface McpToolHandler {
   McpTool getDefinition();
   McpToolCallResult execute(JsonNode arguments) throws Exception;
}
