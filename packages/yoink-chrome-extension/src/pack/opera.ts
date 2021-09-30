// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ChromeExtension from 'crx';
import {existsSync} from 'fs';
import {copy, emptyDir, mkdir, readFile, writeFile} from 'fs-extra';
import {join, resolve} from 'path';

void (async () => {
  const rootDir = resolve(__dirname, '../..');
  const buildDir = join(rootDir, 'build');
  if (!existsSync(buildDir)) await mkdir(buildDir);
  await emptyDir(buildDir);

  await copy(
    join(rootDir, 'manifest-v3.json'),
    join(buildDir, 'manifest.json'),
  );
  await copy(join(rootDir, 'dist'), join(buildDir, 'dist'));
  await copy(join(rootDir, 'images'), join(buildDir, 'images'));

  const crx = new ChromeExtension({
    codebase: 'https://github.com/nmussy/twitch-yoink-extension',
    privateKey: await readFile(join(rootDir, 'key.pem')),
  });

  await crx.load(buildDir);
  const buffer = await crx.pack();
  const updateXML = crx.generateUpdateXML();

  await writeFile(join(buildDir, 'update.xml'), updateXML);
  await writeFile(join(buildDir, 'twitch-yoink-extension-opera.crx'), buffer);
})();
