const queryMap = {
  mostRecent: "&sortBy=DD",
  mostRelevant: "&sortBy=R",
  anyTime: "",
  pastDay: "&f_TPR=r86400",
  pastWeek: "&f_TPR=r604800",
  pastMonth: "&f_TPR=r2592000",
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
  workingStyle: {
    "&f_WT=": {
      onSite: 1,
      remote: 2,
      hybrid: 3,
    },
  },
  jobType: {
    "&f_JT=": {
      fullTime: "F",
      partTime: "P",
      contract: "C",
      internship: "I",
      other: "O",
    },
  },
  easyApply: "&f_LF=f_AL",
  under10Applicants: "f_EA=true",
};
const LINKEDIN_URL = "https://linkedin.com";
const { USER_LOGIN, PASSWORD } = process.env;
const applyLinkedIn = async (browser) => {
  const page = await browser.newPage();

  await page.goto(LINKEDIN_URL);
  await page
    .waitForSelector(".text-input flex", { timeout: 3000 })
    .catch((err) => err);
  await page.type("#session_key", USER_LOGIN, { delay: 100 });
  await page.type("#session_password", PASSWORD, { delay: 100 });
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 2000));

  const URL = buildSearchQuery({ keywords: "node.js " });
  await page.goto(URL);
  await page.waitForNavigation({ timeout: 1000 }).catch((err) => err);

  await matchCompanies(page);
};

const matchCompanies = async (page) => {
  const allJobsForPage = await page.evaluate(() => {
    return document.querySelectorAll(".scaffold-layout__list-container li");
  });
  await allJobsForPage.reduce(async (promiseAcc, li) => {
    const acc = await promiseAcc;
    await li.click();
    await page.waitForTimeout(1000);

    const newText = await page.$eval(".newClass", (el) => el.textContent);
    console.log(`Text content of .newClass after click: ${newText}`);

    return [...acc, newText];
  }, Promise.resolve([]));
};

const buildSearchQuery = ({
  keywords = "",
  experienceLevel = [],
  workingStyle = ["remote"],
  jobType = [],
  easyApply = false,
  under10Applicants = false,
  datePosted = "pastDay",
  sortBy = "mostRecent",
  ignoreCompanies = [],
  distance = 50, // 0, 5, 10, 25, 50, 100
  location = "United States",
} = {}) => {
  const {
    experienceLevel: expLMap,
    jobType: jTMap,
    workingStyle: wSMap,
    easyApply: eAMap,
    under10Applicants: u10Map,
  } = queryMap;

  const newExperienceLevel = reduceQuery(experienceLevel, expLMap);
  const newWorkingStyle = reduceQuery(workingStyle, wSMap);
  const newJobType = reduceQuery(jobType, jTMap);
  const newEasyApply = easyApply ? eAMap : "";
  const newUnder10Applicants = under10Applicants ? u10Map : "";
  const newDatePosted = queryMap[datePosted] || "";
  const newSortBy = queryMap[sortBy] || "";
  const newDistance = `&distance=${distance}`;
  const newLocation = `&location=${location}`;

  const newIgnoreCompanies = ignoreCompanies.reduce(
    (acc, company, index) =>
      `${!index ? "NOT (" : ""}${acc} ${index ? "OR " : ""}${company} ${
        index === ignoreCompanies.length - 1 ? ")" : ""
      }`,
    ""
  );
  const newKeywords = `${keywords} ${newIgnoreCompanies}`.trim();

  return `https://www.linkedin.com/jobs/search/\
?keywords=${newKeywords}${newExperienceLevel}${newWorkingStyle}${newJobType}\
${newEasyApply}${newUnder10Applicants}${newDatePosted}${newSortBy}${newDistance}${newLocation}`;
};

const reduceQuery = (itemArray, map) => {
  const [key] = Object.keys(map);

  return itemArray.reduce((acc, item, index) => {
    if (index === itemArray.length - 1 && map[key][item])
      return `${key}${acc},${map[key][item]}`;

    return map[key][item] ? `${acc}${!index ? "" : ","}${map[key][item]}` : acc;
  }, "");
};

export { applyLinkedIn };
