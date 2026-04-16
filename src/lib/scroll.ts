export const PUBLIC_HEADER_OFFSET = 116;

export function scrollToHashTarget(
  hash: string,
  behavior: ScrollBehavior = "smooth"
) {
  if (typeof window === "undefined") {
    return false;
  }

  const normalized = hash.replace(/^#/, "");

  if (!normalized) {
    window.scrollTo({ top: 0, behavior });
    return true;
  }

  const element = document.getElementById(normalized);

  if (!element) {
    return false;
  }

  const top =
    element.getBoundingClientRect().top + window.scrollY - PUBLIC_HEADER_OFFSET;

  window.scrollTo({
    top: Math.max(top, 0),
    behavior,
  });

  return true;
}
