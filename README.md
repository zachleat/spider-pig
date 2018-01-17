# spider-pig

Get a list of local URL links from a root URL.

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
… etc.
```

### Debug mode

```
$ DEBUG=SpiderPig spiderpig http://zachleat.localhost/web/
```
