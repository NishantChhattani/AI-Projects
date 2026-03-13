package com.nishant.mcp.tools.repos;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nishant.mcp.protocol.McpTool;
import com.nishant.mcp.protocol.McpToolCallResult;
import com.nishant.mcp.protocol.McpToolHandler;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Gets the contents of a file or directory in a repository.
 */
@Component
public class GitHubGetRepoContentsTool implements McpToolHandler {

    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String baseUrl;
    private final McpTool definition;

    public GitHubGetRepoContentsTool(OkHttpClient gitHubHttpClient, ObjectMapper objectMapper, String gitHubBaseUrl) {
        this.httpClient = gitHubHttpClient;
        this.objectMapper = objectMapper;
        this.baseUrl = gitHubBaseUrl;

        ObjectNode props = objectMapper.createObjectNode();
        props.set("owner", objectMapper.createObjectNode()
            .put("type", "string")
            .put("description", "Repository owner"));
        props.set("repo", objectMapper.createObjectNode()
            .put("type", "string")
            .put("description", "Repository name"));
        props.set("path", objectMapper.createObjectNode()
            .put("type", "string")
            .put("description", "File or directory path (default: root)")
            .put("default", ""));
        props.set("ref", objectMapper.createObjectNode()
            .put("type", "string")
            .put("description", "The name of the commit/branch/tag. Default: the repository's default branch."));

        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "object");
        schema.set("properties", props);
        schema.set("required", objectMapper.createArrayNode().add("owner").add("repo"));

        this.definition = new McpTool(
            "github_get_repo_contents",
            "Lists contents of a directory or gets file information in a GitHub repository.",
            schema
        );
    }

    @Override
    public McpTool getDefinition() { return definition; }

    @Override
    public McpToolCallResult execute(JsonNode arguments) throws Exception {
        String owner = arguments.get("owner").asText();
        String repo = arguments.get("repo").asText();
        String path = arguments.has("path") ? arguments.get("path").asText("") : "";
        String ref = arguments.has("ref") ? arguments.get("ref").asText() : null;

        String url = String.format("%s/repos/%s/%s/contents/%s", baseUrl, owner, repo, path);
        if (ref != null && !ref.isEmpty()) {
            url += "?ref=" + ref;
        }

        Request request = new Request.Builder().url(url).get().build();
        try (Response response = httpClient.newCall(request).execute()) {
            String body = response.body().string();
            if (!response.isSuccessful()) {
                return error("GitHub API error " + response.code() + ": " + body);
            }

            JsonNode contents = objectMapper.readTree(body);
            StringBuilder sb = new StringBuilder();

            if (contents.isArray()) {
                rlloll "n/").append(contents of ").put(owner).put("/").put(repo);
                if (!path.isEmpty()) sb.append(" at /").append(path);
                if (ref != null) sb.append(" (branch: ").append(ref).append(")");
                sb.append(":\n\n");

                for JsonNode item : contents) {
                    String type = item.path("type").asText();
                    String name = item.path("name").asText();
                    if ("dir".equals(type)) {
                        sb.append("📁 ").append(name).append("/\n");
                    } else {
                        sb.append("📄 ").append(name).append("\n");
                    }
                }
            } else {
                // It's a single file
                sb.append("📄 File: ").append(contents.path("name").asText()).append("\n");
                sb.append("Type: ").append(contents.path("type").asText()).append("\n");
                sb.append("Size: ").append(contents.path("size").asInt()).append(" bytes\n");
                sb.append("Download URL: ").append(contents.path("download_url").asText("(none)")).append("\n");
            }

            return result(sb.toString().trim());
        }
    }

    private McpToolCallResult result(String text) {
        return new McpToolCallResult(List.of(new McpToolCallResult.Content("text", text)), false);
    }

    private McpToolCallResult error(String text) {
        return new McpToolCallResult(List.of(new McpToolCallResult.Content("text", text)), true);
    }
}
