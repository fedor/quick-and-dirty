// https://github.com/fedor/quick-and-dirty
// Copyright (c) 2019 Fedor Korshunov
// MIT License
const md = require('markdown-it')({ html: true, linkify: true })
	.use(require('markdown-it-anchor'), {})
	.use(require('markdown-it-toc-done-right'))
const Mustache = require('mustache')
const fs = require('fs')

const isDevMode = process.argv[2] || 'false'
const templateFile = process.argv[3] || './index.md'
const payloadFile = process.argv[4] || './index.json'
const outputFile = process.argv[5] || './index.html'

const render = () => {
	const input = fs.readFileSync(templateFile, { encoding: 'utf8' })
	const payload = JSON.parse(fs.readFileSync(payloadFile, { encoding: 'utf8' }))
	payload.genAt = new Date().toString()
	let result = Mustache.render(input, payload)
	result = md.render(result)
	fs.writeFileSync(outputFile, result)
	console.log(`[${payload.genAt}] ${outputFile} generated`)
}

const watch = (fileName) => 
	fs.watchFile(fileName, { interval: 1000 }, (curr, prev) => {
		if (curr.mtime !== prev.mtime) {
			render()
		}
	})

render()
if (isDevMode === 'true') {
	watch(templateFile)
	watch(payloadFile)
}