'use client'
import React, { Fragment, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

/**
 * VengeanceUI "staggered grid", integrated into the portfolio Skills section.
 *
 * The animation below is the registry component's own implementation: a
 * scrubbed ScrollTrigger per grid column (items rise with `yPercent: 450` and
 * fade with `autoAlpha: 0`, delayed by `|column - middleColumn| * 0.2`), a
 * per-character reveal for the centre label, and a depth push on the expanding
 * bento band. Only the parts that cannot survive a document-flow, multi
 * breakpoint layout were adapted, each marked with a comment.
 */
export interface StaggeredGridItem {
    /** Stable key. Must be unique across `items`. */
    id: string
    label: string
    icon?: React.ReactNode
    /**
     * Set on the FIRST item of a category. The grid renders it as a
     * full-width header row above that item, so the categories are visible
     * without hovering rather than only discoverable per tile.
     */
    groupLabel?: string
}

export interface BentoItem {
    id: number | string
    title: string
    subtitle: string
    description: string
    icon: React.ReactNode
    content?: React.ReactNode
    image?: string
}

export interface StaggeredGridProps {
    items: readonly StaggeredGridItem[]
    /** Rendered as the expanding band inside the grid. Omit to render tiles alone. */
    bentoItems?: readonly BentoItem[]
    /** Header row rendered above the band, matching the category headers. */
    bentoLabel?: string
    /**
     * Id of the tile the band should follow. Without it the band falls to the
     * end of the grid, which stranded the AI highlights under the last category.
     */
    bentoAfterId?: string
    /** Large scrubbed display word. The site does not pass this; it is demo furniture. */
    centerText?: string
    credit?: { text: string; href: string }
    className?: string
    scroller?: string | Element | Window | null
}

/**
 * When motion is not welcome the reveal is skipped entirely and the grid is the
 * static end state, so this is a hard skip rather than a shortened tween.
 */
const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * A category header, drawn as a full-width row inside the grid. It carries no
 * `grid__item` class on purpose: the reveal assigns columns by reading the left
 * edges of `.grid__item`, so a header must not be counted as a tile or it would
 * be swept into a column and animated as one.
 *
 * `role="presentation"` keeps it out of the accessibility tree, so the
 * surrounding `role="list"` still exposes only the technologies.
 */
function CategoryHeader({ label }: { label: string }) {
    return (
        <div
            role="presentation"
            className="col-span-full flex items-baseline gap-3 pt-8 first:pt-0"
        >
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
                {label}
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>
    )
}

export function StaggeredGrid({
    items,
    bentoItems,
    bentoLabel,
    bentoAfterId,
    centerText,
    credit,
    className,
    scroller
}: StaggeredGridProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)

    // Bento Grid State
    const [activeBento, setActiveBento] = useState<number>(0);

    /**
     * Where the band belongs in the tile sequence. -1 means "no anchor matched",
     * which is the fallback that renders it last.
     */
    const bentoAnchorIndex = bentoAfterId != null
        ? items.findIndex((item) => item.id === bentoAfterId)
        : -1;

    const hasBento = Boolean(bentoItems && bentoItems.length > 0);

    const splitText = (text: string) => {
        return text.split('').map((char, i) => (
            <span key={i} className="char inline-block" style={{ willChange: 'transform' }}>{char === ' ' ? '\u00A0' : char}</span>
        ))
    }

    /**
     * The expanding band. Not a component: it is called directly during render so
     * it can be placed either after its anchor tile or at the end of the grid
     * without being mounted twice.
     */
    const renderBento = () => {
        if (!bentoItems || bentoItems.length === 0) return null;
        return (
            <Fragment key="bento">
                {bentoLabel ? <CategoryHeader label={bentoLabel} /> : null}
                <div role="listitem" className="grid__item bento-container col-span-full relative z-20 will-change-transform" data-col="0">
                    <div className="flex flex-col gap-2 sm:h-40 sm:flex-row sm:gap-3">
                        {bentoItems.map((bentoItem, index) => {
                            const isActive = activeBento === index;
                            return (
                                /**
                                 * A real button, not a `div` with a click handler.
                                 * The band is the most prominent thing in the section
                                 * and was previously reachable by mouse only. Focus
                                 * activates it too, and `aria-label` overrides the
                                 * duplicated title markup so the accessible name is
                                 * the technology once rather than twice.
                                 */
                                <button
                                    type="button"
                                    key={bentoItem.id}
                                    aria-label={bentoItem.title}
                                    onMouseEnter={() => setActiveBento(index)}
                                    onFocus={() => setActiveBento(index)}
                                    onClick={() => setActiveBento(index)}
                                    className={cn(
                                        'relative h-20 cursor-pointer overflow-hidden rounded-lg transition-[width,background-color] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] sm:h-full sm:w-[20%]',
                                        isActive && 'sm:w-[60%]',
                                        isActive ? 'bg-muted' : 'bg-card',
                                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'
                                    )}
                                >
                                    {/* Border Overlay - Fixes edge artifacts by sitting on top */}
                                    <div className={cn(
                                        "absolute inset-0 rounded-lg border pointer-events-none transition-colors duration-700",
                                        isActive ? "border-foreground/20" : "border-border"
                                    )} />

                                    {/* Content Container */}
                                    <div className="relative z-10 w-full h-full flex flex-col p-0">
                                        {/* Active State Content */}
                                        <div className={cn(
                                            "absolute inset-0 flex flex-col transition-[transform,opacity] duration-500 ease-in-out",
                                            isActive ? "translate-y-0 sm:opacity-100 sm:pointer-events-auto" : "translate-y-4 opacity-0 pointer-events-none"
                                        )}>
                                            {/* Footer Row - Full Width */}
                                            <div className="absolute bottom-0 left-0 hidden w-full h-16 items-center justify-between px-4 z-20 sm:flex">

                                                <div className="flex flex-col relative z-10">
                                                    <h3 className="text-xs font-semibold text-foreground leading-none tracking-tight">{bentoItem.title}</h3>
                                                </div>
                                                <div className="text-foreground transition-colors [&>svg]:h-4 [&>svg]:w-4 relative z-10">
                                                    {bentoItem.icon}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inactive State - Icon + Title - Centered */}
                                    <div className={cn(
                                        "absolute inset-0 flex flex-col items-center justify-center gap-1.5 transition-[transform,opacity] duration-500",
                                        isActive ? "scale-90 sm:opacity-0 sm:pointer-events-none" : "opacity-100 scale-100"
                                    )}>
                                        <div className="text-foreground/60 transition-colors [&>svg]:h-5 [&>svg]:w-5">
                                            {bentoItem.icon}
                                        </div>
                                        <span className="px-2 text-[10px] font-medium text-foreground/70 uppercase tracking-wider text-center leading-tight">{bentoItem.title}</span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </Fragment>
        )
    }

    useEffect(() => {
        const root = rootRef.current
        const grid = gridRef.current
        if (!root || !grid) return
        // The grid is the fallback presentation when motion is not welcome, so
        // the reveal is simply skipped and every item stays in its end state.
        if (prefersReducedMotion()) return

        /**
         * Group the items into real grid columns from their rendered left
         * edges. The registry hardcoded `data-col={i % 7}`, which only lined up
         * with the seven column layout it shipped with; reading the geometry
         * keeps the per column delay correct from two to seven columns.
         */
        const assignColumns = () => {
            const tiles = gsap.utils.toArray<HTMLElement>('.grid__item', grid)
            const lefts: number[] = []
            const columns: HTMLElement[][] = []
            tiles.forEach((item) => {
                const left = Math.round(item.getBoundingClientRect().left)
                let index = lefts.indexOf(left)
                if (index === -1) {
                    lefts.push(left)
                    columns.push([])
                    index = lefts.length - 1
                }
                columns[index].push(item)
                item.dataset.col = String(index)
            })
            return columns
        }

        const ctx = gsap.context(() => {
            // Animate Text Element
            if (textRef.current) {
                const chars = textRef.current.querySelectorAll('.char')
                gsap.timeline({
                    scrollTrigger: {
                        trigger: textRef.current,
                        scroller: scroller || undefined,
                        start: 'top bottom',
                        end: 'center center-=25%',
                        scrub: 1,
                    }
                })
                    .from(chars, {
                        ease: 'sine.out',
                        yPercent: 300,
                        autoAlpha: 0,
                        stagger: {
                            each: 0.05,
                            from: 'center'
                        }
                    })
            }

            const columns = assignColumns()
            const middleColumnIndex = Math.floor(columns.length / 2)

            columns.forEach((columnItems, columnIndex) => {
                const delayFactor = Math.abs(columnIndex - middleColumnIndex) * 0.2

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: grid,
                        scroller: scroller || undefined,
                        start: 'top bottom',
                        end: 'center center',
                        scrub: 1.5,
                        invalidateOnRefresh: true,
                    }
                })
                tl.from(columnItems, {
                    yPercent: 450,
                    autoAlpha: 0,
                    delay: delayFactor,
                    ease: 'sine.out',
                })
                    .from(columnItems.map(item => item.querySelector('.grid__item-img')), {
                        transformOrigin: '50% 0%',
                        ease: 'sine.out',
                    }, 0)

                /**
                 * `will-change` is a promise to the compositor, and every tile
                 * held one for the life of the page: 37 promoted layers for a
                 * reveal that runs once. Dropped when the reveal finishes, and
                 * restored if the reader scrolls back above the start so a second
                 * pass is still smooth. Attached through the trigger instance
                 * rather than the config object, which is where these callbacks
                 * are actually documented.
                 */
                tl.eventCallback('onComplete', () => {
                    gsap.set(columnItems, { willChange: 'auto' })
                })
            })

            // Specific animation for Bento Container
            const bentoContainer = grid.querySelector('.bento-container')

            if (bentoContainer) {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: grid,
                        scroller: scroller || undefined,
                        start: 'top top+=15%',
                        end: 'bottom center',
                        scrub: 1,
                        invalidateOnRefresh: true,
                    }
                })

                // The registry moves the band down 10vh and scales it to 1.5 for
                // a full-blend demo finale. Inside a document flow that would
                // spill over the next section, so the same tween, easing and
                // timing drive a contained depth push instead.
                tl.to(bentoContainer, {
                    y: 12,
                    scale: 1.08,
                    zIndex: 10,
                    ease: 'power2.out',
                    duration: 1,
                    force3D: true
                }, 0)

                // Same reasoning as the tiles: the band holds a composited layer too.
                tl.eventCallback('onComplete', () => {
                    gsap.set(bentoContainer, { willChange: 'auto' })
                })
            }
        }, root)

        return () => ctx.revert()
    }, [scroller])

    return (
        <div
            ref={rootRef}
            className={cn("staggered-grid relative w-full", className)}
        >
            {centerText ? (
                <div className="relative mb-12 grid w-full place-items-center overflow-hidden sm:mb-16">
                    <div ref={textRef} className="text-center font-semibold uppercase leading-[1] tracking-[0.06em] text-foreground text-[clamp(1.375rem,6vw,2.75rem)]">
                        {splitText(centerText)}
                    </div>
                </div>
            ) : null}

            <div
                ref={gridRef}
                role="list"
                aria-label="Technologies"
                className="grid--full relative grid w-full grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-7"
            >
                {items.map((item, index) => (
                    <Fragment key={item.id}>
                        {item.groupLabel ? <CategoryHeader label={item.groupLabel} /> : null}
                        <div
                            role="listitem"
                            data-col="0"
                            className="grid__item m-0 relative h-24 [perspective:800px] will-change-[transform,opacity] group sm:h-28 lg:h-32"
                        >
                            {/*
                                Hover is a border and colour lift, not the registry's
                                black overlay. That overlay dimmed the tile to
                                near-black and printed the word "group" over it, which
                                read as a tooltip, obscured the icon underneath, and
                                repeated what the category header row already says.
                                `transition-all` is gone for the same reason it was
                                wrong here: it animates properties that do not change.
                            */}
                            <div className="grid__item-img w-full h-full [backface-visibility:hidden] will-change-transform rounded-lg border border-border bg-card flex items-center justify-center overflow-hidden transition-[transform,border-color] duration-500 ease-out group-hover:scale-[1.03] group-hover:border-foreground/25">
                                <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-2 px-2 text-center">
                                    {item.icon ? (
                                        <span className="flex text-foreground/70 transition-colors duration-300 group-hover:text-foreground [&>svg]:h-6 [&>svg]:w-6">
                                            {item.icon}
                                        </span>
                                    ) : null}
                                    <span className="text-[11px] font-medium leading-tight text-foreground/85 transition-colors duration-300 group-hover:text-foreground">
                                        {item.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {index === bentoAnchorIndex ? renderBento() : null}
                    </Fragment>
                ))}

                {/* Fallback placement, used only when no anchor matched. */}
                {bentoAnchorIndex === -1 && hasBento ? renderBento() : null}
            </div>

            {credit ? (
                <p className="mt-8 font-mono text-[11px] text-muted-foreground">
                    <a href={credit.href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                        {credit.text}
                    </a>
                </p>
            ) : null}
        </div>
    )
}

export default StaggeredGrid