# <img src="https://cdn-static-1.medium.com/_/fp/icons/Medium-Avatar-500x500.svg" alt="Medium Logo" width="32" height="32"> Medium MCP Server

A small [Model Context Protocol](https://modelcontextprotocol.io) server that lets an MCP client (Claude Desktop, Cursor, etc.) create Medium drafts and read your Medium profile and publications.

> [!WARNING]
> **Medium's official API is deprecated.** Medium [no longer supports its API](https://github.com/Medium/medium-api-docs) and has stopped issuing new integration tokens. This server only works if you **already have** a Medium integration token. If you don't, there is currently no official way to get one, and this project can't fix that.

## 📖 Background
[From Thought to Published: How MediumMCP Streamlines the AI-to-Medium Platform Workflow](https://dishantraghav27.medium.com/from-thought-to-published-how-mediummcp-streamlines-the-ai-to-medium-platform-workflow-9e436159d1a2)

## What it can do

The tools map 1:1 to the endpoints Medium's v1 API actually has:

| Tool | What it does | Medium endpoint |
|------|--------------|-----------------|
| `get-profile` | Your user id, username, name, profile URL | `GET /me` |
| `get-publications` | Publications you own, edit or write for | `GET /users/{userId}/publications` |
| `publish-article` | Creates a post (markdown or HTML). **Defaults to `draft`**, can be `public` or `unlisted`, optionally inside a publication | `POST /users/{userId}/posts`, `POST /publications/{id}/posts` |

What it **can't** do: search articles, read posts, read stats, or edit/delete posts. The official API never had those endpoints.

## Setup

Requirements: Node.js 18+ and an existing Medium integration token.

```bash
git clone https://github.com/Dishant27/medium-mcp-server.git
cd medium-mcp-server
npm install
npm run build
```

Copy `.env.example` to `.env` and set your token:

```bash
MEDIUM_INTEGRATION_TOKEN=your_existing_integration_token
```

## Use with Claude Desktop (or any MCP client)

```json
{
  "mcpServers": {
    "medium": {
      "command": "node",
      "args": ["/absolute/path/to/medium-mcp-server/dist/index.js"],
      "env": {
        "MEDIUM_INTEGRATION_TOKEN": "your_existing_integration_token"
      }
    }
  }
}
```

Then ask things like "Create a Medium draft titled ... from this markdown" and review the draft on Medium before publishing.

## No token? Alternatives

- Write to markdown files and import them with Medium's [import tool](https://medium.com/p/import), which also sets the canonical link.
- Publish on a platform with a working API (e.g. dev.to, Hashnode) and cross-post to Medium with a canonical URL.
- Browser automation against medium.com works but is fragile and may break Medium's terms, so it isn't included here.

## License

[MIT](LICENSE)
