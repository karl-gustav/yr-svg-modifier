const { JSDOM } = require('jsdom');
const http = require('http');
const url = require('url');
const fetch = require('./fetch');

// listen for ctrl+c
require('process').on('SIGINT', () => process.exit(0))

function handler(req, res) {
	const reqURL = url.parse(req.url);
	if (reqURL.pathname === '/favicon.ico') {
		res.writeHead(404, {'Content-type':'text/plain; charset=utf-8'});res.write('');
		res.end();
		return;
	} else if (req.url === '/') {
		res.writeHead(200, {'Content-type':'text/plain; charset=utf-8'});
		res.write('Call this endpoint with the numbers (ex: 10-1025968) in the yr url: https://www.yr.no/nb/innhold/10-1025968/meteogram.svg');
		res.end();
		return;
	}
	fetch(`https://www.yr.no/nb/innhold/${reqURL.pathname.substring(1)}/meteogram.svg`)
		.then(content => {
			res.writeHead(200, {
				'Content-type':'image/svg+xml; charset=utf-8',
				'Access-Control-Allow-Origin':'*'
			});
			const dom = new JSDOM(content);
			const body = dom.window.document.body;
			const svg = body.querySelector('svg');
			svg.setAttribute('height', '300');
			svg.querySelector('rect').setAttribute('height', '300'); // background
			svg.querySelector('svg').remove(); // logo
			svg.querySelector('g').remove(); // en tjeneste fra
			svg.querySelector('svg').remove(); // NRK
			svg.querySelector('svg').remove(); // met institutt
			svg.querySelector('g').remove(); // Værvarsel for Lillesveiven
			const graph = svg.querySelector('g');
			graph.setAttribute('transform', 'translate(0, 0)');
			const windGraph = graph.querySelector('[transform="translate(30 180)"]');
			windGraph.querySelectorAll('text')
				.forEach(node => {
					const ms = node.innerHTML;
					node.innerHTML = Math.round(ms * 3.6);
				});
			const legend = graph.querySelector('[transform="translate(30, 278)"]');
			legend.querySelectorAll('text')
				.forEach(node => node.innerHTML = node.innerHTML.replace('m/s', 'km/t'));

			res.write(body.innerHTML);
			res.end();
		})
		.catch(err => {
			console.error(err);
			res.writeHead(400, {'Content-type':'text/plain; charset=utf-8'});
			res.write(err.message);
			res.end();
		});
}

const port = process.env.PORT || 8080;
console.log('Server listening on http://localhost:'+port);
http.createServer(handler).listen(port);
