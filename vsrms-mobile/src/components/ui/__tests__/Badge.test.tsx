import React from 'react';
import { render } from '@testing-library/react-native';
import { Badge } from '../Badge';

describe('Badge Component', () => {
  test('renders the label correctly', () => {
    const { getByText } = render(<Badge label="Pending" />);
    expect(getByText('Pending')).toBeTruthy();
  });

  test('renders with the primary variant by default', () => {
    const { getByText } = render(<Badge label="VSRMS" />);
    const text = getByText('VSRMS');
    
    // Check that style is an array and contains color property
    const styleObj = text.props.style.find((s: any) => s?.color);
    expect(styleObj?.color).toBe('#F56E0F');
  });

  test('renders different variants correctly', () => {
    const { getByText: getSuccess } = render(<Badge label="Success" variant="success" />);
    const successText = getSuccess('Success');
    const successStyle = successText.props.style.find((s: any) => s?.color);
    expect(successStyle?.color).toBe('#15803D');

    const { getByText: getError } = render(<Badge label="Error" variant="error" />);
    const errorText = getError('Error');
    const errorStyle = errorText.props.style.find((s: any) => s?.color);
    expect(errorStyle?.color).toBe('#DC2626');
  });
});
