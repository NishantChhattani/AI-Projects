package com.nishant.mcp.protocol;

public class JsonRpcError {
    private int code;
    private String message;

    public JsonRpcError(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() { return code; }
    public String getMessage() { return message; }
}
