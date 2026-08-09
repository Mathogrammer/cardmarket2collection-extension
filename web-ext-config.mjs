import path from 'node:path';
import { pathToFileURL } from 'node:url';

export default {
    run: {
        startUrl: [pathToFileURL(path.resolve('test/SamplePurchaseCardmarket.htm')).href],
    },
    sourceDir: "./dist/",
};