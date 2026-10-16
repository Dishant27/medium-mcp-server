import axios from 'axios';
import MediumAuth from './auth.js';

export interface CreatePostParams {
  title: string;
  content: string;
  contentFormat?: 'markdown' | 'html';
  tags?: string[];
  publicationId?: string;
  publishStatus?: 'draft' | 'public' | 'unlisted';
  canonicalUrl?: string;
}

/**
 * Thin client for the endpoints Medium's (deprecated) v1 API actually has:
 * GET /me, GET /users/{userId}/publications, POST /users/{userId}/posts,
 * POST /publications/{publicationId}/posts. There is no search or read-posts
 * endpoint in the official API.
 */
class MediumClient {
  private auth: MediumAuth;
  private baseUrl = 'https://api.medium.com/v1';
  private userId: string | null = null;

  constructor(auth: MediumAuth) {
    this.auth = auth;
  }

  private async request(method: 'get' | 'post', endpoint: string, data?: unknown) {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.auth.getAccessToken()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Charset': 'utf-8'
        },
        data
      });
      return response.data?.data ?? response.data;
    } catch (error: any) {
      const detail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      console.error('Medium API error:', detail);
      throw new Error(detail);
    }
  }

  async getUserProfile() {
    return this.request('get', '/me');
  }

  private async getUserId(): Promise<string> {
    if (!this.userId) {
      const me = await this.getUserProfile();
      this.userId = me.id as string;
    }
    return this.userId;
  }

  async getUserPublications() {
    const userId = await this.getUserId();
    return this.request('get', `/users/${userId}/publications`);
  }

  /** Creates a post. Defaults to a draft so nothing goes public by accident. */
  async createPost(params: CreatePostParams) {
    const body = {
      title: params.title,
      contentFormat: params.contentFormat ?? 'markdown',
      content: params.content,
      tags: params.tags?.slice(0, 5),
      canonicalUrl: params.canonicalUrl,
      publishStatus: params.publishStatus ?? 'draft'
    };
    if (params.publicationId) {
      return this.request('post', `/publications/${params.publicationId}/posts`, body);
    }
    const userId = await this.getUserId();
    return this.request('post', `/users/${userId}/posts`, body);
  }
}

export default MediumClient;
