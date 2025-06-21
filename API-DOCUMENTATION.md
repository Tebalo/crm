# Botswana Oil CRM API Documentation

## Authentication

All protected endpoints require authentication via NextAuth.js session. Include session token in requests.

### Authentication Endpoints

#### POST /api/auth/signin
- **Purpose**: User login
- **Body**: `{ email: string, password: string }`
- **Response**: Session token
- **Public**: Yes

#### POST /api/auth/register
- **Purpose**: Create new user (Admin only)
- **Body**: `{ name: string, email: string, password: string, role: UserRole }`
- **Response**: User object
- **Permissions**: ADMIN only

---

## User Management

### GET /api/users
- **Purpose**: Get all users with pagination
- **Query Params**: 
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 10)
  - `role` (string): Filter by role
  - `isActive` (boolean): Filter by active status
- **Response**: 
  ```json
  {
    "users": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "role": "UserRole",
        "isActive": boolean,
        "createdAt": "DateTime",
        "_count": { "assignedCases": number }
      }
    ],
    "pagination": {
      "page": number,
      "limit": number,
      "total": number,
      "pages": number
    }
  }
  ```
- **Permissions**: ADMIN, SUPERVISOR

### GET /api/users/[id]
- **Purpose**: Get single user details
- **Response**: User object with case counts
- **Permissions**: Own profile OR ADMIN/SUPERVISOR

### PUT /api/users/[id]
- **Purpose**: Update user
- **Body**: `{ name?: string, email?: string, role?: UserRole, isActive?: boolean, password?: string }`
- **Response**: Updated user object
- **Permissions**: Own profile (limited) OR ADMIN (full access)

### DELETE /api/users/[id]
- **Purpose**: Deactivate user (soft delete)
- **Response**: Success message
- **Permissions**: ADMIN only

---

## Case Management

### GET /api/cases
- **Purpose**: Get cases with filtering and pagination
- **Query Params**:
  - `page`, `limit`: Pagination
  - `status`: Filter by case status
  - `priority`: Filter by priority
  - `assignedToId`: Filter by assigned agent
  - `search`: Search in title, description, case number, contact info
  - `category`: Filter by category
- **Response**:
  ```json
  {
    "cases": [
      {
        "id": "string",
        "caseNumber": "string",
        "title": "string",
        "description": "string",
        "status": "CaseStatus",
        "priority": "Priority",
        "category": "string",
        "source": "CaseSource",
        "contactName": "string",
        },
        "createdAt": "DateTime",
        "updatedAt": "DateTime",
        "_count": {
          "activities": number,
          "attachments": number
        }
      }
    ],
    "pagination": { ... }
  }
  ```
- **Permissions**: 
  - ADMIN/SUPERVISOR: All cases
  - AGENT: Only assigned cases

### POST /api/cases
- **Purpose**: Create new case
- **Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "priority": "Priority",
    "category": "string?",
    "source": "CaseSource",
    "contactName": "string?",
    "contactEmail": "string?",
    "contactPhone": "string?",
    "assignedToId": "string?"
  }
  ```
- **Response**: Created case object
- **Permissions**: All authenticated users

### GET /api/cases/[id]
- **Purpose**: Get single case with full details
- **Response**: 
  ```json
  {
    "case": {
      "id": "string",
      "caseNumber": "string",
      "title": "string",
      "description": "string",
      "status": "CaseStatus",
      "priority": "Priority",
      "category": "string",
      "source": "CaseSource",
      "contactName": "string",
      "contactEmail": "string",
      "contactPhone": "string",
      "assignedTo": { ... },
      "activities": [
        {
          "id": "string",
          "type": "ActivityType",
          "title": "string",
          "content": "string",
          "isInternal": boolean,
          "createdAt": "DateTime",
          "user": {
            "id": "string",
            "name": "string",
            "email": "string"
          }
        }
      ],
      "attachments": [ ... ],
      "createdAt": "DateTime",
      "updatedAt": "DateTime",
      "resolvedAt": "DateTime?",
      "closedAt": "DateTime?"
    }
  }
  ```
- **Permissions**: 
  - ADMIN/SUPERVISOR: Any case
  - AGENT: Only assigned cases

### PUT /api/cases/[id]
- **Purpose**: Update case
- **Body**: Partial case update object
- **Response**: Updated case object
- **Auto-tracking**: Status changes, assignments automatically create activities
- **Permissions**: 
  - ADMIN/SUPERVISOR: Any case
  - AGENT: Only assigned cases

### DELETE /api/cases/[id]
- **Purpose**: Delete case (hard delete)
- **Response**: Success message
- **Permissions**: ADMIN only

---

## Case Activities

### GET /api/cases/[id]/activities
- **Purpose**: Get case activities
- **Query Params**:
  - `includeInternal` (boolean): Include internal notes
- **Response**: Array of activities
- **Permissions**: 
  - Internal activities: Only assigned agent or supervisors
  - Public activities: Anyone with case access

### POST /api/cases/[id]/activities
- **Purpose**: Add comment/note to case
- **Body**:
  ```json
  {
    "title": "string",
    "content": "string?",
    "isInternal": boolean
  }
  ```
- **Response**: Created activity object
- **Permissions**: 
  - ADMIN/SUPERVISOR: Any case
  - AGENT: Only assigned cases

---

## Public Feedback

### POST /api/feedback
- **Purpose**: Submit public feedback (no auth required)
- **Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "contactName": "string",
    "contactEmail": "string",
    "contactPhone": "string?",
    "category": "string?"
  }
  ```
- **Response**:
  ```json
  {
    "message": "string",
    "caseNumber": "string",
    "caseId": "string",
    "trackingInfo": {
      "message": "string",
      "caseNumber": "string"
    }
  }
  ```
