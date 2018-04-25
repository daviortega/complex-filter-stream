/* eslint-disable no-magic-numbers */
'use strict'

const expect = require('chai').expect
const path = require('path')
const fs = require('fs')
const Readable = require('stream').Readable
const t2 = require('through2')

const queryParser = require('./queryParser')


const dataTestPath = path.resolve(__dirname, '..', 'dataTest')
const singleQueryFilename = path.resolve(dataTestPath, 'singleQuery.json')
const notQueryFilename = path.resolve(dataTestPath, 'notQuery.json')
const notOmittedQueryFilename = path.resolve(dataTestPath, 'notOmittedQuery.json')
const twoAndQueryFilename = path.resolve(dataTestPath, 'twoAndQuery.json')
const twoOrQueryFilename = path.resolve(dataTestPath, 'twoOrQuery.json')
const complexAndOrQueryFilename = path.resolve(dataTestPath, 'complexAndOrQuery.json')
const objectsFilename = path.resolve(dataTestPath, 'objects.json')

describe('queryParser', function() {
    it('should read, build a transform and push a simple query', function() {
        const filterStream = queryParser(singleQueryFilename)
    })
    it.only('transform of simple query should work', function() {
        const expected = [
            {
                "date": 1245196800,
                "NBCItaxID": 197,
                "speciesName": "Campylobacter jejuni",
                "tiltSingleDual": 1,
                "tiltConstant": 1,
                "microscopist": "Alasdair McDowall",
                "institution": "Caltech",
                "lab": "Jensen Lab",
                "sid": "am2009-06-17-10"
            },
            {
                "date": 1308268800,
                "NBCItaxID": 197,
                "speciesName": "Campylobacter jejuni",
                "tiltSingleDual": 1,
                "tiltConstant": 1,
                "microscopist": "Alasdair McDowall",
                "institution": "Caltech",
                "lab": "Jensen Lab",
                "sid": "am2011-06-17-1"
            }
        ]
        const objectStream = Readable({objectMode: true})
        const objects = require(objectsFilename)
        objects.map((object) => {
            objectStream.push(object)
        })
        objectStream.push(null)
        const filterStream = queryParser(singleQueryFilename)
        const results = []
        objectStream
            .pipe(filterStream)
                .on('data', (chunk) => {
                    results.push(chunk)
                })
                 .on('finish', () => {
                    expect(results.length).eql(expected.length)
                })
    })
    it('transform of simple NOT query should work', function() {
        const expected = [
            {
                "date": 1237939200,
                "NBCItaxID": 80880,
                "speciesName": "Halothiobacillus neapolitanus",
                "tiltSingleDual": 1,
                "tiltConstant": 1,
                "microscopist": "Davi Ortega",
                "institution": "ETDB",
                "lab": "Jensen Lab",
                "sid": "am2009-03-25-16"
            },
            {
                "date": 1132617600,
                "NBCItaxID": 80880,
                "artNotes": "Tilt series notes: H. neapolitanus cell h3 in normal conditions\r\nKeywords: carboxysomes, internal granules\n",
                "speciesName": "Halothiobacillus neapolitanus",
                "strain": "c2",
                "tiltSingleDual": 1,
                "defocus": -11,
                "dosage": 190,
                "tiltConstant": 1,
                "microscopist": "Matt Swulius",
                "institution": "Penn State",
                "lab": "Swulius Lab",
                "sid": "ci2005-11-22-3"
            }
        ]
        const objectStream = Readable({objectMode: true})
        const objects = require(objectsFilename)
        objects.map((object) => {
            objectStream.push(object)
        })
        objectStream.push(null)
        const filterStream = queryParser(notQueryFilename)
        const results = []
        objectStream
            .pipe(filterStream)
                .on('data', (chunk) => {
                    results.push(chunk)
                })
                .on('finish', () => {
                    expect(results).eql(expected)
                })
    })
    it('transform of simple with NOT omitted query should work', function() {
        const expected = [
            {
                "date": 1245196800,
                "NBCItaxID": 197,
                "speciesName": "Campylobacter jejuni",
                "tiltSingleDual": 1,
                "tiltConstant": 1,
                "microscopist": "Alasdair McDowall",
                "institution": "Caltech",
                "lab": "Jensen Lab",
                "sid": "am2009-06-17-10"
            },
            {
                "date": 1308268800,
                "NBCItaxID": 197,
                "speciesName": "Campylobacter jejuni",
                "tiltSingleDual": 1,
                "tiltConstant": 1,
                "microscopist": "Alasdair McDowall",
                "institution": "Caltech",
                "lab": "Jensen Lab",
                "sid": "am2011-06-17-1"
            }
        ]
        const objectStream = Readable({objectMode: true})
        const objects = require(objectsFilename)
        objects.map((object) => {
            objectStream.push(object)
        })
        objectStream.push(null)
        const filterStream = queryParser(notOmittedQueryFilename)
        const results = []
        objectStream
            .pipe(filterStream)
                .on('data', (chunk) => {
                    results.push(chunk)
                })
                .on('finish', () => {
                    expect(results).eql(expected)
                })
    })
    it('transform of two AND queries should work', function() {
        const expected = [
            {
                "date": 1132617600,
                "NBCItaxID": 8080,
                "artNotes": "Tilt series notes: H. neapolitanus cell h3 in normal conditions\r\nKeywords: carboxysomes, internal granules\n",
                "speciesName": "Halothiobacillus neapolitanus",
                "strain": "c2",
                "tiltSingleDual": 1,
                "defocus": -11,
                "dosage": 190,
                "tiltConstant": 1,
                "microscopist": "Matt Swulius",
                "institution": "Caltech",
                "lab": "Jensen Lab",
                "sid": "ci2005-11-22-3"
            },
            {
                "date": 1132617600,
                "NBCItaxID": 80880,
                "artNotes": "Tilt series notes: H. neapolitanus cell h3 in normal conditions\r\nKeywords: carboxysomes, internal granules\n",
                "speciesName": "Halothiobacillus neapolitanus",
                "strain": "c2",
                "tiltSingleDual": 1,
                "defocus": -11,
                "dosage": 190,
                "tiltConstant": 1,
                "microscopist": "Matt Swulius",
                "institution": "Caltech",
                "lab": "Jensen Lab",
                "sid": "ci2005-11-22-3"
            }
        ]
        const objectStream = Readable({objectMode: true})
        const objects = require(objectsFilename)
        objects.map((object) => {
            objectStream.push(object)
        })
        objectStream.push(null)
        const filterStream = queryParser(twoAndQueryFilename)
        const results = []
        objectStream
            .pipe(filterStream)
            .on('data', (chunk) => {
                results.push(chunk)
            })
            .on('finish', () => {
                expect(results).eql(expected)
            })
    })
    it('transform of two OR queries should work', function() {
        const expected = [
            {
                "date": 1245196800,
                "NBCItaxID": 197,
                "speciesName": "Campylobacter jejuni",
                "tiltSingleDual": 1,
                "tiltConstant": 1,
                "microscopist": "Alasdair McDowall",
                "institution": "Caltech",
                "lab": "Jensen Lab",
                "sid": "am2009-06-17-10"
            },
            {
                "date": 1308268800,
                "NBCItaxID": 197,
                "speciesName": "Campylobacter jejuni",
                "tiltSingleDual": 1,
                "tiltConstant": 1,
                "microscopist": "Alasdair McDowall",
                "institution": "Caltech",
                "lab": "Jensen Lab",
                "sid": "am2011-06-17-1"
            },
            {
                "date": 1237939200,
                "NBCItaxID": 80880,
                "speciesName": "Campylobacter jejuni",
                "tiltSingleDual": 1,
                "tiltConstant": 1,
                "microscopist": "Davi Ortega",
                "institution": "ETDB",
                "lab": "Jensen Lab",
                "sid": "am2009-03-25-16"
            }
        ]
        const objectStream = Readable({objectMode: true})
        const objects = require(objectsFilename)
        objects.map((object) => {
            objectStream.push(object)
        })
        objectStream.push(null)
        const filterStream = queryParser(twoOrQueryFilename)
        const results = []
        objectStream
            .pipe(filterStream)
            .on('data', (chunk) => {
                results.push(chunk)
            })
            .on('finish', () => {
                expect(results).eql(expected)
            })
    })
    it.skip('transform of AND + OR queries should work', function() {
        const expected = [
            {
                "date": 1132617600,
                "NBCItaxID": 80880,
                "artNotes": "Tilt series notes: H. neapolitanus cell h1 in normal conditions\r\nKeywords: carboxysomes, internal granules, partial carboxysomes, irregular carboxysome\n",
                "speciesName": "Halothiobacillus neapolitanus",
                "strain": "c2",
                "tiltSingleDual": 1,
                "defocus": -12,
                "dosage": 150,
                "tiltConstant": 1,
                "microscopist": "Cristina Iancu",
                "institution": "Caltech",
                "lab": "Jensen Lab",
                "sid": "ci2005-11-22-1"
            },
            {
                "date": 1132617600,
                "NBCItaxID": 8080,
                "artNotes": "Tilt series notes: H. neapolitanus cell h3 in normal conditions\r\nKeywords: carboxysomes, internal granules\n",
                "speciesName": "Halothiobacillus neapolitanus",
                "strain": "c2",
                "tiltSingleDual": 1,
                "defocus": -11,
                "dosage": 190,
                "tiltConstant": 1,
                "microscopist": "Matt Swulius",
                "institution": "Caltech",
                "lab": "Jensen Lab",
                "sid": "ci2005-11-22-3"
            },
            {
                "date": 1132617600,
                "NBCItaxID": 80880,
                "artNotes": "Tilt series notes: H. neapolitanus cell h3 in normal conditions\r\nKeywords: carboxysomes, internal granules\n",
                "speciesName": "Halothiobacillus neapolitanus",
                "strain": "c2",
                "tiltSingleDual": 1,
                "defocus": -11,
                "dosage": 190,
                "tiltConstant": 1,
                "microscopist": "Matt Swulius",
                "institution": "Caltech",
                "lab": "Jensen Lab",
                "sid": "ci2005-11-22-3"
            },
            {
                "date": 1132617600,
                "NBCItaxID": 80880,
                "artNotes": "Tilt series notes: H. neapolitanus cell h3 in normal conditions\r\nKeywords: carboxysomes, internal granules\n",
                "speciesName": "Halothiobacillus neapolitanus",
                "strain": "c2",
                "tiltSingleDual": 1,
                "defocus": -11,
                "dosage": 190,
                "tiltConstant": 1,
                "microscopist": "Matt Swulius",
                "institution": "Penn State",
                "lab": "Swulius Lab",
                "sid": "ci2005-11-22-3"
            }
        ]
        const objectStream = Readable({objectMode: true})
        const objects = require(objectsFilename)
        objects.map((object) => {
            objectStream.push(object)
        })
        objectStream.push(null)
        const filterStream = queryParser(complexAndOrQueryFilename)
        const results = []
        objectStream
            .pipe(filterStream)
            .on('data', (chunk) => {
                results.push(chunk)
            })
            .on('finish', () => {
                expect(results).eql(expected)
            })
    })
})
