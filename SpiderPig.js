const puppeteer = require("puppeteer");
// const urlRegex = require("url-regex");
const normalizeUrl = require("normalize-url");
const { URL } = require("url");
const debug = require("debug")("SpiderPig");

class SpiderPig {
	constructor() {
		this.urls = [];
		this.duplicates = {};
	}

	async getOrigin(page) {
		return await page.evaluate('document.location.origin');
	}

	cleanupHref(href, origin) {
		let url = new URL(href, origin);
		return normalizeUrl(url.toString(), {
			stripWWW: false,
			stripFragment: true,
			normalizeHttps: false,
			normalizeProtocol: true,
			removeTrailingSlash: false
		});
	}

	isLocalHref(href, origin) {
		href = this.cleanupHref(href, origin);

		// does the href contain the local origin?
		return href.indexOf(origin) === 0;
	}

	isValidToAdd(url, origin) {
		url = this.cleanupHref(url, origin);

		if( !url ||
			this.duplicates[ url ] ||
			url.indexOf( "mailto:" ) === 0 || // is email link
			!this.isLocalHref(url, origin) ) {

			return false;
		}

		return !!url.length;
	}

	addCleanedUrl(url, origin) {
		this.duplicates[ url ] = true;
		this.urls.push( url );
	}

	async start() {
		this.browser = await puppeteer.launch();
	}

	async getPage(url) {
		let page = await this.browser.newPage();

		await page.goto(url, {
			waitUntil: ["load", "networkidle0"]
		});

		return page;
	}

	async hasSelector(localUrl, sel) {
		let browser = await puppeteer.launch();
		let page = await browser.newPage();
		await page.goto(localUrl, {
			waitUntil: ["load", "networkidle0"]
		});
		let ret = await page.$$(sel);
		browser.close();

		return ret.length > 0;
	}

	filterUrls(hrefs, filter) {
		return hrefs.filter(function(href) {
			if( filter && href.indexOf(filter) === -1) {
				debug(`Ignored ${href}, does not meet filter \`${filter}\``);
				return false;
			}
			return true;
		});
	}

	async fetchLocalUrls(url) {
		let urls = [];
		let page = await this.getPage(url);

		const origin = await this.getOrigin(page);
		debug( "Found origin: %o", origin );
		const hrefs = await page.$$eval("a[href]", links => {
			return links.map(function(href) {
				return href.getAttribute("href");
			});
		});
		debug( "Found link hrefs: %o", hrefs );

		for( let href of hrefs ) {
			href = this.cleanupHref(href, origin);
			debug("Cleaned href: %o", href);
			if( this.isValidToAdd( href, origin ) ) {
				this.addCleanedUrl(href);
				urls.push(href);
			}
		}
		
		return urls;
	}

	async finish() {
		if( !this.browser ) {
			throw new Error("this.browser doesn’t exist, did you run .start()?");
		}
		this.browser.close();
	}
}

module.exports = SpiderPig;