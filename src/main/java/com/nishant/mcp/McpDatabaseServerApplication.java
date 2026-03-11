package com.nishant.mcp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class McpDatabaseServerApplication {

    public static void main(String[] args) {
        System.exit(SpringApplication.exit(SpringApplication.run(McpDatabaseServerApplication.class, args)));
    }
}
