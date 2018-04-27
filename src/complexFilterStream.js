'use strict'

const pumpify = require('pumpify')
const unique = require('unique-stream')
const fs = require('fs')
const CombineStream = require('combine-stream')

const bunyan = require('bunyan')
const log = bunyan.createLogger({
    name: 'complexFilterStream',
    level: 'error'
})

const SingleFilterStream = require('./SingleFilterStream')

const parseItemQuery = (itemQuery) => {
    log.info(`loading query item of type ${itemQuery.type}`)
    let filterTransform = null
    if (itemQuery.type === 'OR' || itemQuery.type === 'AND') {
        filterTransform = parseQueryStack(itemQuery.args, itemQuery.type)
    }
    else if (itemQuery.type === 'filter') {
        if (itemQuery.searchType === 'regex') {
            itemQuery.parsedQuery = itemQuery.searchFor
        }
        else if ( ['exactValue', 'lessThan', 'greaterThan'].indexOf(itemQuery.searchType) !== -1) {
            itemQuery.parsedQuery = parseFloat(itemQuery.searchFor)
        }
        else if (itemQuery.searchType === 'between') {
            itemQuery.parsedQuery = itemQuery.searchFor.split(';').map(parseFloat)
        }
        else {
            const start = itemQuery.searchType === 'startsWith' || itemQuery.searchType === 'exact' ? '^' : ''
            const end = itemQuery.searchType === 'endsWith' || itemQuery.searchType === 'exact' ? '$' : ''
            itemQuery.parsedQuery = start + itemQuery.searchFor + end
        }   
        log.debug(`parsedQuery: "${itemQuery.parsedQuery}" in "${itemQuery.searchOn}" as ${itemQuery.searchType}`)
        filterTransform = new SingleFilterStream(itemQuery, itemQuery.not)
    }
    return filterTransform
}

const parseQueryStack = (queryStack, type = "AND") => {
    let finalStream = null
    if (type === 'AND') {
        const filterStackStream = []
        queryStack.map((item, i) => {
            log.debug('Adding a stream to the stack with AND association')
            filterStackStream.push(parseItemQuery(item))
        })
        if (filterStackStream.length > 1)
            finalStream = pumpify.obj(filterStackStream)
        else
            finalStream = filterStackStream[0]
    }
    else if (type === 'OR') {
        const orStack = []
        queryStack.map((item, i) => {
            log.debug('Adding an OR stream to the stack')
            orStack.push(parseItemQuery(item))            
        })
        const orBundleStream = new CombineStream(orStack)
        finalStream = pumpify.obj(orBundleStream, unique())
    }
    if (finalStream)
        return finalStream
    else
        throw Error('Something is wrong with your queryStack')
}

module.exports = (queryStack) => {
    log.info('loading query file')    
    log.info('building stack of Transforms')
    return parseQueryStack(queryStack)

}

