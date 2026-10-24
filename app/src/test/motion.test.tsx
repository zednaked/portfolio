import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { ScrollTrigger, gsap, useIdleGSAP } from '../motion';

function Section() {
  const root = useRef<HTMLDivElement>(null);
  useIdleGSAP(() => {
    ScrollTrigger.create({ trigger: root.current, start: 'top bottom' });
    gsap.to(root.current, { x: 10, scrollTrigger: { trigger: root.current, scrub: true } });
  }, root);
  return <div ref={root} />;
}

describe('deferred motion', () => {
  it('builds its triggers when idle and removes every one on unmount', async () => {
    const before = ScrollTrigger.getAll().length;
    const { unmount } = render(<Section />);
    await waitFor(() => expect(ScrollTrigger.getAll().length).toBe(before + 2));
    unmount();
    expect(ScrollTrigger.getAll().length).toBe(before);
  });

  it('never builds them if the section is gone before the idle slot', () => {
    const before = ScrollTrigger.getAll().length;
    const { unmount } = render(<Section />);
    unmount();
    expect(ScrollTrigger.getAll().length).toBe(before);
  });
});
