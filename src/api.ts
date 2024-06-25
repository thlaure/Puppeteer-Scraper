import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

import scraperRoute from './routes/scraper';

dotenv.config();
const app = express();

app.get('/', (request: Request, response: Response) => { 
  response.status(200).send('Hello World');
});

app.use('/scraper', scraperRoute);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => { 
  console.log('Server running at PORT: ', PORT); 
}).on('error', (error) => {
  throw new Error(error.message);
});
