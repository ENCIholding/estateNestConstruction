# Post-Deploy Search Console Checklist (ENCI)

Run these steps in Google Search Console right after production deploy:

1. Select property: `https://www.estatenest.capital/`
2. Open **Sitemaps** and submit:
   - `https://www.estatenest.capital/sitemap.xml`
3. Use **URL Inspection** and request indexing for:
   - `https://www.estatenest.capital/`
   - `https://www.estatenest.capital/builder-profile`
   - `https://www.estatenest.capital/investor-relations`
   - `https://www.estatenest.capital/careers`
   - `https://www.estatenest.capital/accessibility`
   - `https://www.estatenest.capital/terms-and-conditions`
   - `https://www.estatenest.capital/privacy`
   - `https://www.estatenest.capital/cookies`
4. Open **Removals** and request refresh/removal for stale legacy snippets/URLs that still mention old brand content.
5. Re-check **Page indexing** and **Enhancements** after crawl completes (typically 24-72 hours).

Status tracker:
- [ ] Sitemap submitted
- [ ] URL inspections requested
- [ ] Legacy snippet removals requested
- [ ] Re-crawl verification completed
