import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArchitectureDiagram } from './architecture-diagram';

const meta = {
  title: 'Blocks/ArchitectureDiagram',
  component: ArchitectureDiagram,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ArchitectureDiagram>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The request's path, drawn as one rail through three zones. The browser sits
 * in a dashed box because the sandbox is the boundary the whole picture exists
 * to explain; the helper and the engine share the solid box that is your
 * machine; the server sits alone on the internet.
 *
 * Two kinds of line, and the legend says which is which. The first two hops are
 * dashed and marching — those are orders, not bytes: the extension tells the
 * helper what to run, the helper starts the engine. Only the last hop is solid,
 * because only the last hop is the tunnel. A ringed marker sits wherever the
 * rail leaves one zone for the next, so both crossings are visible at a glance.
 *
 * The engine is the featured node: brighter ring, a soft glow, and two pulses
 * borrowed from `animate-pulse-ring` — the same keyframe `M3/ConnectionVisual`
 * uses, which is why the diagram no longer mounts that component itself.
 *
 * Every label comes from the dictionary. Only three strings survive
 * translation: the two protocol lists and `native messaging`, which are a
 * Chrome API and a set of proper nouns rather than words.
 */
export const Default: Story = {};

/**
 * A sequence is read in the reader's own direction, so in Arabic and Farsi the
 * whole path mirrors: the extension starts on the right and the tunnel runs
 * left. Nothing is pinned to `ltr`. The grid mirrors itself and the insets that
 * matter are logical, but a `transform` is not direction-aware — so each rail's
 * marching dashes and its comet are flipped by `rtl:-scale-x-100` on the line
 * alone, never on the label beside it. Letter-spacing is dropped too: it pulls
 * Arabic words apart at the joins.
 *
 * Switch the locale global to `ar` or `fa` to see it.
 */
export const Rtl: Story = {
  globals: { locale: 'ar' },
};

/**
 * `animated={false}` takes away the comets, the pulses and the marching, and
 * nothing else: the dashes stay dashed, so control-versus-traffic still reads.
 * This is also what `prefers-reduced-motion` produces, by a different route —
 * the CSS in `globals.css` stops the same three animations.
 */
export const Still: Story = {
  args: { animated: false },
};

/**
 * The diagram is a path, and a path folded into a column stops being one, so it
 * does not reflow. Below its natural width the wrapper scrolls, bleeding to the
 * screen edges so the scroll is discoverable rather than clipped. That scroller
 * is a focusable `region`: a box that scrolls and cannot take focus is
 * unreachable without a pointer.
 */
export const Narrow: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
