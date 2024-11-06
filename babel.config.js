module.exports = {
    presets: [
        "react-app",                                    // react的智能预设，可以编译jsx的语法
        "@babel/preset-typescript"
    ],
    plugins: [
        [
            'import',
            {
                libraryName: 'antd',
                libraryDirectory: 'es',
                style: true
            }
        ]
    ]
}