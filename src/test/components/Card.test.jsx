import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from '../../components/Card/Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(<Card>Body Content</Card>);
    expect(screen.getByText('Body Content')).toBeInTheDocument();
  });

  it('renders title and subtitle', () => {
    render(<Card title="Test Title" subtitle="Test Subtitle" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(<Card footer="Footer Text" />);
    expect(screen.getByText('Footer Text')).toBeInTheDocument();
  });

  it('applies custom class names', () => {
    const { container } = render(
      <Card
        title="Title"
        footer="Footer"
        className="custom-card"
        headerClassName="custom-header"
        bodyClassName="custom-body"
        footerClassName="custom-footer"
      >
        Content
      </Card>
    );

    expect(container.querySelector('.custom-card')).toBeInTheDocument();
    expect(container.querySelector('.custom-header')).toBeInTheDocument();
    expect(container.querySelector('.custom-body')).toBeInTheDocument();
    expect(container.querySelector('.custom-footer')).toBeInTheDocument();
  });
});
