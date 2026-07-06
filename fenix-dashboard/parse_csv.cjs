const fs = require('fs');

const csv = fs.readFileSync('Conversation traffic-report-04-07-2026.csv', 'utf-8');
const lines = csv.trim().split('\n');

const dates = lines[3].split(',').slice(1);
const counts = new Array(dates.length).fill(0);

for (let i = 4; i < lines.length; i++) {
  const row = lines[i].split(',').slice(1);
  for (let j = 0; j < row.length; j++) {
    counts[j] += parseInt(row[j] || 0, 10);
  }
}

const result = {};
for (let i = 0; i < dates.length; i++) {
  result[dates[i].trim()] = counts[i];
}

console.log(JSON.stringify(result, null, 2));
