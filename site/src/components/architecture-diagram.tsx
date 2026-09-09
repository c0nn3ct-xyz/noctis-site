import type { ComponentType, ReactNode, SVGProps } from 'react';
import { Cpu, Network, Puzzle, Server } from 'lucide-react';
import { t } from '@/i18n';
import { cn } from '@/lib/utils';

/* Geometry. Every grid here is four equal tracks separated by `gap-x-5` (20px).
 * The zone row spans them 1/2/1, and "Your machine" splits its two-track span
 * back into those same two tracks — so all four node columns are one track
 * wide, and one node's centre is exactly a track plus a gap from the next.
 * That is what lets a rail segment be written once, in `Rail`, as
 * `start: 50% + 32px` (the circle's radius) with `width: 100% - 44px`
 * (a track plus a gap, less the two radii it must not cross).
 *
 * The composition is horizontal at every width: the diagram is a path, and a
 * path folded into a column stops being one. Below its natural width the
 * wrapper scrolls instead of reflowing.
 *
 * Direction. The chain is a sequence, and a sequence is read in the reader's
 * own direction, so in Arabic and Farsi the whole path mirrors: the extension
 * starts on the right and the tunnel runs left. Nothing is pinned to `ltr`. The
 * grid mirrors itself, the insets that matter are logical (`start`, `ps`), and
 * the one thing a logical property cannot flip — a rail's marching dashes and
 * the comet travelling along it, both driven by `transform` — is flipped by
 * `rtl:-scale-x-100` on the line alone, never on the text beside it. */

interface Props {
  /** Travelling comets and marching dashes. Off leaves the same diagram, still. */
  animated?: boolean;
}

export function ArchitectureDiagram({ animated = true }: Props) {
  return (
    <div className="pt-4">
      {/* The legend sits outside the scroller: it is the key to the two kinds
        * of line, so it must not be the first thing that scrolls away. */}
      <Legend />
      {/* A scrollable box is only reachable with a keyboard if it can take
        * focus, so the scroller is a named, focusable region (WCAG 2.1.1). The
        * natural width stays in `px`, matching this site's px type scale: in
        * `rem` the box would widen with the reader's default font size while
        * the labels inside it stayed put, and start scrolling for no reason. */}
      <div
        role="region"
        aria-label={t('home.diagram.aria')}
        tabIndex={0}
        className="-mx-4 mt-4 overflow-x-auto rounded-md px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="grid min-w-[920px] grid-cols-4 gap-x-5">
          <Zone
            name={t('home.diagram.zone.browser')}
            note={t('home.diagram.zone.browser.note')}
            sandbox
          >
            <Node
              icon={Puzzle}
              title={t('home.diagram.node.extension')}
              subtitle={t('home.diagram.node.extension.note')}
              link={{
                label: t('home.diagram.link.native'),
                latin: true,
                crossing: true,
                delay: 0,
              }}
              animated={animated}
            />
          </Zone>

          <Zone
            className="col-span-2"
            name={t('home.diagram.zone.machine')}
            note={t('home.diagram.zone.machine.note')}
          >
            <div className="grid grid-cols-2 gap-x-5">
              <Node
                icon={Network}
                title={t('home.diagram.node.helper')}
                subtitle={t('home.diagram.node.helper.note')}
                link={{ label: t('home.diagram.link.spawns'), delay: 1.4 }}
                animated={animated}
              />
              <Node
                icon={Cpu}
                title={t('home.diagram.node.engine')}
                subtitle={t('home.diagram.node.engine.note')}
                code
                featured
                link={{
                  label: t('home.diagram.link.protocols'),
                  latin: true,
                  traffic: true,
                  crossing: true,
                  delay: 2.8,
                }}
                animated={animated}
              />
            </div>
          </Zone>

          <Zone
            name={t('home.diagram.zone.internet')}
            note={t('home.diagram.zone.internet.note')}
          >
            <Node
              icon={Server}
              title={t('home.diagram.node.server')}
              subtitle={t('home.diagram.node.server.note')}
            />
          </Zone>
        </div>
      </div>
    </div>
  );
}

/* Solid carries bytes, dashed carries orders. Without this the two kinds of
 * line are just two kinds of decoration. Each swatch carries its own name, or a
 * screen reader would announce the bare words "traffic" and "control". */
function Legend() {
  return (
    <div className="flex items-center justify-end gap-6 text-label-small text-on-surface-variant">
      <span className="flex items-center gap-2">
        <span
          role="img"
          aria-label={t('home.diagram.legend.solid')}
          className="h-[3px] w-9 rounded-pill bg-on-surface"
        />
        {t('home.diagram.legend.traffic')}
      </span>
      <span className="flex items-center gap-2">
        <span
          role="img"
          aria-label={t('home.diagram.legend.dashed')}
          className="w-9 border-t-2 border-dashed border-outline"
        />
        {t('home.diagram.legend.control')}
      </span>
    </div>
  );
}

interface ZoneProps {
  name: string;
  note: string;
  sandbox?: boolean;
  className?: string;
  children: ReactNode;
}

/* The browser's box is the dashed one: it is the boundary the whole design
 * exists to explain, so it is drawn the way a boundary is drawn. Both kinds of
 * border use `outline` rather than `outline-variant`, which misses the 3:1 a
 * meaningful graphic owes under WCAG 1.4.11 in both themes. */
