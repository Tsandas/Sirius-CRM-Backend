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

---

# Tasks API

# Base Route

```
/api/tasks/
```

# POST `/tasks/types`

Insert a new task type.

### Request Body

```json
{
  "taskTypeId": "1006",
  "taskTypeName": "Home",
  "taskTypeCode": "HM",
  "isActive": "true"
}
```

### Body Parameters

| Field        | Type    | Required | Description                     |
| ------------ | ------- | -------- | ------------------------------- |
| taskTypeId   | number  | yes      | Unique task type identifier     |
| taskTypeName | string  | yes      | Human-readable task type name   |
| taskTypeCode | string  | yes      | Unique task type code           |
| isActive     | boolean | no       | Whether the task type is active |

### Response (200)

```json
{
  "success": true,
  "status": 200,
  "message": "Task inserted successfully",
   "data": {
        "insert_task_type": ""
    }
}
```

### Notes

* Payload is validated using Joi.
* Invalid payload returns **400 Bad Request** with a validation error message.

---

# POST `/tasks/active`

Set active task types in bulk.

### Request Body

```json
{
  "activeTaskTypeIds": [1, 2, 3]
}
```

### Body Parameters

| Field             | Type            | Required | Description                             |
| ----------------- | --------------- | -------- | --------------------------------------- |
| activeTaskTypeIds | number[] | null | yes      | List of task type IDs to mark as active |

### Response

* **200 OK** if the request is accepted successfully.

### Notes
**DONT USE YET, DATABASE FUNCTION IS FAULTY**
---
# POST `/tasks`

Create a new task.

### Request Body

```json
{
  "taskTypeId": 1,
  "transactionId": 1001,
  "status": "OPEN",
  "subject": "Call client",
  "description": "Follow up regarding contract details",
  "assignedToUserId": 5,
  "priority": "HIGH",
  "reminder": true,
  "callDurationSeconds": 300,
  "location": "Office",
  "chainId": 10
}
```

### Body Parameters

| Field               | Type    | Required | Description                         |
| ------------------- | ------- | -------- | ----------------------------------- |
| taskTypeId          | number  | yes      | Task type ID                        |
| transactionId       | number  | yes      | Related transaction ID              |
| status              | string  | yes      | Task status                         |
| subject             | string  | yes      | Task subject/title                  |
| description         | string  | yes      | Task description                    |
| assignedToUserId    | number  | no       | Assigned user ID (nullable)         |
| priority            | string  | no       | Task priority (nullable)            |
| reminder            | boolean | no       | Whether reminder is enabled         |
| callDurationSeconds | number  | no       | Call duration in seconds (nullable) |
| location            | string  | no       | Task location (nullable)            |
| chainId             | number  | no       | Related chain ID (nullable)         |

### Response (200)

```json
{
  "success": true,
  "status": 200,
  "message": "Task inserted successfully",
  "data": null
}
```
---

# PUT `/tasks`

Update an existing task.

### Request Body

```json
{
  "taskId": 25,
  "status": "COMPLETED",
  "subject": "Call completed",
  "description": "Client confirmed agreement",
  "assignedToUserId": 5,
  "priority": "LOW",
  "reminder": false,
  "callDurationSeconds": 420,
  "location": "Remote"
}
```

### Body Parameters

| Field               | Type    | Required | Description                         |
| ------------------- | ------- | -------- | ----------------------------------- |
| taskId              | number  | yes      | ID of the task to update            |
| status              | string  | yes      | Updated task status                 |
| subject             | string  | yes      | Updated task subject                |
| description         | string  | yes      | Updated task description            |
| assignedToUserId    | number  | no       | Assigned user ID (nullable)         |
| priority            | string  | no       | Task priority (nullable)            |
| reminder            | boolean | no       | Whether reminder is enabled         |
| callDurationSeconds | number  | no       | Call duration in seconds (nullable) |
| location            | string  | no       | Task location (nullable)            |

### Response (200)

```json
{
  "success": true,
  "status": 200,
  "message": "Task updated successfully",
  "data": null
}
```
---

# POST `/tasks/:id/comments`

Add a comment to a specific task.

### Request Body

```json
{
  "comment": "Follow up regarding contract details"
}
```

### Body Parameters

| Field   | Type   | Required | Description            |
| ------- | ------ | -------- | ---------------------- |
| comment | string | yes      | Content of the comment |

### Response (201)

```json
{
  "success": true,
  "status": 201,
  "message": "Comment added successfully",
  "data": {
    "commentId": "4"
  }
}
```
Here’s the documentation for the `GET /tasks/:id/comments` endpoint:

