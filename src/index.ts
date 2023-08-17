#! /usr/bin/env node
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import figlet from 'figlet';
import readXlsxFile from 'read-excel-file/node';

const program = new Command();

console.log(figlet.textSync('Merkle Tree'));

program
  .version('1.0.0')
  .description('An example CLI for merkle tree managing a directory')
  .option('-l, --ls  [value]', 'List directory contents')
  .option('-m, --mkdir <value>', 'Create a directory')
  .option('-t, --touch <value>', 'Create a merkle-tree json file')
  .parse(process.argv);

const options = program.opts();

async function listDirContents(filepath: string) {
  try {
    const files = await fs.promises.readdir(filepath);
    const detailedFilesPromises = files.map(async (file: string) => {
      let fileDetails = await fs.promises.lstat(path.resolve(filepath, file));
      const { size, birthtime } = fileDetails;
      return { filename: file, 'size(KB)': size, created_at: birthtime };
    });

    const detailedFiles = await Promise.all(detailedFilesPromises);
    console.table(detailedFiles);
  } catch (error) {
    console.error('Error occurred while reading the directory!', error);
  }
}

// create the following function
function createDir(filepath: string) {
  if (!fs.existsSync(filepath)) {
    fs.mkdirSync(filepath);
    console.log('The directory has been created successfully');
  }
}

async function createFile(filepath: string) {
  try {
    readXlsxFile(filepath).then((rows) => {
      if (rows[0][0] !== 'address' || rows[0][1] !== 'amount') {
        console.error('間違った形式です！');
        return false;
      }

      const values = rows.filter((el, index) => index !== 0);

      const tree = StandardMerkleTree.of(values, ['address', 'uint256']);

      fs.writeFileSync('treeRoot.txt', tree.root);
      fs.writeFileSync('tree.json', JSON.stringify(tree.dump()));

      console.log('Allow List is?\n', values);
      console.log('\n************************************************\n');
      console.log('Merkle Root:\n', tree.root);
      console.log(
        '\nThe merkle tree root text file has been created successfully! (treeRoot.txt)'
      );
      console.log(
        '\nThe merkle tree json file has been created successfully!!(tree.json)\n'
      );
      console.log('************************************************');
    });
  } catch (error) {
    console.error('This is not correct path or file(.xlsx)');
  }
}

if (options.ls) {
  const filepath = typeof options.ls === 'string' ? options.ls : __dirname;
  listDirContents(filepath);
}

if (options.mkdir) {
  createDir(path.resolve(__dirname, options.mkdir));
}
if (options.touch) {
  createFile(path.resolve(__dirname, options.touch));
}
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
