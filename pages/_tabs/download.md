---
# the default layout is 'page'
icon: fas fa-download
order: 2
---

## Trucaption {{ site.github.latest_release.name }}

### Changes in this release:
{{ site.github.latest_release.body }}

### Download links:
{% for asset in site.github.latest_release.assets %}
  * [{{ asset.name}}]({{ asset.browser_download_url }})
{% endfor %}

For older releases, visit [Releases](https://github.com/dkaser/trucaption/releases).
