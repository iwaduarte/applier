import dotenv from "dotenv";
dotenv.config();
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AnonymizeUA from "puppeteer-extra-plugin-anonymize-ua";
import chromium from "@sparticuz/chromium";
import { applyLinkedIn } from "./linkedin.js";

// Add stealth plugin
puppeteer.use(StealthPlugin());
puppeteer.use(AnonymizeUA());

const { IS_LOCAL_DEVELOPMENT, LOCAL_PATH } = process.env;

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

  await applyLinkedIn(browser);
}

// Run the main function
main().catch(console.error);
