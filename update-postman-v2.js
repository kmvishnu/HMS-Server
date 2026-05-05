const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'docs', 'postman_collection.json');
const data = fs.readFileSync(filePath, 'utf8');
const collection = JSON.parse(data);

// Add "Hotel Management (Owner/Staff)" folder
const ownerFolder = {
  name: "Hotel Management (Owner/Staff)",
  item: [
    {
      name: "Update Visibility",
      request: {
        method: "PUT",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: "{\n  \"isVisible\": true\n}" },
        url: { raw: "{{baseUrl}}/hotels/:id/visibility", host: ["{{baseUrl}}"], path: ["hotels", ":id", "visibility"], variable: [{ key: "id", value: "1" }] }
      }
    },
    {
      name: "Update Features",
      request: {
        method: "PUT",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: "{\n  \"features\": [\"AC\", \"WiFi\", \"Pool\"]\n}" },
        url: { raw: "{{baseUrl}}/hotels/:id/features", host: ["{{baseUrl}}"], path: ["hotels", ":id", "features"], variable: [{ key: "id", value: "1" }] }
      }
    },
    {
      name: "Create Room Type",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: "{\n  \"hotelId\": 1,\n  \"name\": \"Deluxe Room\",\n  \"totalRooms\": 10,\n  \"price\": 150.00\n}" },
        url: { raw: "{{baseUrl}}/room-types", host: ["{{baseUrl}}"], path: ["room-types"] }
      }
    },
    {
      name: "Get Hotel Bookings",
      request: {
        method: "GET",
        url: { raw: "{{baseUrl}}/bookings/hotel?filter=today", host: ["{{baseUrl}}"], path: ["bookings", "hotel"], query: [{ key: "filter", value: "today" }] }
      }
    },
    {
      name: "Check-in",
      request: {
        method: "POST",
        url: { raw: "{{baseUrl}}/bookings/:id/checkin", host: ["{{baseUrl}}"], path: ["bookings", ":id", "checkin"], variable: [{ key: "id", value: "1" }] }
      }
    },
    {
      name: "Check-out",
      request: {
        method: "POST",
        url: { raw: "{{baseUrl}}/bookings/:id/checkout", host: ["{{baseUrl}}"], path: ["bookings", ":id", "checkout"], variable: [{ key: "id", value: "1" }] }
      }
    }
  ]
};

// Add "Staff Management" folder
const staffFolder = {
  name: "Staff Management",
  item: [
    {
      name: "Create Staff",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: "{\n  \"name\": \"Staff Name\",\n  \"email\": \"staff@example.com\",\n  \"password\": \"password123\"\n}" },
        url: { raw: "{{baseUrl}}/staff", host: ["{{baseUrl}}"], path: ["staff"] }
      }
    },
    {
      name: "Get Staff List",
      request: {
        method: "GET",
        url: { raw: "{{baseUrl}}/staff", host: ["{{baseUrl}}"], path: ["staff"] }
      }
    }
  ]
};

// Add Enhanced Booking with Guests
const publicFolder = collection.item.find(i => i.name === 'Public APIs');
if (publicFolder) {
    const bookingReq = {
        name: "Create Booking with Guests",
        request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
                mode: "raw",
                raw: "{\n  \"roomTypeId\": 1,\n  \"checkIn\": \"2026-06-05\",\n  \"checkOut\": \"2026-06-07\",\n  \"guests\": [\n    { \"name\": \"John Doe\", \"age\": 30 },\n    { \"name\": \"Jane Doe\", \"age\": 28 }\n  ]\n}"
            },
            url: { raw: "{{baseUrl}}/bookings", host: ["{{baseUrl}}"], path: ["bookings"] }
        }
    };
    collection.item.push(bookingReq);
}

collection.item.push(ownerFolder);
collection.item.push(staffFolder);

fs.writeFileSync(filePath, JSON.stringify(collection, null, 2));
console.log('Postman collection updated successfully with Owner/Staff APIs.');
