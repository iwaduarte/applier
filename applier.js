import dotenv from "dotenv";

dotenv.config();
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AnonymizeUA from "puppeteer-extra-plugin-anonymize-ua";
import chromium from "@sparticuz/chromium";

// Add stealth plugin
puppeteer.use(StealthPlugin());
puppeteer.use(AnonymizeUA());

const LINKEDIN_URL = "https://linkedin.com";
const { USER_LOGIN, PASSWORD, IS_LOCAL_DEVELOPMENT, LOCAL_PATH } = process.env;

async function main() {
  const opts =
    IS_LOCAL_DEVELOPMENT === "true"
      ? {
          headless: false,
          executablePath: LOCAL_PATH,
          args: [
            "--disable-web-security",
            "--disable-features=IsolateOrigins,site-per-process",
          ],
        }
      : {
          headless: chromium.headless,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          args: [
            "--disable-web-security",
            "--disable-features=IsolateOrigins,site-per-process",
            // `--disable-extensions-except=${pathToExtension}`,
            // `--load-extension=${pathToExtension}`,
            ...chromium.args,
          ],
        };

  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    ...opts,
  });

  const [page] = await browser.pages();

  await page.goto(LINKEDIN_URL);
  await page.waitForNavigation({ timeout: 1000 }).catch((err) => err);
  await page.type("#session_key", USER_LOGIN, { delay: 100 });
  await page.type("#session_password", PASSWORD, { delay: 100 });
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 2000));
  await page.goto();
  await page.waitForNavigation({ timeout: 1000 }).catch((err) => err);
}

const linkedinConfig = {
  experienceLevel: {
    "&f_E=": {
      internship: "1",
      entryLevel: "2",
      associate: "3",
      midToSenior: "4",
      director: "5",
      executive: "6",
    },
  },
  mostRecent: "&sortBy=DD",
  mostRelevant: "&sortBy=R",
  anyTime: "",
  pastDay: "&f_TPR=r86400",
  pastWeek: "&f_TPR=r604800",
  pastMonth: "&f_TPR=r2592000",
  workingStyle: {
    "&f_WT=": {
      onSite: 1,
      remote: 2,
      hybrid: 3,
    },
  },
  easyApply: "&f_LF=f_AL",
  jobType: {
    "&f_JT=": {},
  },
};

const buildSearchQuery = ({ keywords, location }) => {
  return `https://www.linkedin.com/jobs/search/results/?keywords=${keywords}`;
};

// Run the main function
main().catch(console.error);
