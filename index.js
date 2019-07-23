// https://github.com/fedor/quick-and-dirty
// Copyright (c) 2019 Fedor Korshunov
// MIT License
const md = require('markdown-it')({ html: true, linkify: true })
	.use(require('markdown-it-anchor'), {})
	.use(require('markdown-it-toc-done-right'))
const Mustache = require('mustache')
const fs = require('fs')
const path = require('path')

const preset = require(process.argv[2])
const presetPath = path.dirname(process.argv[2])
const isDevMode = process.argv[3] !== undefined ? process.argv[3] : 'false'

const readFile = (fileName) => fs.readFileSync(presetPath + '/' + fileName, { encoding: 'utf8' })
const render = () => {
	for (let i = 0; i < preset.length; i++) {
		const pagePreset = Object.assign({}, preset[i])
		
		// load "file*" content to preset
		const pagePresetKeys = Object.keys(pagePreset)
		for (let j = 0; j < pagePresetKeys.length; j++) {
			const key = pagePresetKeys[j]
			if (key.startsWith('file')) {
				pagePreset[key] = Mustache.render(readFile(pagePreset[key]), pagePreset)
			}
		}

		pagePreset.genAt = new Date().toString()
		const input  = readFile(pagePreset.input)
		const tmp = Mustache.render(input, pagePreset)
		const output = md.render(tmp)
		fs.writeFileSync(presetPath + '/' + pagePreset.output, output)
		console.log(`[${pagePreset.genAt}] ${pagePreset.output} generated`)
	}
}

const watchList = []
const watch = (fileName) => {
	if (watchList.includes(fileName)) {
		return
	}

	watchList.push(fileName)
	fs.watchFile(presetPath + '/' + fileName, { interval: 1000 }, (curr, prev) => {
		if (curr.mtime !== prev.mtime) {
			render()
		}
	})

	console.log(`Watch ${fileName}`)
}

if (isDevMode === 'true') {
	for (let i = 0; i < preset.length; i++) {
		const pagePreset = preset[i]

		// load "file*"
		const pagePresetKeys = Object.keys(pagePreset)
		for (let j = 0; j < pagePresetKeys.length; j++) {
			const key = pagePresetKeys[j]
			if (key.startsWith('file')) {
				watch(pagePreset[key])
			}
		}

		watch(pagePreset.input)
	}
}

render()