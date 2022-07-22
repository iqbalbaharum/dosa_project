import { justStop, runServer } from '../main';
import { newNftMetadata } from '../_aqua/metadata';

describe('smoke test', () => {
    it('should work', async () => {
        try {
            await runServer();

            const res = await newNftMetadata();

            console.log(res);

            expect(res);
        } finally {
            await justStop();
        }
    }, 15000);
});
