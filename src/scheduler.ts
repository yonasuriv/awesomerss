import { CronJob } from 'cron';
import fs from 'fs';
import { fetchData } from './main';

const urls = [
  // TO-DO: ADD Fetch URLs

const job = new CronJob('0 */6 * * *', async () => {
  for (const url of urls) {
    const data = await fetchData(url);
    if (data) {
      fs.writeFileSync(`./data/${new URL(url).hostname}.xml`, data);
    }
  }
});

job.start();
