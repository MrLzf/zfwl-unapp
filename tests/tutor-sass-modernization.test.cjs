const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const scanRoots = ['App.vue', 'uni.scss', 'sheep'];
const extensions = new Set(['.scss', '.vue']);
const deprecatedPatterns = [
  {
    label: 'Sass @import',
    pattern: /^\s*@import\s+['"][^'"]+['"]\s*;/gm,
  },
  {
    label: 'global Sass map functions',
    pattern: /\bmap-(?:merge|get|has-key)\s*\(/g,
  },
  {
    label: 'global Sass collection functions',
    pattern: /(?<![\w.-])(?:type-of|nth|zip|append)\s*\(/g,
  },
  {
    label: 'deprecated Sass desaturate',
    pattern: /\bdesaturate\s*\(/g,
  },
  {
    label: 'deprecated Sass if()',
    pattern: /\bif\s*\(/g,
  },
];

function collectFiles(entry) {
  const absolute = path.join(projectRoot, entry);
  const stat = fs.statSync(absolute);

  if (stat.isFile()) {
    return extensions.has(path.extname(absolute)) ? [absolute] : [];
  }

  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((dirent) => {
    const child = path.join(entry, dirent.name);
    return collectFiles(child);
  });
}

function lineNumberFor(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

function scssSourcesFor(file) {
  const source = fs.readFileSync(file, 'utf8');

  if (path.extname(file) === '.scss') {
    return [{ source, offset: 0 }];
  }

  return [...source.matchAll(/<style\b[^>]*lang=["']scss["'][^>]*>([\s\S]*?)<\/style>/gi)].map(
    (match) => ({
      source: match[1],
      offset: lineNumberFor(source, match.index + match[0].indexOf(match[1])) - 1,
    }),
  );
}

const findings = [];

for (const file of scanRoots.flatMap(collectFiles)) {
  const relativeFile = path.relative(projectRoot, file);

  for (const scssSource of scssSourcesFor(file)) {
    for (const deprecated of deprecatedPatterns) {
      deprecated.pattern.lastIndex = 0;
      for (const match of scssSource.source.matchAll(deprecated.pattern)) {
        findings.push(
          `${relativeFile}:${scssSource.offset + lineNumberFor(scssSource.source, match.index)} uses ${
            deprecated.label
          }`,
        );
      }
    }
  }
}

if (findings.length > 0) {
  console.error('Deprecated Sass syntax found:');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}
