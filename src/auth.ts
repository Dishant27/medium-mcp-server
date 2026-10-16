import { config } from 'dotenv';

config();

/**
 * Medium auth.
 *
 * Medium's official API is deprecated: new integration tokens can no longer be
 * created, and the OAuth app flow is limited to existing integrations. If you
 * already have an integration token, set MEDIUM_INTEGRATION_TOKEN and it will
 * be sent as a Bearer token.
 *
 * Logging goes to stderr only; stdout is reserved for the MCP protocol.
 */
class MediumAuth {
  private accessToken: string;

  constructor() {
    const token = process.env.MEDIUM_INTEGRATION_TOKEN;
    if (!token) {
      throw new Error(
        'MEDIUM_INTEGRATION_TOKEN is not set. Medium no longer issues new API tokens; ' +
          'this server only works with an existing integration token. See README.'
      );
    }
    this.accessToken = token;
  }

  public getAccessToken(): string {
    return this.accessToken;
  }
}

export default MediumAuth;