- **Public**: Yes

### POST /api/feedback/track
- **Purpose**: Track case status (public)
- **Body**:
  ```json
  {
    "caseNumber": "string",
    "contactEmail": "string"
  }
  ```
- **Response**:
  ```json
  {
    "case": {
      "id": "string",
      "caseNumber": "string",
      "title": "string",
      "status": "CaseStatus",
      "priority": "Priority",
      "category": "string",
      "createdAt": "DateTime",
      "updatedAt": "DateTime",
      "caseAge": number,
      "slaInfo": {
        "dueDate": "DateTime",
        "isOverdue": boolean,
        "slaHours": number
      },
      "activities": [ ... ] // Public activities only
    },
    "statusInfo": "string"
  }
  ```
- **Public**: Yes
- **Security**: Requires case number + contact email match

---

## Dashboard & Analytics

### GET /api/dashboard/stats
- **Purpose**: Get dashboard statistics
- **Query Params**:
  - `timeRange` (number): Days to analyze (default: 30)
- **Response**:
  ```json
  {
    "summary": {
      "totalCases": number,
      "openCases": number,
      "inProgressCases": number,
      "resolvedCases": number,
      "closedCases": number,
      "overdueCount": number,
      "recentCases": number,
      "avgResolutionHours": number,
      "monthlyGrowth": number
    },
    "charts": {
      "casesByPriority": {
        "LOW": number,
        "MEDIUM": number,
        "HIGH": number,
        "URGENT": number
      },
      "casesBySource": { ... },
      "casesByCategory": [
        {
          "category": "string",
          "count": number
        }
      ],
      "casesOverTime": [
        {
          "date": "Date",
          "count": number
        }
      ]
    },
    "timeRange": {
      "days": number,
      "startDate": "DateTime",
      "endDate": "DateTime"
    }
  }
  ```
- **Permissions**: 
  - ADMIN/SUPERVISOR: All cases data
  - AGENT: Only their assigned cases data

---

## Utility Endpoints

### GET /api/agents
- **Purpose**: Get available agents for assignment
- **Response**:
  ```json
  {
    "agents": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "role": "UserRole",
        "activeCases": number,
        "workloadLevel": "Available|Light|Moderate|Heavy|Overloaded"
      }
    ]
  }
  ```
- **Permissions**: ADMIN, SUPERVISOR, AGENT

---

## Bulk Operations

### POST /api/cases/bulk/assign
- **Purpose**: Bulk assign cases to agent
- **Body**:
  ```json
  {
    "caseIds": ["string"],
    "assignedToId": "string?" // null to unassign
  }
  ```
- **Response**: Success message with count
- **Permissions**: ADMIN, SUPERVISOR

### POST /api/cases/bulk/status
- **Purpose**: Bulk update case status
- **Body**:
  ```json
  {
    "caseIds": ["string"],
    "status": "CaseStatus",
    "comment": "string?"
  }
  ```
- **Response**: Success message with count
- **Permissions**: 
  - ADMIN/SUPERVISOR: Any cases
  - AGENT: Only assigned cases

---

## Data Types

### UserRole
```typescript
enum UserRole {
  ADMIN = "ADMIN",
  SUPERVISOR = "SUPERVISOR", 
  AGENT = "AGENT",
  VIEWER = "VIEWER"
}
```

### CaseStatus
```typescript
enum CaseStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
  CANCELLED = "CANCELLED"
}
```

### Priority
```typescript
enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH", 
  URGENT = "URGENT"
}
```

### CaseSource
```typescript
enum CaseSource {
  WEB_FORM = "WEB_FORM",
  EMAIL = "EMAIL",
  PHONE = "PHONE",
  IN_PERSON = "IN_PERSON",
  SOCIAL_MEDIA = "SOCIAL_MEDIA"
}
```

### ActivityType
```typescript
enum ActivityType {
  CREATED = "CREATED",
  ASSIGNED = "ASSIGNED",
  STATUS_CHANGED = "STATUS_CHANGED",
  COMMENT = "COMMENT",
  EMAIL_SENT = "EMAIL_SENT",
  EMAIL_RECEIVED = "EMAIL_RECEIVED",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED"
}
```

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error message",
  "details": {} // Optional additional details
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting & Security

- **Authentication**: Required for all endpoints except `/api/feedback/*`
- **Authorization**: Role-based access control enforced
- **Data Validation**: All inputs validated with Zod schemas
- **SQL Injection**: Protected via Prisma ORM
- **Sensitive Data**: Passwords hashed, internal activities filtered
- **Audit Trail**: All changes logged via activities

---

## Usage Examples

### Creating a Case (JavaScript)
```javascript
const response = await fetch('/api/cases', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Fuel Quality Issue',
    description: 'Customer reports poor fuel quality...',
    priority: 'HIGH',
    category: 'Quality Control',
    contactName: 'John Doe',
    contactEmail: 'john@example.com',
    assignedToId: 'agent-id'
  })
})

const data = await response.json()
```

### Bulk Status Update
```javascript
const response = await fetch('/api/cases/bulk/status', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    caseIds: ['case-1', 'case-2', 'case-3'],
    status: 'RESOLVED',
    comment: 'Resolved via bulk operation'
  })
})
```

### Public Feedback Submission
```javascript
const response = await fetch('/api/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Service Complaint',
    description: 'Long wait times at station...',
    contactName: 'Jane Smith',
    contactEmail: 'jane@example.com',
    category: 'Service Quality'
  })
})

const { caseNumber } = await response.json()
console.log('Track your case:', caseNumber)
```