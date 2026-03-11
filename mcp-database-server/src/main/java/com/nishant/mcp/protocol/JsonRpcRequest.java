package com.nishant.mcp.protocol;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class JsonRpcRequest {
    private String jsonrpc = "2.0";
    private Object id;
    private String method;
    private JsonNode params;

    // Getters and Setters
    public String getJsonrpc() { return jsonrpc; }
    public void setJsonrpc(String jsonrpc) { this.jsonrpc = jsonrpc; }

    public Object getId() { return id; }
    public void setId(Object id) { this.id = id; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public JsonNode getParams() { return params; }
    public void setParams(JsonNode params) { this.params = params; }
}
