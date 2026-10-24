import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LangProvider } from '../i18n';
import { Gallery } from '../Gallery';
import { artworks } from '../content-work';

const first = artworks[0];

describe('Gallery viewer', () => {
  it('opens on a painting, puts focus on Close, and gives it back on Esc', async () => {
    render(
      <LangProvider>
        <Gallery />
      </LangProvider>,
    );
    const thumb = screen.getByRole('button', { name: new RegExp(first.title.en) });
    await userEvent.click(thumb);

    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveAttribute('open');
    expect(within(dialog).getByRole('heading', { name: first.title.en, hidden: true })).toBeInTheDocument();
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Close', hidden: true }));

    // The browser fires "cancel" on Esc for a modal dialog.
    act(() => {
      fireEvent(dialog, new Event('cancel', { cancelable: true }));
    });
    expect(dialog).not.toHaveAttribute('open');
    expect(document.activeElement).toBe(thumb);
  });

  it('closes from the Close button too', async () => {
    render(
      <LangProvider>
        <Gallery />
      </LangProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: new RegExp(first.title.en) }));
    const dialog = screen.getByRole('dialog', { hidden: true });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close', hidden: true }));
    expect(dialog).not.toHaveAttribute('open');
  });

  it('describes every painting for screen readers', () => {
    render(
      <LangProvider>
        <Gallery />
      </LangProvider>,
    );
    for (const art of artworks) {
      expect(screen.getByAltText(art.alt.en)).toBeInTheDocument();
    }
  });
});
