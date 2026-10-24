import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { createElement } from 'react';
import { refreshSoon, useIdleGSAP } from '../motion';

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
    document.querySelector('a')?.click();
    const section = document.createElement('section');
    section.id = 'later';
    document.body.append(section);
    refreshSoon();
    vi.advanceTimersByTime(200);
    expect(scrolled).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(2000);
    refreshSoon();
    vi.advanceTimersByTime(200);
    expect(scrolled).toHaveBeenCalledTimes(1);
  });

  it('stays owed while a section is still building, however long that takes', () => {
    function Building() {
      useIdleGSAP(() => undefined);
      return null;
    }
    document.querySelector('a')?.click();
    const section = document.createElement('section');
    section.id = 'later';
    document.body.append(section);
    refreshSoon();
    vi.advanceTimersByTime(200);
    expect(scrolled).toHaveBeenCalledTimes(1);
    // A lazy section mounts and builds late (a slow phone: its idle slot comes
    // 3 s later, after any settle clock would have run out): the debt is still
    // there when it does, and lands again on the refresh that follows.
    const idle = window.requestIdleCallback;
    const cancel = window.cancelIdleCallback;
    window.requestIdleCallback = (cb) => window.setTimeout(() => cb({} as IdleDeadline), 3000);
    window.cancelIdleCallback = (id) => window.clearTimeout(id);
    const { unmount } = render(createElement(Building));
    vi.advanceTimersByTime(2000);
    expect(scrolled).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(4000);
    expect(scrolled).toHaveBeenCalledTimes(2);
    unmount();
    window.requestIdleCallback = idle;
    window.cancelIdleCallback = cancel;
  });
});
