import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { keyword, location } = req.query;
    const baseUrl = "https://www.careerjet.co.in/search/jobs";
    
    const params = new URLSearchParams({
      s: (keyword as string)?.toLowerCase().replace(/ /g, "+") || '',
      l: (location as string)?.toLowerCase() || '',
      sort: 'date'
    });

    const response = await axios.get(`${baseUrl}?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      }
    });

    const $ = cheerio.load(response.data);
    const jobs = [];

    $("article.job.clicky").each((_, element) => {
      const titleElement = $(element).find("h2 a");
      const title = titleElement.text().trim();
      const company = $(element).find("p.company").text().trim();
      const location = $(element).find("ul.location li").text().trim();
      const url = titleElement.attr("href");
      const description = $(element).find("div.desc").text().trim();

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

    res.status(200).json(jobs);
  } catch (error) {
    console.error('CareerJet API error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch CareerJet jobs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}