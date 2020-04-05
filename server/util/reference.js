const fs = require('fs')

const routeCodes = JSON.parse(fs.readFileSync('./static-data/routecodes.json'))

module.exports = {
    routeCodes
}