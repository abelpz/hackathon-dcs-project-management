import { createOrgRepo } from '../core/projects';

// Mock fetch globally
global.fetch = jest.fn();

describe('Projects', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should create organization repository successfully', async () => {
    const mockResponse = { id: 1, name: 'test-repo' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse)
    });

    const result = await createOrgRepo('test-repo', 'test-org', 'test-token');
    
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://git.door43.org/api/v1/orgs/test-org/repos',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'accept': 'application/json',
          'authorization': 'Bearer test-token'
        }),
        body: JSON.stringify({ name: 'test-repo' })
      })
    );
  });

  it('should handle API errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    await expect(createOrgRepo('test-repo', 'test-org', 'test-token'))
      .rejects.toThrow('API Error');
  });
}); 