---

# GET `/tasks/:id/comments`

Retrieve all comments for a specific task.

### Path Parameters

| Field | Type   | Required | Description    |
| ----- | ------ | -------- | -------------- |
| id    | number | yes      | ID of the task |

### Response (200)

```json
{
  "success": true,
  "status": 200,
  "message": "Comment fetched successfully",
  "data": {
    "comments": [
      {
        "commentId": 3,
        "createdAt": "2026-01-26T19:15:33.955Z",
        "leftText": "26/01/2026: Dont forget to call the client",
        "rightText": "| 1: Giorgos"
      },
      {
        "commentId": 4,
        "createdAt": "2026-01-26T20:50:22.978Z",
        "leftText": "26/01/2026: This is a task comment",
        "rightText": "| 7: John"
      }
    ]
  }
}
```
Here’s the documentation for the `GET /tasks/unassigned` endpoint:

---

# GET `/tasks/unassigned`

Fetch all tasks that are currently unassigned.

### Response (200)

```json
{
  "success": true,
  "status": 200,
  "message": "Unassigned tasks fetched successfully",
  "data": {
    "tasks": [
      {
        "taskId": 13,
        "taskTypeId": 1001,
        "taskPrefix": 4,
        "chainId": null,
        "transactionId": 1,
        "status": "IN_PROGRESS",
        "handledByUserId": 1,
        "subject": "Go outside",
        "description": "Touch some grass",
        "priority": "HIGH",
        "reminder": true,
        "createdAt": "2026-01-26T19:29:21.002Z",
        "updatedAt": "2026-01-26T19:29:21.002Z"
      }
    ]
  }
}
```
Here’s the documentation for the `GET /tasks/my` endpoint:

---

# GET `/tasks/my`

Fetch all tasks assigned to the authenticated user.

### Response (200)

```json
{
  "success": true,
  "status": 200,
  "message": "My tasks fetched successfully",
  "data": {
    "tasks": [
      {
        "taskId": 16,
        "taskTypeId": 1001,
        "taskPrefix": 7,
        "chainId": null,
        "transactionId": 1,
        "status": "IN_PROGRESS",
        "handledByUserId": 1,
        "assignedToUserId": 7,
        "subject": "Call client",
        "description": "Call client and ask how his familly is doing",
        "priority": "HIGH",
        "reminder": true,
        "createdAt": "2026-01-26T19:39:50.983Z",
        "updatedAt": "2026-01-26T19:39:50.983Z"
      }
    ]
  }
}
```
Here’s the updated, accurate documentation for `GET /tasks/filter`, reflecting that all parameters are query parameters (not in the body) and including the trader information:

---

# GET `/tasks/filter`

Filter tasks based on multiple optional query parameters.

### Query Parameters

| Field             | Type   | Required | Description                                                   |
| ----------------- | ------ | -------- | ------------------------------------------------------------- |
| taskId            | string | no       | Filter by task ID                                             |
| taskTypeId        | string | no       | Filter by task type ID                                        |
| dateFrom          | string | no       | Start date for task creation (ISO format, e.g., `YYYY-MM-DD`) |
| dateTo            | string | no       | End date for task creation (ISO format)                       |
| priority          | string | no       | Filter by task priority                                       |
| status            | string | no       | Filter by task status                                         |
| clientCodePrefix  | string | no       | Filter tasks by client code prefix                            |
| clientNamePrefix  | string | no       | Filter tasks by client name prefix                            |
| clientTimPrefix   | string | no       | Filter tasks by client TIM prefix                             |
| clientEmailPrefix | string | no       | Filter tasks by client email prefix                           |

> Example query:
> `/tasks/filter?priority=HIGH&status=IN_PROGRESS&clientNamePrefix=Acme`

### Response (200)

```json
{
  "success": true,
  "status": 200,
  "message": "Tasks filtered successfully",
  "data": {
    "tasks": [
      {
        "taskId": 16,
        "taskTypeId": 1001,
        "taskPrefix": 7,
        "chainId": null,
        "transactionId": 1,
        "status": "IN_PROGRESS",
        "handledByUserId": 1,
        "assignedToUserId": 7,
        "subject": "sasad diko s bro",
        "description": "sasad prepi na einai",
        "priority": "HIGH",
        "reminder": true,
        "callDurationSeconds": 300,
        "location": null,
        "createdAt": "2026-01-26T19:39:50.983Z",
        "updatedAt": "2026-01-26T19:39:50.983Z",
        "trader": {
          "traderCode": "C0001",
          "traderName": "Acme Corporation",
          "traderTim": "TIM12345",
          "traderEmail": "contact@acme.com"
        }
      }
    ]
  }
}
```
Here’s the documentation for the `GET /tasks/search` endpoint, reflecting that all parameters are query parameters:

