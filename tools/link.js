const fs = require('fs');
const path = require('path');

// Methods of NetHackGodot
// TODO: check if possible to extract from interface
const methods = [
  "openMenuAny",
  "openMenuOne",
  "openDialog",
  "openQuestion",

  "moveCursor",
  "centerView",
  "printLine",

  "updateMap",
  "updateStatus",
  "updateInventory",
];

let content = "# This is generated. Do not edit"
content += "class_name NetHackLink\n\n";

methods.forEach((m) => {
  content += `var ${m}\n`;
});

content += "\nfunc init(cb):\n";
content += '\tvar obj = JavaScriptBridge.create_object("Object")\n';

methods.forEach((m) => {
  console.log('Generate link for', m);
  content += `\t${m} = JavaScriptBridge.create_callback(cb.${m})\n`;
  content += `\tobj.${m} = ${m}\n\n`;
});

content += '\treturn obj'

const out = path.join(__dirname, "../src/link.gd");
fs.writeFile(out, content, (err) => {
  console.error(err);
});
