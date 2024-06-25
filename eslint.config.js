// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
	stylistic: {
		quotes: 'single',
		indent: 'tab',
	},
	rules: {
		'style/brace-style': 'off',
		'node/prefer-global/process': 'off',
		'no-console': 'off',
	},
})
