package com.nishant.mcp.tools.issues;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nishant.mcp.protocol.McpTool;
import com.nishant.mcp.protocol.McpToolCallResult;
import com.nishant.mcp.protocol.McpToolHandler;
import okhttp3.*;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Adds a comment to an existing issue on a GitHub repository.
 */
@Component
public class GitHubCommentOnIssueTool implements McpToolHandler {

    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String baseUrl;
    private final McpTool definition;

    public GitHubCommentOnIssueTool(OkHttpClient gitHubHttpClient, ObjectMapper objectMapper, String gitHubBaseUrl) {
        this.httpClient = gitHubHttpClient;
        this.objectMapper = objectMapper;
        this.baseUrl = gitHubBaseUrl;

        ObjectNode props = objectMapper.createObjectNode();
        props.set("owner", objectMapper.createObjectNode().put("type", "string").put("description", "Repository owner"));
        props.set("repo", objectMapper.createObjectNode().put("type", "string").put("description", "Repository name"));
        props.set("issue_number", objectMapper.createObjectNode().put("type", "integer").put("description", "Issue number to comment on"));
        props.set("body", objectMapper.createObjectNode().put("type", "string").put("description", "Comment body"));

        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "object");
        schema.set("properties", props);
        schema.set("required", objectMapper.createArrayNode().add("owner").add("repo").add("issue_number").add("body"));

        this.definition = new McpTool(
            "gitHub_comment_on_issue",
            "Adds a comment to an existing issue in a GitHub repository.",
            schema
        );
    }

    @Override
    public McpTool getDefinition() { return definition. }

    @Override
    public McpToolCallResult execute(JsonNode arguments) throws Exception {
        String owner = arguments.path("owner").asText();
        StringÉ•Á¼€€ô…ÉÕµ•¹ÑÌ¹Á…Ñ  ‰É•Á¼ˆ¤¹…ÍQ•áĞ ¤ì(€€€€€€€¥¹Ğ¥ÍÍÕ•9Õ´€ô…ÉÕµ•¹ÑÌ¹Á…Ñ  ‰¥ÍÍÕ•}¹Õµ‰•Èˆ¤¹…Í%¹Ğ À¤ì(€€€€€€€MÑÉ•¹œ‰½‘ä€ô…ÉÕµ•¹ÑÌ¹Á…Ñ  ‰‰½‘äˆ¤¹…ÍQ•áĞ ¤ì((€€€€€€€¥˜€¡½İ¹•È¹¥Í	±…¹¬ ¤ñğÉ•Á¼¹¥Í	±…¹¬ ¤ñğ¥ÍÍÕ•9Õ´€ôô€Àñğ‰½‘ä¹¥Í	±…¹¬ ¤¤ì(€€€€€€€€€€€É•ÑÕÉ¸•ÉÉ½È ˆ½İ¹•Èœ°€É•Á¼œ°€¥ÍÍÕ•}¹Õµ‰•Èœ°…¹€‰½‘äœ…É”É•ÅÕ¥É•¸ˆ¤ì(€€€€€€€ô((€€€€€€€=‰©•Ñ9½‘”‰½‘å5…À€ô½‰©•Ñ5…ÁÁ•È¹É•…Ñ•=‰©•Ñ9½‘” ¤ì(€€€€€€€‰½‘å5…À¹ÁÕĞ ‰‰½‘äˆ°‰½‘ä¤ì((€€€€€€€I•ÅÕ•ÍÑ	½‘äÉ•ÅÕ•ÍÑ	½‘ä€ôI•ÅÕ•ÍÑ	½‘ä¹É•…Ñ”¡½‰©•Ñ5…ÁÁ•È¹İÉ¥Ñ•Y…±Õ•ÍMÑÉ¥¹œ¡‰½‘å5…À¤°)M=8¤ì(€€€€€€€I•ÅÕ•ÍĞÉ•ÅÕ•ÍĞ€ô¹•ÜI•ÅÕ•ÍĞ¹	Õ¥±‘•È ¤(€€€€€€€€€€€€¹ÕÉ°¡‰…Í•UÉ°€¬€ˆ½É•Á½Ì¼ˆ€¬½İ¹•È€¬€ˆ¼ˆ€¬É•Á¼€¬€ˆ½¥ÍÍÕ•Ì¼ˆ€¬¥ÍÍÕ•9Õ´€¬€ˆ½½µµ•¹ÑÌˆ¤(€€€€€€€€€€€€¹Á½ÍĞ¡É•ÅÕ•ÍÑ	½‘ä¤(€€€€€€€€€€€€¹‰Õ¥± ¤ì((€€€€€€€ÑÉä€¡I•ÍÁ½¹Í”É•ÍÁ½¹Í”€ô¡ÑÑÁ±¥•¹Ğ¹¹•İ…±°¡É•ÅÕ•ÍĞ¤¹•á•ÕÑ” ¤¤ì(€€¶      String responseBo[¡ÜˆH™\ÜÛœÙK˜›Öèw"‚’ç7G&–ær‚“°¢–b‚&W7öç6Ræ—57V66W76gVÂ‚’’&WGW&âW'&÷"‚$v—D‡V"’W'&÷""²&W7öç6Ræ6öFR‚’²#¢"²&W7öç6T&õºÈ¤ì((€€€€€€€€€€€)Í½¹9½‘”½µµ•¹Ğ€ô½‰©•Ñ5…ÁÁ•È¹É•…‘QÉ•”¡É•ÍÁ½¹Í•	½‘ä¤ì(€€€€€€€€€€€É•ÑÕÉ¸É•ÍÕ±Ğ ‹Š\„½µµ•¹Ğ…‘‘•ÍÕ•ÍÍ™Õ±±ä…q¹q¸ˆ€¬(€€€€€€€€€€€€€€€€‰½µµ•¹Ğ%è€ˆ€¬½µµ•¹Ğ¹Á…Ñ  ‰¥ˆ¤¹…Í1½¹œ ¤€¬€‰q¸ˆ€¬(€€€€€€€€€€€€€€€€‰UI0è€€€€€€€€ˆ€¬½µµ•¹Ğ¹Á…Ñ  ‰¡Ñµ±}ÕÉ°ˆ¤¹…ÍQ•áĞ ¤¤ì(€€€€€€€ô(€€€ô((€€€ÁÉ¥Ù…Ñ”5ÁQ½½±…±±I•ÍÕ±ĞÉ•ÍÕ±Ğ¡MÑÉ¥¹œÑ•áĞ¤ì(€€€€€€€É•ÑÕÉ¸¹•Ü5ÁQ½½±…±±I•ÍÕ±Ğ¡1¥ÍĞ¹½˜¡¹•Ü5ÁQ½½±…±±I•ÍÕ±Ğ¹½¹Ñ•¹Ğ ‰Ñ•áĞˆ°Ñ•áĞ¤¤°™…±Í”¤ì(€€€ô((€€€ÁÉ¥Ù…Ñ”5ÁQ½½±…±±I•ÍÕ±Ğerror(String text) {
        return new McpToolCallResult(List.of(new McpToolCallResult.Content("text", text)), true);
    }
}
