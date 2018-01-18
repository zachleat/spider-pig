import test from "ava";
import path from "path";
import pifiy from "pify";
import connect from "connect";
import serveStatic from "serve-static";
import SpiderPig from "../SpiderPig";

const sitePath = __dirname;
const urlRoot = "http://localhost:8080/";

function openServer() {
	return new Promise(function(resolve, reject) {
		let server = connect().use(serveStatic(sitePath)).listen(8080, function() {
			console.log(`Web server started on 8080 for ${sitePath}.`);
			resolve(server);
		});
	});
}

function closeServer(server) {
	server.close();
	console.log( "Web server closed." );
}

test("cleanupHref", t => {
	let sp = new SpiderPig();
	t.is( sp.cleanupHref("test.html", "http://localhost/"), "http://localhost/test.html" );
	t.is( sp.cleanupHref("test.html#content", "http://localhost/"), "http://localhost/test.html" );
	t.is( sp.cleanupHref("http://localhost:8080/test.html#content", "http://localhost:8080/"), "http://localhost:8080/test.html" );
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
	let url = urlRoot + "files/root.html";

	let sp = new SpiderPig();
	await sp.start();
	let server = await openServer();

	let urls = await sp.fetchLocalUrls(url);
	let expected = [
		"http://localhost:8080/test.html",
		"http://localhost:8080/test2.html",
		"http://localhost:8080/root.html",
	];

	t.deepEqual( urls, expected );

	let urlsFiltered = sp.filterUrls(urls, "test");
	let expectedFiltered = [
		"http://localhost:8080/test.html",
		"http://localhost:8080/test2.html",
	];
	t.deepEqual( urlsFiltered, expectedFiltered );

	await sp.finish();

	closeServer(server);
});
