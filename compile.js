// compile.js
const bytenode = require('bytenode');
const path = require('path');

// قم بتغيير main.js لمسار ملفك الفعلي
bytenode.compileFile({
    filename: path.join(__dirname, 'main.js'),
    output: path.join(__dirname, 'main.jsc'),
});

console.log('Done compiling!');