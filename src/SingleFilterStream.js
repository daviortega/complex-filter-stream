'use strict'

const Transform = require('stream').Transform
const _ = require('lodash')
const bunyan = require('bunyan')

module.exports =
class SingleFilterStream extends Transform {
	constructor(rule, not) {
		super({objectMode: true})
		this.rule = rule
		this.valueType = 'string'
		this.not = not || false
		this.log = bunyan.createLogger({
			name: 'SingleFilterStream',
			level: 'error'
		})
	}

	_transform(chunk, encoding, done) {
		const value = _.get(chunk, this.rule.searchOn)
		if (value) {
			switch (typeof this.rule.parsedQuery) {
				case 'string':
					this.log.debug(`${value} must be ${this.rule.parsedQuery}`)
					const matchResult = value.match(this.rule.parsedQuery)
					this.log.debug(matchResult)
					if (matchResult && this.not === false)
						this.push(chunk)
					else if (matchResult === null && this.not === true)
						this.push(chunk)
					break
				case 'number':
					switch (this.rule.searchType) {
						case 'exactValue':
							if (value === this.rule.parsedQuery && this.not === false)
								this.push(chunk)
							else if (value !== this.rule.parsedQuery && this.not === true)
								this.push(chunk)
							break
						case 'lessThan':
							if (value < this.rule.parsedQuery && this.not === false)
								this.push(chunk)
							else if (value >= this.rule.parsedQuery && this.not === true)
								this.push(chunk)
							break
						case 'greaterThan':
							if (value > this.rule.parsedQuery && this.not === false)
								this.push(chunk)
							else if (value <= this.rule.parsedQuery && this.not === true)
								this.push(chunk)
							break
					}
					break
				case 'object':
					if (this.rule.searchType === 'between') {
						const smallNumber = Math.min(...this.rule.parsedQuery)
						const largeNumber = Math.max(...this.rule.parsedQuery)
						if (value > smallNumber && value < largeNumber && this.not === false)
							this.push(chunk)
						else if ((value <= smallNumber || value >= largeNumber) && this.not === true)
							this.push(chunk)
					}
					break
			}
		}
		done()
	}
}
