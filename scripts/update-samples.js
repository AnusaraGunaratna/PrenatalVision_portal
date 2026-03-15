import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLES_DIR = path.join(__dirname, '../public/assets/samples');
const MANIFEST_PATH = path.join(SAMPLES_DIR, 'manifest.json');

const getSamples = (category) => {
    const dirPath = path.join(SAMPLES_DIR, category);
    if (!fs.existsSync(dirPath)) return [];

    return fs.readdirSync(dirPath)
        .filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file))
        .map(file => ({
            id: `${category}-${file}`,
            name: file.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            fileName: file,
            url: `/assets/samples/${category}/${file}`,
            type: category
        }));
};

const main = () => {
    console.log('Scanning for sample images...');
    
    const crlSamples = getSamples('crl');
    const ntSamples = getSamples('nt');
    
    const manifest = {
        updatedAt: new Date().toISOString(),
        samples: [...crlSamples, ...ntSamples]
    };

    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    
    console.log(`Manifest updated! Found ${crlSamples.length} CRL samples and ${ntSamples.length} NT samples.`);
    console.log(`Saved to: ${MANIFEST_PATH}`);
};

main();
