# spider-pig

Get a list of local URL links from a root URL. Works with JavaScript generated content.

```
<a href="test.html">Test</a><!-- match -->
<a href="test2.html">Test</a><!-- match -->
<a href="test2.html">Duplicate Test</a><!-- do not match -->
<a href="root.html">URL to self</a><!-- match -->
<a href="mailto:test@example.com">Email link</a><!-- do not match -->
<a href="http://www.google.com/">External</a><!-- do not match -->
```

Normalizes all of the matching URLs to be full absolute URLs (including host and protocol and path, etc).

## Installation

Available on [npm](https://www.npmjs.com/package/@zachleat/spider-pig).

```
npm install @zachleat/spider-pig
```

## Usage

```
$ spiderpig http://zachleat.localhost/web/
http://zachleat.localhost/web/
http://zachleat.localhost/web/about/
http://zachleat.localhost/web/best-of/
…
```

### Filter URLs

```
$ spiderpig http://zachleat.localhost/web/ --filter="/about/"
http://zachleat.localhost/web/about/
```

### Show URLs that contain a CSS Selector

Useful to see where CSS changes might regress on a project. This takes a bit of time. You can also mix in `--filter` here too.

```
$ spiderpig http://zachleat.localhost/web/ --selector=".header"
Found 180 urls.
Looking for urls with CSS selector ".header":
http://zachleat.localhost/web/ ✅  Yes
http://zachleat.localhost/web/about/ ✅  Yes
http://zachleat.localhost/web/best-of/ ✅  Yes
http://zachleat.localhost/web/projects/ ✅  Yes
```

#### Add a limit

Use `--selectorlimit` to set an upper bound on the number of URLs that get spidered.

```
$ spiderpig http://zachleat.localhost/web/ --selector=".header" --selectorlimit=3
Found 180 urls
Looking for urls with CSS selector ".header" (limit 3):
http://zachleat.localhost/web/ ✅  Yes
http://zachleat.localhost/web/about/ ✅  Yes
http://zachleat.localhost/web/best-of/ ✅  Yes
…
```

### Debug mode

```
$ DEBUG=SpiderPig spiderpig http://zachleat.localhost/web/
```

### API

```
const SpiderPig = require("@zachleat/spider-pig");

(async function() {
	let sp = new SpiderPig();
	await sp.start();

	let urls = await sp.fetchLocalUrls("http://localhost/myproject/");

	// Optional, filter (case sensitive)
	urls = sp.filterUrls(urls, "views");

	// Optional
	for(let url of urls) {
		if( await sp.hasSelector(url, ".test-css-selector:nth-child(2)") ) {
			// has it
		} else {
			// doesn’t have it
		}
	}
})();
```