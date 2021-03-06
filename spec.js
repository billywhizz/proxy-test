/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const should = require('should')
const { request } = require('http')
const { parse } = require('url')

function get({ url, headers }) {
	const options = parse(url)
	options.headers = headers
	return new Promise((ok, fail) => {
		request(options, res => {
			const body = []
			res.on('data', chunk => body.push(chunk.toString()))
			res.on('end', () => {
				res.text = body.join('')
				ok(res)
			})
		}).on('error', fail).end()
	})
}

describe('test kong api', () => {

	before(done => {
		done()
	})

	after(done => {
		done()
	})

	it('should get a 404 not found with no host header', async () => {
		const url = 'http://172.17.0.1:8000/'
		const headers = {}
		const res = await get({ url, headers })
		res.should.have.properties(['httpVersionMajor', 'httpVersionMinor', 'statusCode', 'statusMessage', 'headers'])
		res.httpVersionMajor.should.equal(1)
		res.httpVersionMinor.should.equal(1)
		res.statusCode.should.equal(404)
		res.statusMessage.should.equal('Not Found')
		res.headers.should.have.properties(['date', 'content-type', 'connection'])
		res.headers.connection.should.equal('close')
		res.headers.date.should.match(/\w\w\w,\s\d+\s\w\w\w\s\d\d\d\d\s\d\d:\d\d:\d\d\s.+/)
		res.headers['content-type'].should.equal('application/json; charset=utf-8')
		const body = JSON.parse(res.text)
		body.should.have.properties(['message'])
		body.message.should.equal('no route and no API found with those values')
	})

	it('should get a 404 not found with unsupported host header', async () => {
		const url = 'http://172.17.0.1:8000/'
		const headers = { Host: 'foo' }
		const res = await get({ url, headers })
		res.should.have.properties(['httpVersionMajor', 'httpVersionMinor', 'statusCode', 'statusMessage', 'headers'])
		res.httpVersionMajor.should.equal(1)
		res.httpVersionMinor.should.equal(1)
		res.statusCode.should.equal(404)
		res.statusMessage.should.equal('Not Found')
		res.headers.should.have.properties(['date', 'content-type', 'connection'])
		res.headers.connection.should.equal('close')
		res.headers.date.should.match(/\w\w\w,\s\d+\s\w\w\w\s\d\d\d\d\s\d\d:\d\d:\d\d\s.+/)
		res.headers['content-type'].should.equal('application/json; charset=utf-8')
		const body = JSON.parse(res.text)
		body.should.have.properties(['message'])
		body.message.should.equal('no route and no API found with those values')
	})

	it('should get a 200 OK for api with no plugins', async () => {
		const url = 'http://172.17.0.1:8000/'
		const headers = { Host: 'ftl.open' }
		const res = await get({ url, headers })
		res.should.have.properties(['httpVersionMajor', 'httpVersionMinor', 'statusCode', 'statusMessage', 'headers'])
		res.httpVersionMajor.should.equal(1)
		res.httpVersionMinor.should.equal(1)
		res.statusCode.should.equal(200)
		res.statusMessage.should.equal('OK')
		res.headers.should.have.properties(['content-length', 'connection'])
		res.headers.connection.should.equal('close')
		res.headers['content-length'].should.equal('12')
	})

	it('should get a 401 not authorized with no auth header', async () => {
		const url = 'http://172.17.0.1:8000/'
		const headers = { Host: 'ftl.admin' }
		const res = await get({ url, headers })
		res.should.have.properties(['httpVersionMajor', 'httpVersionMinor', 'statusCode', 'statusMessage', 'headers'])
		res.httpVersionMajor.should.equal(1)
		res.httpVersionMinor.should.equal(1)
		res.statusCode.should.equal(401)
		res.statusMessage.should.equal('Unauthorized')
		res.headers.should.have.properties(['date', 'content-type', 'connection'])
		res.headers.connection.should.equal('close')
		res.headers.date.should.match(/\w\w\w,\s\d+\s\w\w\w\s\d\d\d\d\s\d\d:\d\d:\d\d\s.+/)
		res.headers['content-type'].should.equal('application/json; charset=utf-8')
		const body = JSON.parse(res.text)
		body.should.have.properties(['message'])
		body.message.should.equal('Unauthorized')
	})

	it('should get a 401 not authorized with basic auth header', async () => {
		const url = 'http://172.17.0.1:8000/'
		const headers = { Host: 'ftl.admin', Authorization: 'Basic abc123' }
		const res = await get({ url, headers })
		res.should.have.properties(['httpVersionMajor', 'httpVersionMinor', 'statusCode', 'statusMessage', 'headers'])
		res.httpVersionMajor.should.equal(1)
		res.httpVersionMinor.should.equal(1)
		res.statusCode.should.equal(401)
		res.statusMessage.should.equal('Unauthorized')
		res.headers.should.have.properties(['date', 'content-type', 'connection'])
		res.headers.connection.should.equal('close')
		res.headers.date.should.match(/\w\w\w,\s\d+\s\w\w\w\s\d\d\d\d\s\d\d:\d\d:\d\d\s.+/)
		res.headers['content-type'].should.equal('application/json; charset=utf-8')
		const body = JSON.parse(res.text)
		body.should.have.properties(['message'])
		body.message.should.equal('Unauthorized')
	})

	it('should get a 401 not authorized with bad beaer token', async () => {
		const url = 'http://172.17.0.1:8000/'
		const headers = { Host: 'ftl.admin', Authorization: 'Bearer abc123' }
		const res = await get({ url, headers })
		res.should.have.properties(['httpVersionMajor', 'httpVersionMinor', 'statusCode', 'statusMessage', 'headers'])
		res.httpVersionMajor.should.equal(1)
		res.httpVersionMinor.should.equal(1)
		res.statusCode.should.equal(401)
		res.statusMessage.should.equal('Unauthorized')
		res.headers.should.have.properties(['date', 'content-type', 'connection'])
		res.headers.connection.should.equal('close')
		res.headers.date.should.match(/\w\w\w,\s\d+\s\w\w\w\s\d\d\d\d\s\d\d:\d\d:\d\d\s.+/)
		res.headers['content-type'].should.equal('application/json; charset=utf-8')
		const body = JSON.parse(res.text)
		body.should.have.properties(['message'])
		body.message.should.equal('Bad token; invalid JSON')
	})

	it('should get a 403 not authorized with bad signature', async () => {
		const url = 'http://172.17.0.1:8000/'
		const headers = { Host: 'ftl.admin', Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoSWQiOiI1NmEyNDg0NWIzZWZiOTExMDA0NjExNWIiLCJpc3MiOiIzM2E5ZWM4YmZlMmI1MTM0ZTI0NWM2NWIzMjdiNWI5MCIsImV4cCI6MTU0NjMwMDgwMDAwMH0.twRo3KLP2VcI_E8RoWuYN0HdNtQ3vUiAgmDgYVnR2uE' }
		const res = await get({ url, headers })
		res.should.have.properties(['httpVersionMajor', 'httpVersionMinor', 'statusCode', 'statusMessage', 'headers'])
		res.httpVersionMajor.should.equal(1)
		res.httpVersionMinor.should.equal(1)
		res.statusCode.should.equal(403)
		res.statusMessage.should.equal('Forbidden')
		res.headers.should.have.properties(['date', 'content-type', 'connection'])
		res.headers.connection.should.equal('close')
		res.headers.date.should.match(/\w\w\w,\s\d+\s\w\w\w\s\d\d\d\d\s\d\d:\d\d:\d\d\s.+/)
		res.headers['content-type'].should.equal('application/json; charset=utf-8')
		const body = JSON.parse(res.text)
		body.should.have.properties(['message'])
		body.message.should.equal('Invalid signature')
	})

	it('should get a 200 OK for good bearer token', async () => {
		const url = 'http://172.17.0.1:8000/'
		const headers = { Host: 'ftl.admin', Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoSWQiOiI1NmEyNDg0NWIzZWZiOTExMDA0NjExNWIiLCJpc3MiOiIzM2E5ZWM4YmZlMmI1MTM0ZTI0NWM2NWIzMjdiNWI5MCIsImV4cCI6MTU0NjMwMDgwMDAwMH0.YJy1hXN58oa_czq13PEv5i6mR40jxATeShgeNjrNMk8' }
		const res = await get({ url, headers })
		res.should.have.properties(['httpVersionMajor', 'httpVersionMinor', 'statusCode', 'statusMessage', 'headers'])
		res.httpVersionMajor.should.equal(1)
		res.httpVersionMinor.should.equal(1)
		res.statusCode.should.equal(200)
		res.statusMessage.should.equal('OK')
		res.headers.should.have.properties(['content-length', 'connection'])
		res.headers.connection.should.equal('close')
		res.headers['content-length'].should.equal('12')
	})

})

describe('test gateway', () => {

	before(done => {
		done()
	})

	after(done => {
		done()
		setTimeout(() => process.exit(0), 1000)
	})

	it('should get a 404 not found with no host header', async () => {
		const url = 'http://172.17.0.1:8200/'
		const headers = {}
		const res = await get({ url, headers })
		res.should.have.properties(['httpVersionMajor', 'httpVersionMinor', 'statusCode', 'statusMessage', 'headers'])
		res.httpVersionMajor.should.equal(1)
		res.httpVersionMinor.should.equal(1)
		res.statusCode.should.equal(404)
		res.statusMessage.should.equal('Not Found')
		res.headers.should.have.properties(['date', 'content-length', 'connection'])
		res.headers.connection.should.equal('close')
		res.headers.date.should.match(/\w\w\w,\s\d+\s\w\w\w\s\d\d\d\d\s\d\d:\d\d:\d\d\s.+/)
		res.headers['content-length'].should.equal('0')
	})

	it('should get a 404 not found with unsupported host header', async () => {
		const url = 'http://172.17.0.1:8200/'
		const headers = { Host: 'foo' }
		const res = await get({ url, headers })
		res.should.have.properties(['httpVersionMajor', 'httpVersionMinor', 'statusCode', 'statusMessage', 'headers'])
		res.httpVersionMajor.should.equal(1)
		res.httpVersionMinor.should.equal(1)
		res.statusCode.should.equal(404)
		res.statusMessage.should.equal('Not Found')
		res.headers.should.have.properties(['date', 'content-length', 'connection'])
		res.headers.connection.should.equal('close')
		res.headers.date.should.match(/\w\w\w,\s\d+\s\w\w\w\s\d\d\d\d\s\d\d:\d\d:\d\d\s.+/)
		res.headers['content-length'].should.equal('0')
	})

	it('should get a 200 OK for api with no plugins', async () => {
		const url = 'http://172.17.0.1:8200/'
		const headers = { Host: 'ftl.open' }
		const res = await get({ url, headers })
		res.should.have.properties(['httpVersionMajor', 'httpVersionMinor', 'statusCode', 'statusMessage', 'headers'])
		res.httpVersionMajor.should.equal(1)
		res.httpVersionMinor.should.equal(1)
		res.statusCode.should.equal(200)
		res.statusMessage.should.equal('OK')
		res.headers.should.have.properties(['content-length', 'connection'])
		res.headers.connection.should.equal('close')
		res.headers['content-length'].should.equal('12')
	})

	it('should get a 401 not authorized with no auth header', async () => {
		const url = 'http://172.17.0.1:8200/'
		const headers = { Host: 'ftl.admin' }
		const res = await get({ url, headers })
		res.should.have.properties(['httpVersionMajor', 'httpVersionMinor', 'statusCode', 'statusMessage', 'headers'])
		res.httpVersionMajor.should.equal(1)
		res.httpVersionMinor.should.equal(1)
		res.statusCode.should.equal(401)
		res.statusMessage.should.equal('Unauthorized')
		res.headers.should.have.properties(['date', 'content-type', 'connection'])
		res.headers.connection.should.equal('close')
		res.headers.date.should.match(/\w\w\w,\s\d+\s\w\w\w\s\d\d\d\d\s\d\d:\d\d:\d\d\s.+/)
		res.headers['content-type'].should.equal('application/json')
		const body = JSON.parse(res.text)
		body.should.have.properties(['message'])
		body.message.should.equal('No Authorization Header Found')
	})

	it('should get a 401 not authorized with basic auth header', async () => {
		const url = 'http://172.17.0.1:8200/'
		const headers = { Host: 'ftl.admin', Authorization: 'Basic abc123' }
		const res = await get({ url, headers })
		res.should.have.properties(['httpVersionMajor', 'httpVersionMinor', 'statusCode', 'statusMessage', 'headers'])
		res.httpVersionMajor.should.equal(1)
		res.httpVersionMinor.should.equal(1)
		res.statusCode.should.equal(401)
		res.statusMessage.should.equal('Unauthorized')
		res.headers.should.have.properties(['date', 'content-type', 'connection'])
		res.headers.connection.should.equal('close')
		res.headers.date.should.match(/\w\w\w,\s\d+\s\w\w\w\s\d\d\d\d\s\d\d:\d\d:\d\d\s.+/)
		res.headers['content-type'].should.equal('application/json')
		const body = JSON.parse(res.text)
		body.should.have.properties(['message'])
		body.message.should.equal('Bearer token Not Found')
	})

	it('should get a 401 not authorized with bad beaer token', async () => {
		const url = 'http://172.17.0.1:8200/'
		const headers = { Host: 'ftl.admin', Authorization: 'Bearer abc123' }
		const res = await get({ url, headers })
		res.should.have.properties(['httpVersionMajor', 'httpVersionMinor', 'statusCode', 'statusMessage', 'headers'])
		res.httpVersionMajor.should.equal(1)
		res.httpVersionMinor.should.equal(1)
		res.statusCode.should.equal(401)
		res.statusMessage.should.equal('Unauthorized')
		res.headers.should.have.properties(['date', 'content-type', 'connection'])
		res.headers.connection.should.equal('close')
		res.headers.date.should.match(/\w\w\w,\s\d+\s\w\w\w\s\d\d\d\d\s\d\d:\d\d:\d\d\s.+/)
		res.headers['content-type'].should.equal('application/json')
		const body = JSON.parse(res.text)
		body.should.have.properties(['message'])
		body.message.should.equal('JWT badly formatted')
	})

	it('should get a 401 not authorized with bad signature', async () => {
		const url = 'http://172.17.0.1:8200/'
		const headers = { Host: 'ftl.admin', Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoSWQiOiI1NmEyNDg0NWIzZWZiOTExMDA0NjExNWIiLCJpc3MiOiIzM2E5ZWM4YmZlMmI1MTM0ZTI0NWM2NWIzMjdiNWI5MCIsImV4cCI6MTU0NjMwMDgwMDAwMH0.twRo3KLP2VcI_E8RoWuYN0HdNtQ3vUiAgmDgYVnR2uE' }
		const res = await get({ url, headers })
		res.should.have.properties(['httpVersionMajor', 'httpVersionMinor', 'statusCode', 'statusMessage', 'headers'])
		res.httpVersionMajor.should.equal(1)
		res.httpVersionMinor.should.equal(1)
		res.statusCode.should.equal(401)
		res.statusMessage.should.equal('Unauthorized')
		res.headers.should.have.properties(['date', 'content-type', 'connection'])
		res.headers.connection.should.equal('close')
		res.headers.date.should.match(/\w\w\w,\s\d+\s\w\w\w\s\d\d\d\d\s\d\d:\d\d:\d\d\s.+/)
		res.headers['content-type'].should.equal('application/json')
		const body = JSON.parse(res.text)
		body.should.have.properties(['message'])
		body.message.should.equal('Signature does not match')
	})

	it('should get a 200 OK for good bearer token', async () => {
		const url = 'http://172.17.0.1:8200/'
		const headers = { Host: 'ftl.admin', Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoSWQiOiI1NmEyNDg0NWIzZWZiOTExMDA0NjExNWIiLCJpc3MiOiIzM2E5ZWM4YmZlMmI1MTM0ZTI0NWM2NWIzMjdiNWI5MCIsImV4cCI6MTU0NjMwMDgwMDAwMH0.YJy1hXN58oa_czq13PEv5i6mR40jxATeShgeNjrNMk8' }
		const res = await get({ url, headers })
		res.should.have.properties(['httpVersionMajor', 'httpVersionMinor', 'statusCode', 'statusMessage', 'headers'])
		res.httpVersionMajor.should.equal(1)
		res.httpVersionMinor.should.equal(1)
		res.statusCode.should.equal(200)
		res.statusMessage.should.equal('OK')
		res.headers.should.have.properties(['content-length', 'connection'])
		res.headers.connection.should.equal('close')
		res.headers['content-length'].should.equal('12')
	})

})


