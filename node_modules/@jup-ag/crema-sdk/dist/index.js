
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./crema-sdk.cjs.production.min.js')
} else {
  module.exports = require('./crema-sdk.cjs.development.js')
}
