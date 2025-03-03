import { getToken } from '../core/authentication';

// Mock fetch globally
global.fetch = jest.fn();

describe('Authentication', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should get token successfully', async () => {
    const token = await getToken("testuser", "testpass");
    console.log({token});
    expect(token).toBeDefined();
  });

}); 