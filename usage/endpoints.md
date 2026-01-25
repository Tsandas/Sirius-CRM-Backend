https://api.sirius-crm.online/
----

# Authentication API

## **POST `/api/auth/login`**

### **Request Body**

```json
{
  "username": "sss",
  "password": "12345678"
}
```

### **Response (Non‑Web Based Clients)**

```json
{
  "success": true,
  "status": 200,
  "message": "Log in successful",
  "data": {
    "userId": "6",
    "username": "sss",
    "roleId": "3",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
  }
}
```

---

## **POST `/api/auth/refresh-token`**

### **Headers (Non‑Web Based Clients)**

| Key               | Value             |
| ----------------- | ----------------- |
| `x-refresh-token` | `<refresh-token>` |

---

## Authentication Notes

- **Non‑web clients:**  
  Include the **access token** in the `Authorization` header using **Bearer Token** format:

  ```
  Authorization: Bearer <access-token>
  ```

- **Web‑based clients:**  
  Access token is automatically handled via **HTTP‑only cookies**.

- **If you receive `Access Denied`:**  
  → Call **`/api/auth/refresh-token`** using your refresh token.  
  → If the refresh token is expired, you must **log in again**.

---

# Traders API

# Base Route

```
/api/traders/
```

# GET `/traders`

Retrieve all traders.

### Response

```json
{
  "success": true,
  "status": 200,
  "message": "Traders retrieved successfully",
  "data": [
    {
      "traderId": 1,
      "traderCode": "C0001",
      "companyName": "Acme Corporation",
      "accountType": "Premium",
      "timNumber": "TIM12345",
      "language": "en",
      "phone": "+1234567890",
      "email": "contact@acme.com",
      "address": "123 Main Street",
      "city": "New York",
      "stateCountry": "USA",
      "zipCode": "10001",
      "createdAt": "2026-01-23T10:34:12.336Z",
      "updatedAt": "2026-01-23T10:34:12.336Z"
    },
    {
      "traderId": 5,
      "traderCode": "C0005",
      "companyName": "Starlight Logistics",
      "accountType": "Standard",
      "timNumber": "TIM-55667788"
      // rest of the fields...
    }
  ]
}
```

---

# POST `/traders`

Insert a new client.

### Body

Validated by `validateInsertClientSchema`.

```json
{
  "companyName": "Starlight Logistics",
  "accountType": "Standard",
  "timNumber": "TIM-55667788",
  "language": "es",
  "phone": "+34-912-345-678",
  "email": "info@starlight-logistics.es",
  "address": "Calle de Alcalá, 15",
  "city": "Madrid",
  "stateCountry": "Spain",
  "zipCode": "28014"
}
```

---

# PUT `/trader`

Update an existing trader.

### Body

Validated by `validateTraderUpdateSchema`.

```json
{
  "traderId": 5,
  "companyName": "Apex Logistics Group",
  "timNumber": "TIM-44002189",
  "phone": "+44-20-7946-0123",
  "email": "operations@apexlogistics.co.uk",
  "address": "45 Canary Wharf, Level 12",
  "city": "London",
  "stateCountry": "United Kingdom",
  "zipCode": "E14 5AB",
  "language": "English",
  "accountType": "Enterprise",
  "status": false
}
```

---

# DELETE `/trader/:traderId`

Delete a trader by ID.

### Params

| Param    | Type   | Description            |
| -------- | ------ | ---------------------- |
| traderId | number | ID of trader to delete |

---

# GET `/traders/stats`

Retrieve statistics about clients.

### Response

```json
{
  "totalClients": 120,
  "activeClients": 95,
  "inactiveClients": 25
}
```

- **totalClients** – total number of clients
- **activeClients** – clients with `status = true`
- **inactiveClients** – clients with `status = false`

---

# GET `/traders/search`

Search clients using the search bar and optional filters. Supports free-text search.

### Query Parameters

| Parameter   | Type   | Description                                                                                           |
| ----------- | ------ | ----------------------------------------------------------------------------------------------------- |
| search      | string | General search. If numeric → matches `trader_id`. Otherwise → matches `company_name` or `trader_code` |
| codePrefix  | string | Filter `trader_code` prefix                                                                           |
| namePrefix  | string | Filter `company_name` prefix                                                                          |
| timPrefix   | string | Filter `tim_number` prefix                                                                            |
| emailPrefix | string | Filter `email` prefix                                                                                 |
| phonePrefix | string | Filter `phone` prefix                                                                                 |
| status      | string | `'ACTIVE'`, `'INACTIVE'`, `'ALL'` (default: `'ALL'`)                                                  |
| limit       | number | Pagination limit (default: 50)                                                                        |
| offset      | number | Pagination offset (default: 0)                                                                        |

### Example

```
GET /traders/search?search=Acme&status=ACTIVE&limit=10
```

---

# GET `/traders/filter`

Filter clients using multiple specific criteria (filter form). Does **not** support free-text search.

### Query Parameters

| Parameter   | Type   | Description                                          |
| ----------- | ------ | ---------------------------------------------------- |
| codePrefix  | string | Filter `trader_code` prefix                          |
| namePrefix  | string | Filter `company_name` prefix                         |
| timPrefix   | string | Filter `tim_number` prefix                           |
| emailPrefix | string | Filter `email` prefix                                |
| phonePrefix | string | Filter `phone` prefix                                |
| status      | string | `'ACTIVE'`, `'INACTIVE'`, `'ALL'` (default: `'ALL'`) |
| limit       | number | Pagination limit (default: 50)                       |
| offset      | number | Pagination offset (default: 0)                       |

### Example

```
GET /traders/filter?codePrefix=C000&namePrefix=Acme&status=ACTIVE&limit=10&offset=0
```
