#!/usr/bin/env node
const puppeteer = require("puppeteer");
const chalk = require("chalk");
const argv = require("minimist")(process.argv.slice(2));
const SpiderPig = require("./SpiderPig");
const debug = require("debug")("SpiderPig:CLI");

let url = argv._[0];
let selector = argv.selector;
let selectorLimit = argv.selectorlimit || 0;
let filter = argv.filter;

if(!url) {
	console.log( "spiderpig requires a url argument." );
	return;
}

debug( `spider-pig for root url: ${url}` );

(async function() {
	let sp = new SpiderPig();
	await sp.start();
	let urls = await sp.fetchLocalUrls(url);
	if( filter ) {
		urls = sp.filterUrls(urls, filter);
	}
	if( process.env.DEBUG ) {
		debug( "Found urls: %O", urls );
	} else if(!selector) {
		console.log( urls.join("\n") );
	}

	if( selector ) {
		console.log( `Found ${urls.length} url${urls.length !== 1 ? "s" : ""}.`);
		console.log( `Looking for urls with CSS selector "${selector}"` + (selectorLimit ? ` (limit ${selectorLimit}):` : ":") );
		for( let j = 0, k = urls.length; j<k; j++ ) {
			if( selectorLimit && j >= selectorLimit ) {
				break;
			}

			let localUrl = urls[j];
			let resultCount = await sp.selectorCount(localUrl, selector);
			console.log( `${localUrl}`, resultCount > 0 ? chalk.green(`✅  Yes (${resultCount} result${resultCount !== 1 ? "s" : ""})`) : chalk.red("❌  No") );
		}
	}

	await sp.finish();
})();