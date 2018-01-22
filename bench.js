const { spawn } = require('child_process')
const { writeFile } = require('fs')
const { promisify } = require('util')

const writeFileAsync = promisify(writeFile)

function wrk(url = 'http://172.17.0.1:8000/', headers = []) {
	const args = [''].concat((headers || []).map(h => `'${h}'`)).join(' -H ')
	const script = `sudo docker run -t --rm williamyeh/wrk -c 100 -t 2 -d 30 ${args} ${url}`
	return new Promise((ok, fail) => {
		const child = spawn('/bin/sh', ['-c', script])
		const output = []
		const error = []
		child.stdout.on('data', b => {
			output.push(b.toString())
			process.stdout.write(b)
		})
		child.stderr.on('data', b => {
			error.push(b.toString())
		})
		child.on('close', code => {
			if (code !== 0) {
				console.error(error.join(''))
				fail(new Error(`Bad Return Code: ${code}`))
				return
			}
			const out = output.join('')
			let latency = 0
			let unit = 'us'
			let rps = 0
			let match = out.match(/Latency\s+([\d\.]+)(\w+)\s/)
			if (match && match.length > 2) {
				latency = parseFloat(match[1])
				unit = match[2]
				switch (unit) {
				case 'ms':
					latency *= 1000
					break
				case 's':
					latency *= 1000000
					break
				default:
					break
				}
			}
			match = out.match(/Requests\/sec:\s+([\d\.]+)\s/)
			if (match && match.length > 1) {
				rps = parseInt(match[1], 10)
			}
			ok({ rps, latency })
		})
	})
}

async function run(url) {
	const results = []
	results.push({ name: 'no host specified', results: await wrk(url) })
	results.push({ name: 'no api found', results: await wrk(url, ['Host: foo']) })
	results.push({ name: 'api with no plugins', results: await wrk(url, ['Host: ftl.open']) })
	results.push({ name: 'api with jwt auth, no auth header', results: await wrk(url, ['Host: ftl.admin']) })
	results.push({ name: 'api with jwt auth, basic auth header', results: await wrk(url, ['Host: ftl.admin', 'Authorization: Basic abc123']) })
	results.push({ name: 'api with jwt auth, bad bearer token', results: await wrk(url, ['Host: ftl.admin', 'Authorization: Bearer abc123']) })
	results.push({ name: 'api with jwt auth, bad signature', results: await wrk(url, ['Host: ftl.admin', 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoSWQiOiI1NmEyNDg0NWIzZWZiOTExMDA0NjExNWIiLCJpc3MiOiJjYzFlYTU0MjVlNmMyODcwNDI3NTc0M2UwNDFkMjY3YiIsImV4cCI6MTUxNTcwMTE4OTUwOH0.Gle0SBTEbJF43CxxlfHK9nc_du30N7A5lJqH1zw8EQs']) })
	results.push({ name: 'api with jwt auth, good request', results: await wrk(url, ['Host: ftl.admin', 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoSWQiOiI1NmEyNDg0NWIzZWZiOTExMDA0NjExNWIiLCJpc3MiOiJjYzFlYTU0MjVlNmMyODcwNDI3NTc0M2UwNDFkMjY3YiIsImV4cCI6MTUxNTcwMTE4OTUwOH0.8WjcYwrKVxH-UIALij5BnINPvUeP7hcGFZv5hMcrqHQ']) })
	return { url, results }
}

async function start(url = 'http://172.17.0.1:8000/', name = 'kong') {
	const results = await run(url)
	await writeFileAsync(`./${name}.results.json`, JSON.stringify(results, null, '  '))
}

start(process.argv[2], process.argv[3]).catch(err => console.error(err))
