#!/usr/bin/env node

var options = require('minimist')(process.argv.slice(2)),
    kgo = require('kgo'),
    fontPath = options.f || options.fontPath || options._[0],
    output = options.o || options.output || options._[1],
    config = options.c || options.config ||  options._[2],
    buildPath = options.b || options.buildPath || options._[3],
    path = require('path'),
    glob = require('glob'),
    fs = require('fs');

function getFonts(fontFamily){
    var fonts = [];
    glob(fontPath + '/' + fontFamily + '.*', {sync:true}, function(error, files) {
        fonts = files;
    });
    return fonts;
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

function createFontSrc(fontFamily) {
    var fontSrc = [];
    var fonts = getFonts(fontFamily);
    for (var i=0; i < fonts.length; i++) {
        fontSrc.push({
            url: path.relative(buildPath, fontPath) + '/' + path.basename(fonts[i]),
            format: path.extname(fonts[i]).slice(1)
        });
    }
    return fontSrc;
}

function renderFontFaces(fontFamily){
    return '@font-face {\n' +
            '    font-family: \'' + fontFamily + '\';\n' +
            '    src: ' + renderFontSrc(createFontSrc(fontFamily)) + '\n' +
            '    font-weight: normal;\n' +
            '    font-style: normal;\n' +
            '}';
}

function renderCharCode(result, charCode) {
    return result + charCode.file.slice(0, -4) + ' = "' + charCode.unicode + '";\n';
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

    result += renderFontFaces(config.id);

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
