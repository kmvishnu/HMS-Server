const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'docs', 'postman_collection.json');
const data = fs.readFileSync(filePath, 'utf8');
const collection = JSON.parse(data);

// Find the "Auth & Users" folder
const usersFolder = collection.item.find(i => i.name === 'Auth & Users');
if (usersFolder) {
  if (!usersFolder.item.find(i => i.name === 'Get Users')) {
    usersFolder.item.push({
      name: "Get Users",
      request: {
        method: "GET",
        header: [
          { key: "Authorization", value: "Bearer {{token}}" }
        ],
        url: {
          raw: "{{baseUrl}}/users?role=HOTEL_OWNER",
          host: ["{{baseUrl}}"],
          path: ["users"],
          query: [
            { key: "role", value: "HOTEL_OWNER" }
          ]
        }
      }
    });
  }
}

// Add Admin folder if doesn't exist
let adminFolder = collection.item.find(i => i.name === 'Admin Dashboard');
if (!adminFolder) {
  adminFolder = {
    name: "Admin Dashboard",
    item: []
  };
  collection.item.push(adminFolder);
}

if (!adminFolder.item.find(i => i.name === 'Global Search')) {
  adminFolder.item.push({
    name: "Global Search",
    request: {
      method: "GET",
      header: [
        { key: "Authorization", value: "Bearer {{token}}" }
      ],
      url: {
        raw: "{{baseUrl}}/admin/search?q=plaza",
        host: ["{{baseUrl}}"],
        path: ["admin", "search"],
        query: [
          { key: "q", value: "plaza" }
        ]
      }
    }
  });
}

fs.writeFileSync(filePath, JSON.stringify(collection, null, 2));
console.log('Postman collection updated successfully with Admin & Users list.');
