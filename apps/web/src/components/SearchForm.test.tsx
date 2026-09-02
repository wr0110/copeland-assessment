import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchForm } from './SearchForm';

describe('SearchForm', () => {
  it('submits a city search', async () => {
    const onSearch = vi.fn();
    render(<SearchForm onSearch={onSearch} busy={false} />);

    await userEvent.type(screen.getByLabelText('City name'), 'Kyiv');
    await userEvent.click(screen.getByRole('button', { name: 'Get weather' }));

    expect(onSearch).toHaveBeenCalledWith({ mode: 'city', city: 'Kyiv' });
  });

  it('submits a zip search with a country code', async () => {
    const onSearch = vi.fn();
    render(<SearchForm onSearch={onSearch} busy={false} />);

    await userEvent.click(screen.getByRole('button', { name: 'ZIP code' }));
    await userEvent.type(screen.getByLabelText('ZIP code'), '10001');

    const countryInput = screen.getByLabelText('Country code');
    await userEvent.clear(countryInput);
    await userEvent.type(countryInput, 'us');

    await userEvent.click(screen.getByRole('button', { name: 'Get weather' }));

    expect(onSearch).toHaveBeenCalledWith({
      mode: 'zip',
      zip: '10001',
      country: 'us',
    });
  });

  it('does not submit a city search when the field is empty', async () => {
    const onSearch = vi.fn();
    render(<SearchForm onSearch={onSearch} busy={false} />);

    await userEvent.click(screen.getByRole('button', { name: 'Get weather' }));

    expect(onSearch).not.toHaveBeenCalled();
  });
});
