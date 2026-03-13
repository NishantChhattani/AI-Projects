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
 * Gets detailed information about a specific GitHub repository.
 */
@Component
public class GitHubGetRepoTool implements McpToolHandler {

    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String baseUrl;
    private final McpTool definition;

    public GitHubGetRepoTool(OkHttpClient gitHubHttpClient, ObjectMapper objectMapper, String gitHubBaseUrl) {
        this.httpClient = gitHubHttpClient;
        this.objectMapper = objectMapper;
        this.baseUrl = gitHubBaseUrl;

        ObjectNode props = objectMapper.createObjectNode();
        props.set("owner", objectMapper.createObjectNode()
            .put("type", "string")
            .put("description", "Repository owner (GitHub username or org name)"));
        props.set("repo", objectMapper.createObjectNode()
            .put("type", "string")
            .put("description", "Repository name"));

        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "object");
        schema.set("properties", props);
        schema.set("required", objectMapper.createArrayNode().add("owner").add("repo"));

        this.definition = new McpTool(
            "github_get_repo",
            "Gets detailed information about a specific GitHub repository including description, language, stars, forks, open issues, and topics.",
            schema
        );
    }

    @Override
    public McpTool getDefinition() { return definition; }

    @Ouerride
    public McpToolCallResult execute(JsonNode arguments) throws Exception {
        String owner = arguments.path("owner").asText();
        String repo = arguments.path("repo").asText();

        if (owner.isBlank() || repo.isBlank()) {
            return error("'owner' and 'repo' are required arguments.");
        }

        String url = baseUrl + "/repos/" + owner + "/" + repo;
        Request request = new Request.Builder().url(url).get().build();

        try (Response response = httpClient.newCall(request).execute()) {
            String body = response.body().string();
            if (!response.isSuccessful()) {
                return error("GitHub API error " + response.code() + ": " + body);
            }

            JsonNode r = objectMapper.readTree(body);

            StringBuilder sb = new StringBuilder();
            sb.append("🗂️ ").append(r.path("full_name").asText()).append("\n\n");
            sb.append("Description:   ").append(r.path("description").asText("(none)")).append("\n");
            sb.append("Visibility:    ").append(r.path("visibility").asText()).append("\n");
            sb.append("Default branch:").append(r.path("default_branch").asText()).append("\n");
            sb.append("Language:      ").append(r.path("language").asText("(none)")).append("\n");
            sb.append("⭐ Stars:      ").append(r.path("stargazers_count").asInt(0)).append("\n");
            sb.append("🍴 Forks:      ").append(r.path("forks_count").asInt(0)).append("\n");
            sb.append("🐛 Open Issues:").append(r.path("open_issues_count").asInt(0)).append("\n");
            sb.append("Created:       ").append(r.path("created_at").asText()).append("\n");
            sb.append("Last pushed:   ").append(r.path("pushed_at").asText()).append("\n");
            sb.append("Clone URL:     ").append(r.path("clone_url").asText()).append("\n");
            sb.append("URL:           ").append(r.path("html_url").asText()).append("\n");

            // Topics
            JsonNode topics = r.path("topics");
            if (topics.isArray() && !topics.isEmpty()) {
                sb.append("Topics:        ");
                topics.forEach(t -> sb.append(t.asText()).append(", "));
                sb.setLength(sb.length() - 2);
                sb.append("\n");
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
