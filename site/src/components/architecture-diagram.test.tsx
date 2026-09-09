import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArchitectureDiagram } from './architecture-diagram';
import { setLocale } from '../i18n';
import en from '../i18n/en.json';
import ar from '../i18n/ar.json';

afterEach(() => setLocale('en'));

describe('ArchitectureDiagram', () => {
  it('names the four nodes and the three zones they sit in', () => {
    render(<ArchitectureDiagram />);
    for (const key of [
      'home.diagram.node.extension',
      'home.diagram.node.helper',
      'home.diagram.node.engine',
      'home.diagram.node.server',
      'home.diagram.zone.browser',
      'home.diagram.zone.machine',
      'home.diagram.zone.internet',
    ] as const) {
      expect(screen.getByText(en[key])).toBeInTheDocument();
    }
    expect(screen.getByText(en['home.diagram.node.extension.note'])).toBeInTheDocument();
    // The engine's binaries are a code identifier, not prose: mono, and pinned
    // LTR so they survive an RTL page.
    const engines = screen.getByText(en['home.diagram.node.engine.note']);
    expect(engines).toHaveClass('font-mono');
    expect(engines).toHaveAttribute('dir', 'ltr');
  });

  it('draws the browser as the only dashed zone', () => {
    const { container } = render(<ArchitectureDiagram />);
    const zones = container.querySelectorAll('.rounded-md.py-6');
    expect(zones).toHaveLength(3);
    expect(zones[0]).toHaveClass('border-dashed');
    expect(zones[1]).not.toHaveClass('border-dashed');
    expect(zones[2]).not.toHaveClass('border-dashed');
  });

  it('labels every hop and dashes all but the traffic one', () => {
    const { container } = render(<ArchitectureDiagram />);
    for (const key of [
      'home.diagram.link.native',
      'home.diagram.link.spawns',
      'home.diagram.link.protocols',
    ] as const) {
      expect(screen.getByText(en[key])).toBeInTheDocument();
    }
    // Three hops, two of them control: the last one carries the tunnel and is
    // the solid segment the legend calls traffic.
    expect(container.querySelectorAll('.rail-dash')).toHaveLength(2);
    expect(screen.getByText(en['home.diagram.legend.traffic'])).toBeInTheDocument();
    expect(screen.getByText(en['home.diagram.legend.control'])).toBeInTheDocument();
  });

  it('pulses the engine and both boundary crossings, and runs a comet per hop', () => {
    const { container } = render(<ArchitectureDiagram />);
    // Two rings on the featured engine, one on each of the two crossings.
    expect(container.querySelectorAll('.animate-pulse-ring')).toHaveLength(4);
    expect(container.querySelectorAll('.animate-rail-comet')).toHaveLength(3);
    expect(container.querySelectorAll('.animate-rail-march')).toHaveLength(2);
  });

  it('makes the scroller a focusable, named region and names both legend marks', () => {
    render(<ArchitectureDiagram />);
    // The diagram scrolls below its natural width, so the box that scrolls has
    // to be reachable without a pointer.
    const region = screen.getByRole('region', { name: en['home.diagram.aria'] });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region).toHaveClass('overflow-x-auto');
    // Without these the legend reads as the bare words "traffic" and "control".
    expect(screen.getByRole('img', { name: en['home.diagram.legend.solid'] })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: en['home.diagram.legend.dashed'] })).toBeInTheDocument();
  });

  it('translates every label and never pins a direction of its own', () => {
    setLocale('ar');
    const { container } = render(<ArchitectureDiagram />);
    // Nothing forces `ltr`, so an RTL page mirrors the whole path.
    expect(container.firstChild).not.toHaveAttribute('dir');
    expect(screen.getByText(ar['home.diagram.node.helper'])).toBeInTheDocument();
    expect(screen.getByText(ar['home.diagram.zone.machine.note'])).toBeInTheDocument();
    expect(screen.getByRole('region', { name: ar['home.diagram.aria'] })).toBeInTheDocument();
    // Protocol and API names stay Latin and stay LTR inside the RTL page.
    expect(screen.getByText(ar['home.diagram.link.protocols'])).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText(ar['home.diagram.link.native'])).toHaveAttribute('dir', 'ltr');
  });

  it('mirrors the rail by scale, since a transform is not direction-aware', () => {
    const { container } = render(<ArchitectureDiagram />);
    const lines = container.querySelectorAll('.rtl\\:-scale-x-100');
    expect(lines).toHaveLength(3);
    // The text beside the line must not be flipped with it.
    for (const line of lines) expect(line).not.toHaveTextContent(/\S/);
  });

  it('keeps the whole diagram when animation is off, minus everything that moves', () => {
    const { container } = render(<ArchitectureDiagram animated={false} />);
    expect(screen.getByText(en['home.diagram.node.engine'])).toBeInTheDocument();
    expect(container.querySelectorAll('.rail-dash')).toHaveLength(2);
    expect(container.querySelectorAll('.animate-pulse-ring')).toHaveLength(0);
    expect(container.querySelectorAll('.animate-rail-comet')).toHaveLength(0);
    expect(container.querySelectorAll('.animate-rail-march')).toHaveLength(0);
  });
});
