import type { Meta, StoryObj } from '@storybook/react-vite';
import { t } from './i18n';
import { Layout } from './layout';

const meta = {
  title: 'Blocks/Layout',
  component: Layout,
  parameters: {
    // The shell is `min-h-screen` with a sticky header; padding around it would
    // only misrepresent it.
    layout: 'fullscreen',
    // And on the autodocs page it gets its own iframe, so the sticky header
    // sticks to the story's viewport rather than to the docs page's.
    docs: { story: { inline: false, iframeHeight: 720 } },
  },
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

// A component rather than inline JSX in `args`: args are built once when this
// module loads, so a `t()` call written there would freeze the English strings
// while the toolbar switched the shell around them. Inside a component, `t()`
// runs on every render — and the locale decorator remounts the story.
function InstallLede() {
  return (
    <div className="space-y-4">
      <h1 className="text-display-small font-medium tracking-tight">{t('install.h1')}</h1>
      <p className="text-body-large text-on-surface-variant">{t('install.lede')}</p>
    </div>
  );
}

/**
 * Every page on the site is this shell with a `<main>` filled in: a skip link
 * that only shows on focus, a sticky header carrying the `Noctis × c0nn3ct.info`
 * lockup, the three page links, the repository link and the language switcher,
 * and a footer of four blocks — the lockup again with the product's own
 * description, Product, Resources, Contacts — over the six locales as plain
 * crawlable links.
 *
 * `current` drives `aria-current="page"` in both the header nav and the footer,
 * and it also picks which path the footer's language links pair with — so the
 * six locale links here point at this page's translations, not at six home
 * pages.
 *
 * Below `sm` the header drops its three links: the footer already carries them,
 * and crowding the 64px bar was the alternative. Switch the locale in the
 * toolbar to see the whole shell, text direction included, follow.
 */
export const Shell: Story = {
  args: {
    current: 'install',
    children: <InstallLede />,
  },
};

/**
 * `bleed` hands the page its own width: `<main>` loses the reading column so a
 * page can lay its sections out edge to edge, and the footer widens to the band
 * width so its rule still closes the content above it rather than stopping
 * short of it.
 */
export const Bleed: Story = {
  args: {
    current: 'home',
    bleed: true,
    children: (
      <div className="bg-surface-container-low px-5 py-16 text-center text-body-large sm:px-8 lg:px-10">
        A band, edge to edge
      </div>
    ),
  },
};
