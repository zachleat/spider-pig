import test from "ava";
import path from "path";
import pifiy from "pify";
import connect from "connect";
import serveStatic from "serve-static";
import SpiderPig from "../SpiderPig";

const sitePath = __dirname;
const urlRoot = "http://localhost:8080/";
const globalServer = openServer();

function openServer() {
	return new Promise(function(resolve, reject) {
		let server = connect().use(serveStatic(sitePath)).listen(8080, function() {
			// console.log(`Web server started on 8080 for ${sitePath}.`);
			resolve(server);
		});
	});
}

test.before(async t => {
	await globalServer;
});

test.after.always(async t => {
	let server = await globalServer;
	server.close();
	// console.log( "Web server closed." );
});

test("cleanupHref", t => {
	let sp = new SpiderPig();
	t.is( sp.cleanupHref("test.html", "http://localhost/"), "http://localhost/test.html" );
	t.is( sp.cleanupHref("test.html#content", "http://localhost/"), "http://localhost/test.html" );
	t.is( sp.cleanupHref("http://localhost:8080/test.html#content", "http://localhost:8080/"), "http://localhost:8080/test.html" );
	t.is( sp.cleanupHref("http://localhost:8080/files/root.html#content", "http://localhost:8080/"), "http://localhost:8080/files/root.html" );
	t.is( sp.cleanupHref("http://localhost:8080/test.html#content"), "http://localhost:8080/test.html" );
});

test("isLocalHref", t => {
	let sp = new SpiderPig();
	t.is( sp.isLocalHref("test.html", "http://localhost/"), true );
	t.is( sp.isLocalHref("test2.html", "http://localhost/"), true );

	t.is( sp.isLocalHref("test.html", "http://localhost:8080"), true );
	t.is( sp.isLocalHref("test2.html", "http://localhost:8080"), true );
	t.is( sp.isLocalHref("http://localhost:8080/test2.html", "http://localhost:8080"), true );
	t.is( sp.isLocalHref("http://www.google.com", "http://localhost:8080"), false );
});

test("isValidToAdd", t => {
	let sp = new SpiderPig();
	t.is( sp.isValidToAdd("test.html", "http://localhost/"), true );

	sp.addCleanedUrl(sp.cleanupHref("test2.html", "http://localhost/"));
	t.is( sp.isValidToAdd("test2.html", "http://localhost/"), false );

	t.is( sp.isValidToAdd("#content", "http://localhost/"), false );
});

test("files/root.html", async t => {
	let sp = new SpiderPig();
	await sp.start();

	let urls = await sp.fetchLocalUrls(urlRoot + "files/root.html");
	let expected = [
		"http://localhost:8080/files/test.html",
		"http://localhost:8080/files/test2.html",
	];

	t.deepEqual( urls, expected );

	let urlsFiltered = sp.filterUrls(urls, "test2");
	let expectedFiltered = [
		"http://localhost:8080/files/test2.html",
	];
	t.deepEqual( urlsFiltered, expectedFiltered );

	await sp.finish();
});

test(".selector()", async t => {
	let sp = new SpiderPig();
	await sp.start();

	t.is( await sp.selectorCount(urlRoot + "files/hasselector.html", ".myselector" ), 3 );
	t.is( await sp.selectorCount(urlRoot + "files/hasselector.html", ".madeupselector" ), 0 );
	t.is( await sp.selectorCount(urlRoot + "files/doesnothaveselector.html", ".myselector" ), 0 );
	t.is( await sp.selectorCount(urlRoot + "files/doesnothaveselector.html", "div" ), 3 );

	await sp.finish();
});
