/**
 * Example test file
 * Run with: npm test
 * 
 * This demonstrates the testing structure.
 * Add more tests following this pattern.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import sequelize, { testConnection, syncDatabase } from '../config/database.js';
import User from '../models/User.js';
import { login } from '../services/authService.js';

describe('Authentication System Tests', () => {
  beforeAll(async () => {
    // Setup: Connect to test database
    await testConnection();
    // Use a separate test database in real scenarios
  });

  afterAll(async () => {
    // Cleanup: Close database connection
    await sequelize.close();
  });

  describe('User Model', () => {
    it('should hash password on create', async () => {
      const user = await User.create({
        login: 'testuser',
        passwordHash: 'TestPassword123!',
        name: 'Test User',
        role: 'viewer',
        status: 'active'
      });

      expect(user.passwordHash).not.toBe('TestPassword123!');
      expect(user.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt hash format

      await user.destroy();
    });

    it('should verify password correctly', async () => {
      const user = await User.create({
        login: 'testuser2',
        passwordHash: 'TestPassword123!',
        name: 'Test User 2',
        role: 'viewer',
        status: 'active'
      });

      const isValid = await user.verifyPassword('TestPassword123!');
      expect(isValid).toBe(true);

      const isInvalid = await user.verifyPassword('WrongPassword');
      expect(isInvalid).toBe(false);

      await user.destroy();
    });
  });

  describe('Authentication Service', () => {
    it('should login with valid credentials', async () => {
      // Create test user
      const user = await User.create({
        login: 'testlogin',
        passwordHash: 'TestPassword123!',
        name: 'Test User',
        role: 'viewer',
        status: 'active'
      });

      try {
        const result = await login('testlogin', 'TestPassword123!', '127.0.0.1', 'test-agent');
        
        expect(result.user).toBeDefined();
        expect(result.user.login).toBe('testlogin');
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
      } finally {
        await user.destroy();
      }
    });

    it('should reject invalid credentials', async () => {
      await expect(
        login('nonexistent', 'wrongpassword', '127.0.0.1', 'test-agent')
      ).rejects.toThrow('Invalid credentials');
    });
  });
});

