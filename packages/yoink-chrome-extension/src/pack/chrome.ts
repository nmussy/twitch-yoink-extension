import AdmZip from 'adm-zip';
import {existsSync} from 'fs';
import {copy, emptyDir, mkdir} from 'fs-extra';
import {join, resolve} from 'path';

void (async () => {
  const zip = new AdmZip();
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

  zip.addLocalFolder(buildDir);
  zip.writeZip(join(rootDir, 'twitch-yoink-extension-chrome.zip'));
})();
