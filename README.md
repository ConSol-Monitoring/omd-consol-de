# omd-consol-de
Website https://omd.consol.de

```
docker build -t consol/omd-consol-de .
docker run --rm -p 1313:1313 -v `pwd`:/src consol/omd-consol-de server
podman run --security-opt label=disable --rm -p 1313:1313 -v "$(pwd):/src" consol/omd-consol-de server --poll 700ms
```

## Blog archive

Blog posts published before `params.blog_archive_before` in `config.toml`
(currently `2018-01-01`) appear in `/blog/archive/`. Their files, article URLs,
and page resources stay in place. The cutoff uses the publication date, not
last modification time.

Override the date rule in an individual post's YAML front matter:

```yaml
archived: false # Keep an older, still-current article in the main news/search.
```

```yaml
archived: true # Archive a newer article that is no longer current.
```

Use actual YAML booleans, not quoted strings. The same archive rule controls
news listings, sidebar entries, feeds, article previous/next links, tag-page
groups, search indexes, and the blog content in the LLM exports. The open
archived article remains visible in its sidebar. Tag pages keep historical
articles in a collapsed group.

Normal search uses `offline-search-index.json`; the archive search uses
`archive-search-index.json`, fetched only when a query is entered in the
archive. `exclude_search: true` excludes a post from both indexes without
changing its archive status. Archived articles remain published in the sitemap
and accessible to external search engines.

The 2017 and 2019 workshop material lives under `content/en/blog/insights/`
and is published at `/blog/insights/monitoring-workshop-2017/` and
`/blog/insights/monitoring-workshop-2019/`. Hugo aliases redirect the former
`/wiki/workshop/.../` page addresses to their corresponding Insights pages.
`legacy_resource_path` republishes the bundled PDFs and images at their old
addresses so existing download links remain valid. Each workshop is a branch
bundle with an `_index.md` article marked `blog_post: true`; supporting pages
and assets live in the same folder. The supporting pages stay out of listings
and search through the bundle cascade. Both workshop articles follow the
archive cutoff. The former `/wiki/`
and `/wiki/workshop/` indexes redirect to Insights.
