import { config } from 'dotenv';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import MediumAuth from './auth.js';
import MediumClient from './client.js';

config();

// stdout carries the MCP protocol; log to stderr only.
async function run(label: string, fn: () => Promise<unknown>): Promise<CallToolResult> {
  try {
    const data = await fn();
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  } catch (error: any) {
    return { isError: true, content: [{ type: 'text', text: `${label} failed: ${error.message}` }] };
  }
}

async function main() {
  const client = new MediumClient(new MediumAuth());
  const server = new McpServer({ name: 'medium-mcp-server', version: '1.1.0' });

  server.registerTool(
    'get-profile',
    { title: 'Get profile', description: 'Get the Medium profile for the integration token' },
    async () => run('get-profile', () => client.getUserProfile())
  );

  server.registerTool(
    'get-publications',
    { title: 'Get publications', description: 'List publications the user owns, edits or writes for' },
    async () => run('get-publications', () => client.getUserPublications())
  );

  server.registerTool(
    'publish-article',
    {
      title: 'Create post',
      description:
        'Create a Medium post (as a draft by default) on your profile or in a publication you can write to',
      inputSchema: {
        title: z.string().min(1).describe('Post title'),
        content: z.string().min(1).describe('Post body'),
        contentFormat: z.enum(['markdown', 'html']).optional().describe('Defaults to markdown'),
        tags: z.array(z.string()).max(5).optional().describe('Up to 5 tags'),
        publicationId: z.string().optional().describe('Publish into this publication instead of your profile'),
        publishStatus: z.enum(['draft', 'public', 'unlisted']).optional().describe('Defaults to draft'),
        canonicalUrl: z.string().url().optional().describe('Original URL if cross-posting')
      }
    },
    async (args) => run('publish-article', () => client.createPost(args))
  );

  await server.connect(new StdioServerTransport());
  console.error('medium-mcp-server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error.message ?? error);
  process.exit(1);
});
