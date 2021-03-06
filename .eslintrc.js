module.exports = {
	"extends": "plugin:@wordpress/eslint-plugin/recommended",
	"root": true,
	"env": {
		"browser": true,
		"node": true,
		"es6": true
	},
	"globals": {
		"jQuery": "readonly",
		"wp": "readonly",
		"twsCodegarage": "readonly"
	},
	"rules": {
		"no-unused-vars": "off",
		"no-console": "off"
	}
}
