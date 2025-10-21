import axios, { AxiosInstance } from 'axios';

interface GeneratePolicyRequest {
  description: string;
}

interface Policy {
  policy_id: string;
  timestamp: string;
  description: string;
  policy_json: string;
}

interface GeneratePolicyResponse {
  policy_id: string;
  timestamp: string;
  description: string;
  policy_json: string;
}

interface PoliciesListResponse {
  policies: Policy[];
}

class ApiClient {
  private client: AxiosInstance;
  private apiEndpoint: string;

  constructor() {
    // Get API endpoint from environment or use default
    this.apiEndpoint = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000/api';

    this.client = axios.create({
      baseURL: this.apiEndpoint,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async generatePolicy(description: string): Promise<GeneratePolicyResponse> {
    try {
      const response = await this.client.post<GeneratePolicyResponse>('/policies', {
        description,
      } as GeneratePolicyRequest);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to generate policy');
      }
      throw error;
    }
  }

  async getPolicies(): Promise<Policy[]> {
    try {
      const response = await this.client.get<PoliciesListResponse>('/policies');
      return response.data.policies;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch policies');
      }
      throw error;
    }
  }

  async deletePolicy(policyId: string): Promise<void> {
    try {
      await this.client.delete(`/policies/${policyId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete policy');
      }
      throw error;
    }
  }

  setApiEndpoint(endpoint: string): void {
    this.apiEndpoint = endpoint;
    this.client.defaults.baseURL = endpoint;
  }
}

export default new ApiClient();
