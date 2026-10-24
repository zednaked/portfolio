import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { refreshSoon } from '../motion';

// The page owes the reader a place (a #link clicked before its section was
// built) and pays it on the refresh after the section appears; the reader's
// own scroll cancels it.
describe('the owed place', () => {
  const scrolled = vi.fn();
  beforeEach(() => {
    vi.useFakeTimers();
    scrolled.mockClear();
    Element.prototype.scrollIntoView = scrolled;
    document.body.innerHTML = '<a href="#later">later</a>';
  });
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('lands a link clicked before its section exists, once it does', () => {
    document.querySelector('a')?.click();
    refreshSoon();
    vi.advanceTimersByTime(200);
    expect(scrolled).not.toHaveBeenCalled();

    const section = document.createElement('section');
    section.id = 'later';
    document.body.append(section);
    refreshSoon();
    vi.advanceTimersByTime(200);
    expect(scrolled).toHaveBeenCalledTimes(1);
  });

  it('lets the reader’s own scroll cancel it', () => {
    document.querySelector('a')?.click();
    window.dispatchEvent(new Event('wheel'));
    const section = document.createElement('section');
    section.id = 'later';
    document.body.append(section);
    refreshSoon();
    vi.advanceTimersByTime(200);
    expect(scrolled).not.toHaveBeenCalled();
  });

  it('is settled once paid: later refreshes leave the reader alone', () => {
    const section = document.createElement('section');
    section.id = 'later';
    document.body.append(section);
    section.remove();
    document.querySelector('a')?.click();
    document.body.append(section);
    refreshSoon();
    vi.advanceTimersByTime(200);
    expect(scrolled).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(2000);
    refreshSoon();
    vi.advanceTimersByTime(200);
    expect(scrolled).toHaveBeenCalledTimes(1);
  });
});
