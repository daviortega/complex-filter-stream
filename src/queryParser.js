'use strict'

const pumpify = require('pumpify')
const merge2 = require('merge2')
const fs = require('fs')

const bunyan = require('bunyan')
const log = bunyan.createLogger({
    name: 'queryParser',
    level: 'info'
})

const SingleFilterStream = require('./SingleFilterStream')

const parseItemQuery = (itemQuery) => {
    log.info(`loading query item of type ${itemQuery.type}`)
    let filterTransform = null
    if (itemQuery.type === 'OR' || itemQuery.type === 'AND') {
        filterTransform = parseQueryStack(itemQuery.args, itemQuery.type)
    }
    else if (itemQuery.type === 'filter') {
        const start = itemQuery.searchType === 'startsWith' || itemQuery.searchType === 'exact' ? '^' : ''
        const end = itemQuery.searchType === 'endsWith' || itemQuery.searchType === 'exact' ? '$' : ''
        itemQuery.parsedQuery = start + itemQuery.searchFor + end
        log.debug(`parsedQuery: "${itemQuery.parsedQuery}" in "${itemQuery.searchOn}"`)
        filterTransform = new SingleFilterStream(itemQuery, itemQuery.not)
    }
    return filterTransform
}

const parseQueryStack = (queryStack, type = "AND") => {
    const filterStackStream = merge2().on('data', (chunk) => {
        console.log(chunk)
    })
    if (type === 'AND') {
        queryStack.map((item, i) => {
            log.debug('Adding an AND stream to the stack')
            filterStackStream.add(parseItemQuery(item))
        })
    }
    else if (type === 'OR') {
        const orStack = []
        queryStack.map((item, i) => {
            log.debug('Adding an OR stream to the stack')
            orStack.push(parseItemQuery(item))            
        })
        filterStackStream.add(orStack)
    }
     */
    console.log(filterStackStream)
    return filterStackStream
}

module.exports = (queryFileName) => {
    log.info('loading query file')
    const queryStack = JSON.parse(fs.readFileSync(queryFileName))    
    log.info('building stack of Transforms')
    return parseQueryStack(queryStack)

}

