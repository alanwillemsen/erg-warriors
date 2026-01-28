import {
  Concept2UserSchema,
  Concept2ResultsResponseSchema,
  type Concept2User,
  type Concept2Result,
  type Concept2ResultsResponse,
} from "./types";

const API_BASE_URL = "https://log.concept2.com/api";

export class Concept2Client {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Make an authenticated request to the Concept2 API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Concept2 API error (${response.status}): ${errorText}`
      );
    }

    return response.json();
  }

  /**
   * Get current user information
   */
  async getMe(): Promise<Concept2User> {
    const data = await this.request<any>("/users/me");

    // The API might return the user data directly or wrapped in a data property
    const userData = data.data || data;

    return Concept2UserSchema.parse(userData);
  }

  /**
   * Get workout results with optional filters
   */
  async getResults(params: {
    from?: string; // ISO date string
    to?: string; // ISO date string
    type?: string;
    page?: number;
  } = {}): Promise<Concept2ResultsResponse> {
    const queryParams = new URLSearchParams();

    if (params.from) queryParams.append("from", params.from);
    if (params.to) queryParams.append("to", params.to);
    if (params.type) queryParams.append("type", params.type);
    if (params.page) queryParams.append("page", params.page.toString());

    const endpoint = `/users/me/results${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const data = await this.request<any>(endpoint);
    return Concept2ResultsResponseSchema.parse(data);
  }

  /**
   * Get all workout results within a date range (handles pagination)
   */
  async getAllResults(from?: Date, to?: Date): Promise<Concept2Result[]> {
    const results: Concept2Result[] = [];
    let currentPage = 1;
    let totalPages = 1;

    const params: any = {};
    if (from) params.from = from.toISOString().split("T")[0];
    if (to) params.to = to.toISOString().split("T")[0];

    while (currentPage <= totalPages) {
      const response = await this.getResults({
        ...params,
        page: currentPage,
      });

      results.push(...response.data);
      totalPages = response.meta.pagination.total_pages;
      currentPage++;

      // Add a small delay to avoid rate limiting
      if (currentPage <= totalPages) {
        await this.delay(100);
      }
    }

    return results;
  }

  /**
   * Helper to add delay between requests
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