function Zone({ name, note, sandbox, className, children }: ZoneProps) {
  return (
    <div
      className={cn(
        'relative rounded-md py-6',
        sandbox ? 'border-2 border-dashed border-outline' : 'border border-outline',
        className,
      )}
    >
      <div className="ps-7">
        {/* Tracking is dropped in RTL: letter-spacing pulls Arabic and Farsi
          * words apart at the joins and breaks the cursive. */}
        <div className="text-label-small uppercase tracking-[0.18em] text-on-surface rtl:tracking-normal">
          {name}
        </div>
        <div className="mt-1 text-label-small text-on-surface-variant">{note}</div>
      </div>
      <div className="mt-9">{children}</div>
    </div>
  );
}

interface LinkSpec {
  label: string;
  /** Solid and bright: the tunnel itself, not the messages that set it up. */
  traffic?: boolean;
  /** Marks the hop where the rail leaves one zone for the next. */
  crossing?: boolean;
  /** An API or protocol name that stays Latin in every locale. */
  latin?: boolean;
  delay: number;
}

interface NodeProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  subtitle: string;
  /** The subtitle is a list of binaries, so it is set in mono and stays Latin. */
  code?: boolean;
  featured?: boolean;
  link?: LinkSpec;
  animated?: boolean;
}

function Node({
  icon: Icon,
  title,
  subtitle,
  code,
  featured,
  link,
  animated,
}: NodeProps) {
  return (
    <div className="relative">
      <div className="relative mx-auto grid h-16 w-16 place-items-center">
        {featured && animated && (
          <>
            <PulseRing size={88} delay={0} />
            <PulseRing size={88} delay={1.3} />
          </>
        )}
        <span
          aria-hidden
          className={cn(
            'relative grid h-16 w-16 place-items-center rounded-full border bg-background text-on-surface',
            featured
              ? 'border-on-surface shadow-[0_0_24px_-4px_hsl(var(--on-surface)/0.35)]'
              : 'border-outline',
          )}
        >
          <Icon className="h-6 w-6" />
        </span>
      </div>

      <div className="mt-4 text-center">
        <div className="text-title-medium text-on-surface">{title}</div>
        <div
          dir={code ? 'ltr' : undefined}
          className={cn(
            'mt-1 text-label-small text-on-surface-variant',
            code && 'font-mono',
          )}
        >
          {subtitle}
        </div>
      </div>

      {link && <Rail {...link} animated={animated} />}
    </div>
  );
}

/* Centred the way `M3/ConnectionVisual` centres its rings: by `place-items` on
 * the parent, never by a translate. `animate-pulse-ring` animates `transform`,
 * so any translate here would be thrown away for the whole of the animation. */
function PulseRing({ size, delay }: { size: number; delay: number }) {
  return (
    <span
      aria-hidden
      className="animate-pulse-ring absolute rounded-full border border-outline"
      style={{
        width: size,
        height: size,
        animationDelay: `${delay}s`,
        ['--pulse-dur' as never]: '2.6s',
      }}
    />
  );
}

/* One hop: the line, whatever travels along it, the marker where it leaves a
 * zone, and the label. Only the label is read aloud — the rest is the drawing. */
function Rail({
  label,
  traffic,
  crossing,
  latin,
  delay,
  animated,
}: LinkSpec & { animated?: boolean }) {
  return (
    <div className="absolute start-[calc(50%+32px)] top-8 z-10 h-0 w-[calc(100%-44px)]">
      {/* The line is the only part that mirrors by scale. Its dashes and its
        * comet both travel on `transform`, which no logical property flips. */}
      <div
        aria-hidden
        className="absolute inset-x-0 -top-px h-0.5 overflow-hidden rtl:-scale-x-100"
      >
        {traffic ? (
          <div className="absolute inset-0 bg-on-surface" />
        ) : (
          /* The strip is one dash period wider than the segment and marches by
           * translating exactly that period, so the loop is seamless and costs
           * no repaint. Animating `background-position` would repaint each
           * frame instead. */
          <div
            className={cn(
              'rail-dash absolute inset-y-0 -left-[14px] right-0 text-outline',
              animated && 'animate-rail-march',
            )}
          />
        )}
        {animated && (
          /* Travel is a transform on a full-width carrier, never `left`:
           * animating a layout property would run layout on every frame of
           * every hop. The carrier ends flush, so the comet lands on the next
           * node's edge. */
          <div
            className="animate-rail-comet absolute inset-0"
            style={{ animationDelay: `${delay}s` }}
          >
            <div className="absolute inset-y-0 right-0 w-[70px] rounded-pill bg-gradient-to-r from-transparent to-on-surface" />
          </div>
        )}
      </div>

      {crossing && (
        <span
          aria-hidden
          className="absolute left-1/2 top-0 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-on-surface bg-background"
        >
          {animated && <PulseRing size={40} delay={delay + 0.8} />}
          <span className="relative h-2.5 w-2.5 rounded-full bg-on-surface" />
        </span>
      )}

      <span
        dir={latin ? 'ltr' : undefined}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill bg-background px-2 text-label-unit uppercase tracking-[0.14em] text-on-surface-variant rtl:tracking-normal"
      >
        {label}
      </span>
    </div>
  );
}
