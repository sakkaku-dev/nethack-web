const fs = require('fs');

// Creates the basic layout for web.c and web.js

const WIN_PROCS_FILE = './NetHack/include/winprocs.h';
const OUTPUT_C = './web.c';
const OUTPUT_JS = './web.js';

fs.readFile(WIN_PROCS_FILE, 'utf8', (err, data) => {
	if (err) {
		console.error(err);
		return;
	}

	const idx = data.indexOf('struct window_procs');
	if (idx === -1) {
		console.error('Could not find struct window_procs');
		return;
	}

	const start = data.indexOf('{', idx + 1);
	const end = data.indexOf('}', idx + 1);
	const procs = data.substring(start + 1, end);
	const expectedCount = procs.split('\n').filter(l => l.includes('FDECL') || l.includes('NDECL')).length;

	const normalized = procs
		.replaceAll(/\/\*.*\*\//g, '')
		.replaceAll(/\/\*(.|\n)*\*\//g, ''); // Assuming there is only one multi-line comment
	const actualCount = normalized.match(/FDECL|NDECL/g).length;

	if (expectedCount !== actualCount) {
		console.error('Expected ' + expectedCount + ' functions, but found ' + actualCount);
		return;
	}

	let functionsC = '';
	let contentC = `struct window_procs web_procs = {
\t"web",
\tWC_HILITE_PET | WC_MOUSE_SUPPORT,
\t0L, // wincap2
\t{1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1}, // disable colors?
`;
	let contentJS = 'var LibraryNetHack = {\n';
	contentJS += '\t$nethack_deps: [],\n';
	contentJS += '\t$nethack: {\n';

	let line = '';
	normalized.split('\n').forEach((l) => {
		if (l.startsWith('#ifdef') || l.startsWith('#endif')) {
			contentC += l + '\n';
			functionsC += l + '\n';
			return;
		}

		line += l;
		if (!line.endsWith(';')) {
			return;
		}

		line = line.replaceAll('\n', '').trim();
		if (line.includes('FDECL') || line.includes('NDECL')) {
			const match = line.match(/\(\*(win_[a-z_]+)\)/);
			if (match) {
				const fn = match[1];
				const new_fn = fn.replace('win_', 'web_');
				contentC += '\t' + new_fn + ',\n';

				const nMatch = line.indexOf('NDECL')
				const fMatch = line.indexOf('FDECL')
				let returnType = null;
				if (nMatch !== -1) {
					returnType = line.substring(0, nMatch).trim();
				} else if (fMatch !== -1) {
					returnType = line.substring(0, fMatch).trim();
				}

				if (returnType) {
					if (nMatch !== -1) {
						functionsC += `extern ${returnType} ${new_fn} ();\n`;
						contentJS += `\t${new_fn}: () => {},\n`;
					}
					else if (fMatch !== -1) {
						const paramMatch = line.match(/,.*\((.*)\)\);/);
						if (paramMatch) {
							let varName = 'a'.charCodeAt(0);
							const param = paramMatch[1].split(',');
							const paramLine = param.map(p => p.trim() + ' ' + String.fromCharCode(varName++)).join(', ');
							functionsC += `extern ${returnType} ${new_fn}(${paramLine}); \n`;

							varName = 'a'.charCodeAt(0);
							const paramJS = param.map(p => String.fromCharCode(varName++)).join(', ');
							contentJS += `\t${new_fn}: (${paramJS}) => {},\n`;
						} else {
							console.warn('Could not find params for ' + fn);
						}
					}
				}
			}
		}

		line = '';
	});

	contentC += '};';
	contentJS += '\t},\n';
	contentJS += '};\n';
	contentJS += `autoAddDeps(LibraryNetHack, '$nethack');\n`;
	contentJS += 'mergeInto(LibraryManager.library, LibraryNetHack);';

	includes = '#include "hack.h"\n#include <emscripten/emscripten.h>\n\n';
	fs.writeFile(OUTPUT_C, `${includes}${functionsC}\n\n${contentC}`, (err) => {
		if (err) {
			console.error(err);
			return;
		}
		console.log('Created ' + OUTPUT_C);
	});

	fs.writeFile(OUTPUT_JS, contentJS, (err) => {
		if (err) {
			console.error(err);
			return;
		}
		console.log('Created ' + OUTPUT_JS);
	});
});