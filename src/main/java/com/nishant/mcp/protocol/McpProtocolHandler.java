package com.nishant.mcp.protocol;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.util.HashMap;
import java.util.Map;

@Service
public class McpProtocolHandler implements CommandLineRunner {

    private final ObjectMapper objectMapper;
    private final Map<String, McpToolHandler> tools = new HashMap<>();

    public McpProtocolHandler(ObjectMapper objectMapper, java.util.List<McpToolHandler> toolHandlers) {
        this.objectMapper = objectMapper;
        for (McpToolHandler handler : toolHandlers) {
            tools.put(handler.getDefinition().getName(), handler);
        }
    }

    @Override
    public void run(String... args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        PrintStream writer = System.out;

        String line;
        while ((line = reader.readLine()) != null) {
            if (line.trim().isEmpty()) continue;

            try {
                JsonRpcRequest request = objectMapper.readValue(line, JsonRpcRequest.class);
                JsonRpcResponse response = handleRequest(request);

                if (response != null) {
                    writer.println(objectMapper.writeValueAsString(response));
                    writer.flush();
                }

            } catch (Exception e) {
                JsonRpcResponse errorResponse = new JsonRpcResponse(null, new JsonRpcError(-32700, "Parse error: " + e.getMessage()));
                writer.println(objectMapper.writeValueAsString(errorResponse));
                writer.flush();
            }
        }
    }

    private JsonRpcResponse handleRequest(JsonRpcRequest request) {
        String method = request.getMethod();
        
        // MCP Standard Initialization
        if ("initialize".equals(method)) {
            Map<String, Object> result = new HashMap<>();
            result.put("protocolVersion", "2024-11-05");
            result.put("capabilities", Map.of("tools", Map.of()));
            result.put("serverInfo", Map.of("name", "database-explorer", "version", "1.0.0"));
            return new JsonRpcResponse(request.getId(), result);
        }

        if ("notifications/initialized".equals(method)) {
            return null; // Fire and forget
        }

        if ("tools/list".equals(method)) {
            Map<String, Object> result = new HashMap<>();
            result.put("tools", tools.values().stream().map(McpToolHandler::getDefinition).toList());
            return new JsonRpcResponse(request.getId(), result);
        }

        if ("tools/call".equals(method)) {
            JsonNode params = request.getParams();
            String toolName = params.has("name") ? params.get("name").asText() : null;
            JsonNode args = params.has("arguments") ? params.get("arguments") : objectMapper.createObjectNode();

            McpToolHandler handler = tools.get(toolName);
            if (handler == null) {
                return new JsonRpcResponse(request.getId(), new JsonRpcError(-32601, "Tool not found: " + toolName));
            }

            try {
                McpToolCallResult toolResult = handler.execute(args);
                return new JsonRpcResponse(request.getId(), toolResult);
            } catch (Exception e) {
                return new JsonRpcResponse(request.getId(), new JsonRpcError(-32603, "Internal error: " + e.getMessage()));
            }
        }

        return new JsonRpcResponse(request.getId(), new JsonRpcError(-32601, "Method not found: " + method));
    }
}
