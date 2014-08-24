#!/usr/bin/env node

var options = require('minimist')(process.argv.slice(2)),
    kgo = require('kgo'),
    config = options.c || options.config ||  options._[0],
    output = options.o || options.output || options._[1],
    fontPath = options.f || options.fontPath || options._[2],
    path = require('path'),
    fs = require('fs');

function getFonts(){
    return fs.readdirSync(fontPath);
}

function fontSrcStatement(result, statement, index, fontSrc) {
    return result + 
        'url(\'' + statement.url + '\') ' + 
        'format(\'' + statement.format + '\')' + 
        (index === fontSrc.length-1 ? ';' : ', ');
}

function renderFontSrc(fontSrc) {
    return fontSrc.reduce(fontSrcStatement, '');
}

function createFontSrc() {
    var fontSrc = [];
    var fonts = getFonts();
    for (var i=0; i < fonts.length; i++) {
        fontSrc.push({
            url: fontPath + fonts[i],
            format: path.extname(fonts[i]).slice(1)
        });
    }
    return fontSrc;
}

function renderFontFaces(fontFaces){
    return '@font-face {\n'+
                renderFontSrc(createFontSrc()) + '\n' +
            '    font-weight: normal + \n' +
            '    font-style: normal;\n' +
            '}';
}

function renderCharCode(result, charCode) {
    return result + path.basename(charCode.file) + ' = ' + charCode.unicode + ';\n';
}


function renderCharCodes(charmap) {
    return charmap.reduce(renderCharCode, '');
}

function renderMixings() {
    return '' +
        'icon(icon) {\n' +
        '    iconStyle();\n' +
        '    content: icon;\n' +
        '}';
}

function renderIconStyle(fontFamily) {
    return 'iconStyle(){\n'+
        '    font-family: \'' + fontFamily + '\' !important;\n' +
        '    font-style: normal !important;\n' +
        '    font-weight: normal !important;\n' +
        '    font-variant: normal !important;\n' +
        '    text-transform: none !important;\n' +
        '    speak: none;\n' +
        '    line-height: 1;\n' +
        '    -webkit-font-smoothing: antialiased;\n' +
        '    -moz-osx-font-smoothing: grayscale;\n' +
    '}';
}

function render(config) {
    var result = '';

    result += renderFontFaces();

    result += '\n\n';

    result += renderCharCodes(config.charmap);

    result += '\n\n';

    result += renderIconStyle(config.id);

    result += '\n\n';

    result += renderMixings();

    return result;
}

kgo
('config', function(done) {
    fs.readFile(config, done);
})
('rendered', ['config'], function(config, done) {
    done(null, render(JSON.parse(config.toString())));
})
(['rendered'], function(rendered, done){
    fs.writeFile(output, rendered, done);
});
