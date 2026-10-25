import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LangProvider } from '../i18n';
import { CaseCard } from '../cases';
import { deskWork, webWork } from '../content-work';

const withClip = [...webWork, ...deskWork].find((p) => p.video);

describe('case clip', () => {
  it('starts held under reduced motion and can be played and paused', async () => {
    if (!withClip) throw new Error('no case with a clip in the content');
    render(
      <LangProvider>
        <CaseCard piece={withClip} />
      </LangProvider>,
    );
    const toggle = screen.getByRole('button', { name: /Play clip/ });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(toggle);
    expect(screen.getByRole('button', { name: /Pause clip/ })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: /Pause clip/ }));
    expect(screen.getByRole('button', { name: /Play clip/ })).toHaveAttribute('aria-pressed', 'false');
  });
});
