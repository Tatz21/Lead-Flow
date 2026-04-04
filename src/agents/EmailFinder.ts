import puppeteer from 'puppeteer';

export class EmailFinder {
  async find(website: string) {
    if (!website.startsWith('http')) {
      website = `https://${website}`;
    }

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.goto(website, { waitUntil: 'networkidle2', timeout: 30000 });

      const content = await page.content();
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = Array.from(new Set(content.match(emailRegex) || []));

      return emails.filter((e: any) => typeof e === 'string' && !e.endsWith('.png') && !e.endsWith('.jpg'));
    } catch (error) {
      console.error(`Error scraping ${website}:`, error);
      return [];
    } finally {
      if (browser) await browser.close();
    }
  }
}
