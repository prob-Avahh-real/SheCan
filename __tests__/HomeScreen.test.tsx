import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../src/screens/HomeScreen';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

describe('SheCan HomeScreen', () => {
  it('renders title and subtitle', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('SheCan')).toBeTruthy();
    expect(getByText(/女生也可以自己动手/)).toBeTruthy();
  });

  it('renders quick tips section', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('管道')).toBeTruthy();
    expect(getByText('电路')).toBeTruthy();
    expect(getByText('家电')).toBeTruthy();
  });

  it('renders featured tutorials', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/下水道堵塞/)).toBeTruthy();
    expect(getByText(/门锁把手/)).toBeTruthy();
  });

  it('renders community CTA', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/姐妹互助社区/)).toBeTruthy();
  });
});
