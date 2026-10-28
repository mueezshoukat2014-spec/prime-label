"use client";
import NextLink from "next/link";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

type Props = ComponentPropsWithoutRef<typeof NextLink>;

/**
 * next/link with prefetch OFF by default. Pages are static and come from the
 * CDN in ~0.1–0.2 s on click anyway, while viewport prefetching fired 14–19
 * extra requests per page view (CDN requests + ISR reads + middleware on the
 * free plan) for links most visitors never tap. Pass prefetch to opt in.
 */
const AppLink = forwardRef<HTMLAnchorElement, Props>(function AppLink({ prefetch = false, ...props }, ref) {
  return <NextLink ref={ref} prefetch={prefetch} {...props} />;
});

export default AppLink;
