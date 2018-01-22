const http = require('http')
const { createHmac } = require('crypto')
const { inherits } = require('util')

const rx = /Bearer (.+)/
const JWTS = {
	'33a9ec8bfe2b5134e245c65b327b5b90:HS256': 'c61f373bd7f74230d4d00e2a093b4282'
}
const algorithmMap = {
	HS256: 'sha256',
	HS384: 'sha384',
	HS512: 'sha512'
}
const globalAgent = new http.Agent({ keepAlive: true });
class AuthorizationError {
	constructor(message) {
		Error.captureStackTrace(this, this.constructor)
		this.statusCode = 401
		this.statusMessage = 'Unauthorized'
		this.message = message
	}
}
inherits(AuthorizationError, Error)

function checkJWT(req) {
	const auth = req.headers.authorization
	if (!auth) throw new AuthorizationError('No Authorization Header Found')
	const match = auth.match(rx)
	if (match && match.length > 1) {
		const token = match[1]
		const parts = token.split('.')
		if (parts.length !== 3) throw new AuthorizationError('JWT badly formatted')
		const header = JSON.parse((new Buffer(parts[0], 'base64')).toString())
		const signingMethod = algorithmMap[header.alg];
		if (!signingMethod) {
			throw new AuthorizationError('Signing Method not Supported')
		}
		const body = JSON.parse((new Buffer(parts[1], 'base64')).toString())
		const { iss } = body
		const jwt = JWTS[`${iss}:${header.alg}`]
		if (!jwt) throw new AuthorizationError('Identity Not Found')
		const signed = createHmac(signingMethod, jwt).update(`${parts.slice(0, 2).join('.')}`).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
		if (parts[2] !== signed) {
			throw new AuthorizationError('Signature does not match')
		}
		if (body.exp && Date.now() > body.exp * 1000) {
			throw new AuthorizationError('Token Has Expired')
		}
		return
	}
	throw new AuthorizationError('Bearer token Not Found')
}

function handleError(err, res) {
	res.setHeader('Content-Type', 'application/json')
	if (err.code && err.code === 'ECONNREFUSED') {
		res.statusCode = 502
	} else {
		res.statusCode = err.statusCode || 500
	}
	res.end(JSON.stringify(err))
}

function makeRequest(req, res) {
	const r = http.request({
		hostname: '172.17.0.1',
		port: 3000,
		path: req.path,
		headers: req.headers,
		agent: globalAgent
	}, upstream => {
		const headers = upstream.headers
		res.writeHead(upstream.statusCode, headers)
		upstream.pipe(res)
	}).on('error', err => handleError(err, res))
	req.pipe(r)
}

const plugins = {
	open: (req, res) => {
		try {
			makeRequest(req, res)
		} catch (err) {
			handleError(err, res)
		}
	},
	jwt: (req, res) => {
		try {
			checkJWT(req)
			makeRequest(req, res)
		} catch (err) {
			handleError(err, res)
		}
	}
}

const handlers = {
	'ftl.open': plugins.open,
	'ftl.admin': plugins.jwt
}

function middleware(req, res) {
	const handler = handlers[req.headers.host]
	if (!handler) {
		res.statusCode = 404
		res.end()
		return
	}
	handler(req, res)
}

http.createServer(middleware).listen(8200, '0.0.0.0')
