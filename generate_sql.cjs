const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\singh\\.gemini\\antigravity\\brain\\57b0c40e-e627-4bd4-b5da-0cea6fc691e8\\.system_generated\\logs\\transcript_full.jsonl';
const fallbackLogPath = 'C:\\Users\\singh\\.gemini\\antigravity\\brain\\57b0c40e-e627-4bd4-b5da-0cea6fc691e8\\.system_generated\\logs\\transcript.jsonl';

let content = '';
try {
  content = fs.readFileSync(logPath, 'utf8');
} catch (e) {
  content = fs.readFileSync(fallbackLogPath, 'utf8');
}

const lines = content.split('\n');
let csvData = null;

for (let i = lines.length - 1; i >= 0; i--) {
  if (!lines[i].trim()) continue;
  const entry = JSON.parse(lines[i]);
  if (entry.source === 'USER_EXPLICIT' && entry.content.includes('brand_name,color_family,shade_name')) {
    const text = entry.content;
    const startIndex = text.indexOf('brand_name,color_family,shade_name');
    csvData = text.substring(startIndex);
    break;
  }
}

if (!csvData) {
  console.error("Could not find CSV data in transcript");
  process.exit(1);
}

const csvLines = csvData.split('\n');
let sqlOutput = `-- Auto-generated SQL script to update color_family and decrease tinting charges by 20%\n`;
sqlOutput += `BEGIN;\n`;

for (let i = 1; i < csvLines.length; i++) {
  const line = csvLines[i].trim();
  if (!line) continue;
  
  // brand_name,color_family,shade_name,shade_code,hex_code,tinting_charge
  // Since some fields might have commas (like "whites,off whites"), we need to carefully split
  // Actually, looking at the data, fields are comma separated without quotes in this dataset.
  // Wait, let's split by comma from the end because tinting_charge, hex_code, shade_code are at the end.
  const parts = line.split(',');
  if (parts.length < 6) continue;
  
  const tintingChargeRaw = parts.pop();
  const hexCode = parts.pop();
  const shadeCode = parts.pop();
  
  // Re-join the rest just in case shade_name has commas, though unlikely.
  // Let's assume standard splitting works for the first two.
  const brandName = parts[0];
  const colorFamily = parts[1];
  
  const tintingCharge = parseFloat(tintingChargeRaw);
  if (isNaN(tintingCharge)) continue;
  
  const newTintingCharge = (tintingCharge * 0.8).toFixed(2);
  
  // Escape single quotes in color family if necessary
  const safeColorFamily = colorFamily.replace(/'/g, "''");
  const safeShadeCode = shadeCode.replace(/'/g, "''");
  
  sqlOutput += `UPDATE shades SET color_family = '${safeColorFamily}', tinting_charge = ${newTintingCharge} WHERE shade_code = '${safeShadeCode}';\n`;
}

sqlOutput += `COMMIT;\n`;

fs.writeFileSync('c:/Users/singh/Downloads/paint-shop-main/paint-shop-main/update_shades_20_percent.sql', sqlOutput);
console.log("Successfully generated update_shades_20_percent.sql");
