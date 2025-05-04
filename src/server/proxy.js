import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import * as cheerio from 'cheerio';

const app = express();
const port = 3001;

app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'], // Update origins
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

app.get('/api/careerjet', async (req, res) => {
  try {
    const { keyword = '', location = '' } = req.query;
    const url = `https://www.careerjet.co.in/search/jobs?s=${encodeURIComponent(keyword)}&l=${encodeURIComponent(location)}&sort=date`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const jobs = [];
    $("article.job.clicky").each((_, element) => {
      const titleElement = $(element).find("h2 a");
      const title = titleElement.text().trim();
      const company = $(element).find("p.company").text().trim();
      const location = $(element).find("ul.location li").text().trim();
      const description = $(element).find("div.desc").text().trim();
      const url = titleElement.attr("href");

      if (title) {
        jobs.push({
          Title: title,
          Company: company || 'N/A',
          Location: location || 'N/A',
          Description: description || 'N/A',
          JobLink: url?.startsWith("http") ? url : `https://www.careerjet.co.in${url}`,
          TimePosted: new Date().toISOString()
        });
      }
    });

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});