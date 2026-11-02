const fs = require('fs');
let code = fs.readFileSync('scripts/pptx_gen/generate_deck.js', 'utf8');

code = code.split('pres.ShapeType.roundRect').join("'roundRect'");
code = code.split('pres.ShapeType.line').join("'line'");
code = code.split('pres.ShapeType.oval').join("'ellipse'");
code = code.split('pres.ShapeType.rect').join("'rect'");

fs.writeFileSync('scripts/pptx_gen/generate_deck.js', code, 'utf8');
console.log('SUCCESS: All shape references updated to string identifiers.');
