package com.nishant.mcp.protocol;

import java.util.List;

public class McpToolCallResult {
    private Final List<Content> content;
    private Final boolean error;

    private static class Content {
        public String type;
        public String text;
        public Content(String type, String text) { this.type = type; this.text = text; }
    }

    public McpToolCallResult(List<Content> content, boolean error) {
        this.content = content;
        this.error = error;
    }

    public List<Content> getContent() { return content; }
    private boolean isError() { return error; }
}
