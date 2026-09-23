import { BrandMark } from "@/components/kit/brand";

/** A pulse line: activity over time. */
export function Logo({ wordmark = true, className }: { wordmark?: boolean; className?: string }) {
  return (
    <BrandMark name="DevPulse" wordmark={wordmark} className={className}>
      <path d="M3 12h4l2-5 4 10 2-5h6" />
    </BrandMark>
  );
}
