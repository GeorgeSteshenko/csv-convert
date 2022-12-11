const fs = require("fs");
const path = require("path");

const csv = fs.readFileSync("data/translates.csv");

const data = csv.toString().split("\r\n");
const firstRow = data[2].split(",");

const langOrder = firstRow.slice(2);
const i18n = new Array(langOrder.length).fill(1).map((e) => ({}));

for (let i = 3; i < data.length; i++) {
  //   const columns = data[i].split(",");
  const columns = data[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  columns.splice(1, 1);

  const key = columns[0];

  if (!key || key === "") continue;

  for (let i = 1, i18nObj, translation; i < columns.length; i++) {
    // key.replace(/["]+/g, "");
    i18nObj = i18n[i - 1];
    translation = columns[i];
    // translation.replace(/\\"/g, "");

    if (translation === "") continue;

    i18nObj[key] = translation.trim();
  }
}

function writeFilePromise(contents, filePath) {
  return new Promise((resolve) => {
    fs.writeFile(filePath, contents, { encoding: "utf8" }, resolve);
  });
}

const writePromises = [];

langOrder.forEach((languageName, index) => {
  const filename = languageName + ".js";
  const filePath = path.join(__dirname, "./output", filename);
  const fileContent = "export default " + JSON.stringify(i18n[index], null, 2);

  writePromises.push(writeFilePromise(fileContent, filePath));
});

Promise.all(writePromises).then(() => {
  console.log("All done!");
});
