import axios from 'axios';
import * as cheerio from 'cheerio';

interface CareerjetJob {
  Title: string;
  Company: string;
  Location: string;
  Description: string;
  JobLink: string;
  TimePosted: string;
}

function generateCareerjetUrl(keyword = "", location = "", radius = "10") {
  const baseUrl = "https://www.careerjet.co.in/jobs?";
  keyword = keyword.toLowerCase().replace(/ /g, "+");
  location = location.toLowerCase();
  
  const params = new URLSearchParams({
    s: keyword,
    l: location,
    radius: radius,
    sort: 'date'
  });
  
  return baseUrl + params.toString();
}

export async function fetchCareerjetJobs(params: {
  keyword: string;
  location: string;
  radius?: string;
}): Promise<CareerjetJob[]> {
  try {
    const targetUrl = generateCareerjetUrl(
      params.keyword, 
      params.location, 
      params.radius
    );

    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const jobs: CareerjetJob[] = [];

    $('article.job.clicky').each((_, element) => {
      const titleElement = $(element).find('h2 a');
      const title = titleElement.text().trim();
      const company = $(element).find('p.company').text().trim();
      const location = $(element).find('ul.location li').text().trim();
      const description = $(element).find('div.desc').text().trim();
      const url = titleElement.attr('href');
      const posted = $(element).find('time').attr('datetime');

      if (title && url) {
        jobs.push({
          Title: title,
          Company: company || 'N/A',
          Location: location || 'N/A',
          Description: description || 'N/A',
          JobLink: url.startsWith('http') ? url : `https://www.careerjet.co.in${url}`,
          TimePosted: posted || 'Recent'
        });
      }
    });

    return jobs;
  } catch (error) {
    console.error('Error fetching CareerJet jobs:', error);
    return [];
  }
}