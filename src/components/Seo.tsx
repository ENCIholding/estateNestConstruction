import { useEffect } from "react";

type SeoProps = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

const SITE_URL = "https://www.estatenest.capital";
const DEFAULT_IMAGE = `${SITE_URL}/brand/enci-buildos-logo.jpeg`;

function upsertMeta(
  selector: string,
  attribute: "name" | "property",
  value: string,
  content: string
) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

export default function Seo({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
}: SeoProps) {
  useEffect(() => {
    const previousTitle = document.title;
    const canonicalHref = `${SITE_URL}${path}`;
    let canonical = document.head.querySelector<HTMLLinkElement>(
      "link[rel='canonical']"
    );

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    document.title = title;
    canonical.setAttribute("href", canonicalHref);

    upsertMeta("meta[name='description']", "name", "description", description);
    upsertMeta("meta[property='og:title']", "property", "og:title", title);
    upsertMeta(
      "meta[property='og:description']",
      "property",
      "og:description",
      description
    );
    upsertMeta("meta[property='og:url']", "property", "og:url", canonicalHref);
    upsertMeta("meta[property='og:image']", "property", "og:image", image);
    upsertMeta("meta[name='twitter:title']", "name", "twitter:title", title);
    upsertMeta(
      "meta[name='twitter:description']",
      "name",
      "twitter:description",
      description
    );
    upsertMeta("meta[name='twitter:image']", "name", "twitter:image", image);

    return () => {
      document.title = previousTitle;
    };
  }, [description, image, path, title]);

  return null;
}
