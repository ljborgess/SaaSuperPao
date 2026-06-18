require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })
module.exports = require('./dist/mikro-orm.config').default
