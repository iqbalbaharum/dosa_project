import { runServer, waitForKeypressAndStop } from './src/main';
import dotenv from 'dotenv';

dotenv.config();

runServer().then(waitForKeypressAndStop);
