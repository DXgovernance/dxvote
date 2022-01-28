import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { render } from '../../../utils/tests';
import { default as Editor } from '.';

// an approach mocking up localStorage seems to now work with the expiry hooks.

/*
beforeAll(() => {
  class LocalStorageMock {
    constructor() {
      this.store = {
        'guild/newProposal/description/json':
          '{"value":"{\\"type\\":\\"doc\\",\\"content\\":[{\\"type\\":\\"paragraph\\",\\"content\\":[{\\"type\\":\\"text\\",\\"text\\":\\"test\\"}]}]}","expiry":1643746751964}',
        'guild/newProposal/description/markdown': 'test',
      };
    }

    clear() {
      this.store = {};
    }

    getItem(key) {
      return this.store[key] || null;
    }

    setItem(key, value) {
      this.store[key] = String(value);
    }

    removeItem(key) {
      delete this.store[key];
    }
  }
  global.localStorage = new LocalStorageMock();
});

afterAll(() => {});

test('renders Avatar with src', async () => {
  render(<Editor />);
  expect(screen.getAllByText('test')).toHaveLength(1);
});
*/

// Another approach mocking useLocalStorageWithExpiry

jest.mock('hooks/Guilds/useLocalStorageWithExpiry', () => [
  '{"value":"{\\"type\\":\\"doc\\",\\"content\\":[{\\"type\\":\\"paragraph\\",\\"content\\":[{\\"type\\":\\"text\\",\\"text\\":\\"test\\"}]}]}","expiry":1643747484030}',
  () => {},
]);

test('renders Editor with text test', async () => {
  render(<Editor />);
  expect(screen.getAllByText('test')).toHaveLength(1);
});
