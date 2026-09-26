import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const sourceDir = process.argv[2];
if (!sourceDir) throw new Error("Pass the extracted GeoNames directory as the first argument.");

const [placesText, admin1Text, admin2Text] = await Promise.all([
  readFile(join(sourceDir, "LB.txt"), "utf8"),
  readFile(join(sourceDir, "admin1CodesASCII.txt"), "utf8"),
  readFile(join(sourceDir, "admin2Codes.txt"), "utf8"),
]);

const admin1 = new Map(admin1Text.trim().split(/\r?\n/).map((line) => {
  const [code, name, asciiName] = line.split("\t");
  return [code, asciiName || name];
}));
const admin2 = new Map(admin2Text.trim().split(/\r?\n/).map((line) => {
  const [code, name, asciiName] = line.split("\t");
  return [code, asciiName || name];
}));
const governorateKeys = {
  "04": "beirut",
  "05": "mount_lebanon",
  "06": "south_lebanon",
  "07": "nabatieh",
  "08": "bekaa",
  "09": "north_lebanon",
  "10": "akkar",
  "11": "baalbek_hermel",
};

const excludedHistoricCodes = new Set(["PPLCH", "PPLH", "PPLQ", "PPLW"]);
const places = placesText.trim().split(/\r?\n/).map((line) => line.split("\t")).filter((fields) => fields[6] === "P" && !excludedHistoricCodes.has(fields[7])).map((fields) => {
  const [id, name, asciiName, alternateNames, latitude, longitude, , featureCode, , , admin1Code, admin2Code, , , population] = fields;
  const names = [...new Set([name, asciiName, ...alternateNames.split(",")].map((value) => value.trim()).filter(Boolean))];
  return {
    id: Number(id),
    name,
    asciiName,
    names,
    lat: Number(latitude),
    lng: Number(longitude),
    featureCode,
    governorate: admin1.get(`LB.${admin1Code}`) || "Lebanon",
    district: admin2Code ? (admin2.get(`LB.${admin1Code}.${admin2Code}`) || "") : "",
    governorateKey: governorateKeys[admin1Code] || null,
    population: Number(population) || 0,
  };
}).sort((a, b) => b.population - a.population || a.name.localeCompare(b.name));

await mkdir(join(process.cwd(), "public", "data"), { recursive: true });
await writeFile(join(process.cwd(), "public", "data", "lebanon-places.json"), `${JSON.stringify({ source: "GeoNames Lebanon country extract", license: "CC BY 4.0", generatedAt: new Date().toISOString().slice(0, 10), places })}\n`, "utf8");
console.log(`Wrote ${places.length} populated places.`);
