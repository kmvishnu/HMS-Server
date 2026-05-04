const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'docs', 'postman_collection.json');
const data = fs.readFileSync(filePath, 'utf8');
const collection = JSON.parse(data);

// Find the "Auth & Users" folder
const usersFolder = collection.item.find(i => i.name === 'Auth & Users');
if (usersFolder) {
  if (!usersFolder.item.find(i => i.name === 'Refresh Token')) {
    usersFolder.item.push({
      name: "Refresh Token",
      request: {
        method: "POST",
        header: [
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: "{\n  \"refreshToken\": \"{{refreshToken}}\"\n}"
        },
        url: {
          raw: "{{baseUrl}}/auth/refresh",
          host: ["{{baseUrl}}"],
          path: ["auth", "refresh"]
        }
      }
    });
  }
}

fs.writeFileSync(filePath, JSON.stringify(collection, null, 2));
console.log('Postman collection updated successfully with Refresh Token.');
