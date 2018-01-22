const { readdir, writeFile } = require('fs')
const { promisify } = require('util')
const { open } = require('./openurl')

const readdirAsync = promisify(readdir)
const writeFileAsync = promisify(writeFile)
const openAsync = promisify(open)

async function start() {
	const rx = /(.+)\.results\.json/
	const tests = (await readdirAsync(__dirname)).filter(fn => fn.match(rx)).map(fn => fn.match(rx)[1])
	const results = {}
	for (const name of tests) {
		results[name] = require(`./${name}.results.json`)
	}
	const rps = {
		title: { text: 'Throughput (RPS)' },
		xAxis: { categories: results.kong.results.map(r => r.name) },
		yAxis: {
			title: { text: 'rps' },
			tickInterval: 5000
		},
		series: tests.map(name => ({ name, data: results[name].results.map(r => r.results.rps), type: 'column' }))
	}
	const latency = {
		title: { text: 'Average Latency' },
		xAxis: { categories: results.kong.results.map(r => r.name) },
		yAxis: {
			title: { text: 'usec' },
			tickInterval: 100
		},
		series: tests.map(name => ({ name, data: results[name].results.map(r => r.results.latency), type: 'column' }))
	}	
	const html = `
	<script src="https://code.highcharts.com/highcharts.js"></script>
	<script src="https://code.highcharts.com/modules/exporting.js"></script>
	<style>
	#container {
			min-width: 300px;
			max-width: 800px;
			height: 300px;
			margin: 1em auto;
	}	
	</style>
	<div id="rps"></div>
	<div id="latency"></div>
	<script type="text/javascript">
	Highcharts.chart('rps', ${JSON.stringify(rps, null, '  ')});
	Highcharts.chart('latency', ${JSON.stringify(latency, null, '  ')});
	</script>
	`
	await writeFileAsync('./results.html', html)
	await openAsync(`file://${__dirname}/results.html`)
}

start().catch(err => console.error(err))