---

# GET `/tasks/search`

Search for tasks with flexible filters and scope.

### Query Parameters

| Field             | Type                                               | Required | Description                                          |
| ----------------- | -------------------------------------------------- | -------- | ---------------------------------------------------- |
| scope             | string (`ALL` | `UNASSIGNED` | `MY`)               | no       | Scope of tasks to search (`ALL`, `UNASSIGNED`, `MY`) |
| search            | string                                             | no       | Free-text search on task subject or description      |
| taskId            | number                                             | no       | Filter by task ID                                    |
| taskTypeId        | number                                             | no       | Filter by task type ID                               |
| dateFrom          | string                                             | no       | Start date for task creation (ISO format)            |
| dateTo            | string                                             | no       | End date for task creation (ISO format)              |
| priority          | string (`LOW` | `MEDIUM` | `HIGH`)                 | no       | Filter by task priority                              |
| status            | string (`IN_PROGRESS` | `COMPLETED` | `CANCELLED`) | no       | Filter by task status                                |
| clientCodePrefix  | string                                             | no       | Filter tasks by client code prefix                   |
| clientNamePrefix  | string                                             | no       | Filter tasks by client name prefix                   |
| clientTimPrefix   | string                                             | no       | Filter tasks by client TIM prefix                    |
| clientEmailPrefix | string                                             | no       | Filter tasks by client email prefix                  |

> Example query:
> `/tasks/search?scope=MY&search=Fix&priority=HIGH`

### Response (200)

```json
{
  "success": true,
  "status": 200,
  "message": "Tasks fetched successfully",
  "data": {
    "tasks": [
      {
        "taskId": 14,
        "taskTypeId": 1001,
        "taskPrefix": 5,
        "chainId": 0,
        "transactionId": 1,
        "status": "OPEN",
        "handledByUserId": 1,
        "assignedToUserId": null,
        "subject": "Fix that thing",
        "description": "fix it pls",
        "priority": "HIGH",
        "reminder": true,
        "callDurationSeconds": 300,
        "location": null,
        "createdAt": "2026-01-26T19:30:21.316Z",
        "updatedAt": "2026-01-26T19:30:21.316Z",
        "traderCode": "C0001"
      }
    ]
  }
}
```
# GET `/search/unassigned`

Search unassigned tasks using multiple optional query parameters.

### Query Parameters

| Field             | Type                                                        | Required | Description                                     |
| ----------------- | ----------------------------------------------------------- | -------- | ----------------------------------------------- |
| search            | string                                                      | no       | Free-text search on task subject or description |
| taskId            | number                                                      | no       | Filter by task ID                               |
| taskTypeId        | number                                                      | no       | Filter by task type ID                          |
| dateFrom          | string                                                      | no       | Start date for task creation (ISO format)       |
| dateTo            | string                                                      | no       | End date for task creation (ISO format)         |
| priority          | string (`LOW` | `MEDIUM` | `HIGH`)                          | no       | Filter by task priority                         |
| status            | string (`OPEN` | `IN_PROGRESS` | `COMPLETED` | `CANCELLED`) | no       | Filter by task status                           |
| clientCodePrefix  | string                                                      | no       | Filter tasks by client code prefix              |
| clientNamePrefix  | string                                                      | no       | Filter tasks by client name prefix              |
| clientTimPrefix   | string                                                      | no       | Filter tasks by client TIM prefix               |
| clientEmailPrefix | string                                                      | no       | Filter tasks by client email prefix             |

> Example query:
> `/tasks/search/unassigned?status=OPEN&taskId=8`

### Response (200)

```json
{
  "success": true,
  "status": 200,
  "message": "Unassigned tasks fetched",
  "data": {
    "tasks": [
      {
        "taskId": 8,
        "taskTypeId": 1001,
        "taskPrefix": 1,
        "chainId": 0,
        "transactionId": 1,
        "status": "OPEN",
        "handledByUserId": 1,
        "assignedToUserId": null,
        "subject": "Test task",
        "description": "Description",
        "priority": null,
        "reminder": false,
        "callDurationSeconds": null,
        "location": null,
        "createdAt": "2026-01-25T15:36:10.570Z",
        "updatedAt": "2026-01-26T19:15:07.709Z",
        "traderCode": "C0001"
      }
    ]
  }
}
```
Here’s the documentation for the `GET /tasks/search/my` endpoint. I’ll keep the response example clean and generic (no dummy text), while staying accurate to the actual shape.

