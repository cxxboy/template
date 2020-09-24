module.exports = {
    plugins: [require('autoprefixer')({
        overrideBrowserslist: ['last 2 version', '>1%', 'ios 7', "not ie <= 8"]
    })
    ]
}