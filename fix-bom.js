const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\ragha\\Downloads\\NEXVIA_final\\src\\app\\applications\\applications-client.tsx', 'utf8');
const fixed = content.replace(/^"use client";/, '"use client"');
fs.writeFileSync('C:\\Users\\ragha\\Downloads\\NEXVIA_final\\src\\app\\applications\\applications-client.tsx', fixed, 'utf8');
console.log('Fixed');