---

# GET `/search/my`

Search tasks assigned to the authenticated user using optional query parameters.

### Query Parameters

| Field             | Type                                                        | Required | Description                                     |
| ----------------- | ----------------------------------------------------------- | -------- | ----------------------------------------------- |
| search            | string                                                      | no       | Free-text search on task subject or description |
| taskId            | number                                                      | no       | Filter by task ID                               |
| taskTypeId        | number                                                      | no       | Filter by task type ID                          |
| dateFrom          | string                                                      | no       | Start date for task creation (ISO format)       |
| dateTo            | string                                                      | no       | End date for task creation (ISO format)         |
| priority          | string (`LOW` | `MEDIUM` | `HIGH`)                          | no       | Filter by task priority                         |
| status            | string (`OPEN` | `IN_PROGRESS` | `COMPLETED` | `CANCELLED`) | no       | Filter by task status                           |
| clientCodePrefix  | string                                                      | no       | Filter tasks by client code prefix              |
| clientNamePrefix  | string                                                      | no       | Filter tasks by client name prefix              |
| clientTimPrefix   | string                                                      | no       | Filter tasks by client TIM prefix               |
| clientEmailPrefix | string                                                      | no       | Filter tasks by client email prefix             |

> Example query:
> `/search/my?clientNamePrefix=ACME`

### Response (200)

```json
{
  "success": true,
  "status": 200,
  "message": "Tasks fetched successfully",
  "data": {
    "tasks": [
      {
        "taskId": 15,
        "taskTypeId": 1001,
        "taskPrefix": 6,
        "chainId": 0,
        "transactionId": 1,
        "status": "IN_PROGRESS",
        "handledByUserId": 1,
        "assignedToUserId": 1,
        "subject": "Task subject",
        "description": "Task description",
        "priority": "HIGH",
        "reminder": true,
        "callDurationSeconds": 300,
        "location": null,
        "createdAt": "2026-01-26T19:38:08.566Z",
        "updatedAt": "2026-01-26T19:38:08.566Z",
        "traderCode": "C0001"
      }
    ]
  }
}
```
# GET `/clients/search-for-task`

Search clients for use in the task creation/edit form.

### Query Parameters

| Field      | Type    | Required | Description                                             |
| ---------- | ------- | -------- | ------------------------------------------------------- |
| field      | string  | yes      | Field to search by (`CODE`, `NAME`, `TIM`, `EMAIL`)     |
| input      | string  | yes      | Search input value (prefix-based)                       |
| onlyActive | boolean | no       | Whether to return only active clients (default: `true`) |

> Example query:
> `/tasks/clients/search-for-task?field=CODE&input=C000`

### Response (200)

```json
{
  "success": true,
  "status": 200,
  "message": "Clients fetched successfully",
  "data": {
    "clients": [
      {
        "traderId": 1,
        "traderCode": "C0001",
        "companyName": "Acme Corporation",
        "timNumber": "TIM12345"
      }
    ]
  }
}
```
---
# GET `/my/stats`

Retrieve task statistics for the authenticated user.

### Response (200)

```json
{
  "success": true,
  "status": 200,
  "message": "My tasks stats fetched successfully",
  "data": {
    "stats": {
      "totalTasks": 12,
      "assignedToday": 3,
      "totalUrgent": 4
    }
  }
}
```

### Response Fields

| Field         | Type   | Description                                |
| ------------- | ------ | ------------------------------------------ |
| totalTasks    | number | Total number of tasks assigned to the user |
| assignedToday | number | Tasks assigned to the user today           |
| totalUrgent   | number | Tasks marked as urgent / high priority     |
---
# GET `/unassigned/stats`

Retrieve statistics for unassigned tasks.

### Response (200)

```json
{
  "success": true,
  "status": 200,
  "message": "OK",
  "data": {
    "stats": {
      "totalTasks": 2,
      "createdToday": 0,
      "totalUrgent": 2
    }
  }
}
```

### Response Fields

| Field        | Type   | Description                                       |
| ------------ | ------ | ------------------------------------------------- |
| totalTasks   | number | Total number of unassigned tasks                  |
| createdToday | number | Unassigned tasks created today                    |
| totalUrgent  | number | Unassigned tasks marked as urgent / high priority |
---
