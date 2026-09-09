import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { BrowserMock } from '@/components/browser-mock';
import { PopupMock } from './popup-mock';

const meta = {
  title: 'Blocks/PopupMock',
  component: PopupMock,
  parameters: {
    // 560px tall at minimum, so the centered layout would clip it.
    layout: 'padded',
  },
} satisfies Meta<typeof PopupMock>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The landing page's hero mock, ticking. A new traffic sample scrolls in once a
 * second: the ↓/↑ readout and the ambient wave behind the status card read from
 * one rolling buffer, so they can never disagree.
 *
 * Three things here can be operated, and they are the three the real popup is
 * used for: the power button, the active server, and the routing mode. Every
 * other word on the surface is derived from those, so there is nowhere for a
 * second, disagreeing copy of the truth to live.
 */
export const Default: Story = {};

/**
 * `paused` drops the interval, which leaves the seeded mulberry32 opening frame
 * on screen. Same render every time — the state to reach for in a snapshot, a
 * store capture, or anywhere a moving number would be noise.
 */
export const Static: Story = {
  args: { paused: true },
};

/**
 * How the site actually ships it: `BrowserMock` anchors the popup under a
 * toolbar, arrow and all. Paused, because the frame is the point here rather
 * than the traffic.
 */
export const InBrowser: Story = {
  render: (args) => (
    <div style={{ width: 880 }}>
      <BrowserMock>
        <PopupMock {...args} />
      </BrowserMock>
    </div>
  ),
  args: { paused: true },
};

/**
 * The popup's own width is 380px, and `className` merges through `twMerge`, so
 * a caller's width wins over the default — which is how the landing page fits
 * it into a narrow column with `w-full max-w-[380px]`. At 320px the truncating
 * server rows, the three-segment routing switcher and the footer's button pair
 * are what give first.
 */
export const Narrow: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <PopupMock {...args} className="w-full max-w-[380px]" />
    </div>
  ),
  args: { paused: true },
};

/**
 * The tunnel taken down — `hero.title.ready` in the real popup, because a
 * chosen server with the engine stopped is ready rather than broken. The
 * heading, the subtitle, the button's colour and its label all follow one flag,
 * the speed meter goes rather than counting down to nothing, and the wave
 * behind it freezes on the last active minute the way the real one does.
 *
 * The chosen server keeps its tick and its leading bar: the choice survives the
 * tunnel, it just stops carrying anything, so it trades the running colour for
 * the secondary container.
 */
export const Disconnected: Story = {
  args: { paused: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Disconnect' }));
    await expect(canvas.getByRole('heading', { name: 'Ready to connect' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Connect' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  },
};

/**
 * A different server picked from the shortlist — the one-tap thing the popup
 * exists for. The hero's line and the exit address are that server's, the
 * monogram grows into its squircle on the row that is now live, and the flag
 * stays on the row rather than travelling into the hero's sentence.
 */
export const OtherServer: Story = {
  args: { paused: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /^Frankfurt/ }));
    await expect(canvas.getByText('198.51.100.12')).toBeInTheDocument();
  },
};

/**
 * Routing switched to Direct. The segment that is on is the one carrying
 * `aria-pressed`, so the group announces itself correctly however it is styled.
 */
export const DirectRouting: Story = {
  args: { paused: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const routing = within(canvas.getByRole('group', { name: 'Routing' }));
    await userEvent.click(routing.getByRole('button', { name: 'Direct' }));
    await expect(routing.getByRole('button', { name: 'Direct' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};
