import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: './schema.prisma',
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL
  },
  // engine: "classic", // optional — default is classic
});
