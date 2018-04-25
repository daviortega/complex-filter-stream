'use strict'

const Transform = require('stream').Transform
const bunyan = require('bunyan')
/* Example of rule
	rule = {
		type: "simple",
		searchOn: "microscopist",
		searchType: "contains",
		searchFor: "search string"
	}
*/
module.exports =
class SingleFilterStream extends Transform {
	constructor(rule, not) {
		super({objectMode: true})
		this.rule = rule
		this.not = not || false
		this.log = bunyan.createLogger({
			name: 'SingleFilterStream',
			level: 'info'
		})
	}

	_transform(chunk, encoding, done) {
		const stringToMatch = chunk[this.rule.searchOn]
		this.log.debug(`${chunk.microscopist} must be ${this.rule.parsedQuery}`)
		const matchResult = stringToMatch.match(this.rule.parsedQuery)
		this.log.debug(matchResult)
		if (matchResult && this.not === false)
			this.push(chunk)
		else if (matchResult === null && this.not === true)
			this.push(chunk)
		done()
	}
}
