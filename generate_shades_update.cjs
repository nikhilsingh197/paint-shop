const fs = require('fs');

const csvPath = 'C:\\Users\\singh\\.gemini\\antigravity\\brain\\57b0c40e-e627-4bd4-b5da-0cea6fc691e8\\.user_uploaded\\media_1790071585533.csv';

const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n');

let sqlOutput = `-- Auto-generated SQL script to update color_family and decrease tinting charges by 20%\n`;
sqlOutput += `BEGIN;\n`;

let updatedCount = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const parts = line.split(',');
  if (parts.length < 6) continue;

  const tintingChargeRaw = parts.pop();
  const hexCode = parts.pop();
  const shadeCode = parts.pop();
  
  // Combine all remaining parts as brand, family, name in case of extra commas.
  // Actually, standard is brand_name,color_family,shade_name
  // We can just take the first two.
  const brandName = parts[0];
  const colorFamily = parts[1];
  
  const tintingCharge = parseFloat(tintingChargeRaw);
  if (isNaN(tintingCharge)) continue;
  
  const newTintingCharge = (tintingCharge * 0.8).toFixed(2);
  
  const safeColorFamily = colorFamily.replace(/'/g, "''");
  const safeShadeCode = shadeCode.replace(/'/g, "''");
  
  sqlOutput += `UPDATE shades SET color_family = '${safeColorFamily}', tinting_charge = ${newTintingCharge} WHERE shade_code = '${safeShadeCode}';\n`;
  updatedCount++;
}

sqlOutput += `COMMIT;\n`;

fs.writeFileSync('c:/Users/singh/Downloads/paint-shop-main/paint-shop-main/update_shades.sql', sqlOutput);
console.log(`Successfully generated update_shades.sql with ${updatedCount} statements.`);
