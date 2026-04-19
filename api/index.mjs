// Vercel serverless function — loads Angular SSR handler from the build output
import { reqHandler } from '../dist/apps/web/server/server.mjs';
export default reqHandler;
