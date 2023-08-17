import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import figlet from 'figlet';

const program = new Command();

console.log(figlet.textSync('Merkle Tree'));

program
  .version('1.0.0')
  .description('An example CLI for merkle tree managing a directory')
  .option('-l, --ls  [value]', 'List directory contents')
  .option('-m, --mkdir <value>', 'Create a directory')
  .option('-t, --touch <value>', 'Create a file')
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

// create the following function
function createFile(filepath: string) {
  fs.openSync(filepath, 'w');
  console.log('An empty file has been created');
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
// // (1)
// const values = [
//   ['0x1111111111111111111111111111111111111111', '5000000000000000000'],
//   ['0x2222222222222222222222222222222222222222', '2500000000000000000'],
// ];

// // (2)
// const tree = StandardMerkleTree.of(values, ['address', 'uint256']);

// // (3)
// console.log('Merkle Root:', tree.root);

// // (4)
// fs.writeFileSync('tree.json', JSON.stringify(tree.dump()));
