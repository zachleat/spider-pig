#!/usr/bin/env node
const puppeteer = require("puppeteer");
const argv = require("minimist")(process.argv.slice(2));
const SpiderPig = require("./SpiderPig");
const debug = require("debug")("SpiderPig:CLI");

let url = argv._[0];
let selector = argv.selector;
let selectorLimit = argv.selectorlimit || 20;

if(!url) {
	console.log( "spiderpig requires a url argument." );
	return;
}

debug( `spider-pig for root url: ${url}` );

async function hasSelector(localUrl, sel) {
	let browser = await puppeteer.launch();
	let page = await browser.newPage();
	await page.goto(localUrl, {
		waitUntil: ["load", "networkidle0"]
	});
	let ret = await page.$$(sel);

	browser.close();
	return ret.length > 0;
}

(async function() {
	let sp = new SpiderPig();
	await sp.start();
	let urls = await sp.fetchLocalUrls(url);
	if( process.env.DEBUG ) {
		debug( "Found urls: %O", urls );
	} else {
		console.log( urls.join("\n") );
	}
	if( selector ) {
		console.log( `\nLooking for urls with CSS selector "${selector}"`, selectorLimit ? `(limit ${selectorLimit}):` : ":" );
		for( let j = 0, k = urls.length; j<k; j++ ) {
			if( selectorLimit && j >= selectorLimit ) {
				break;
			}

			let localUrl = urls[j];
			let has = await hasSelector(localUrl, selector);
			console.log( `${localUrl}`, has ? "✅  Yes" : "❌  No" );
		}
	}

	await sp.finish();
})();