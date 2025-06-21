# BOL Customer Relationship Management System

A comprehensive stakeholder feedback and case management system built with modern web technologies.

## 🚀 Tech Stack

- **Framework:** Next.js 15 with App Router
- **UI Library:** shadcn/ui + Tailwind CSS
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js v5 (Auth.js)
- **Form Validation:** Zod
- **Styling:** Tailwind CSS

## 📋 Features

### Core Functionality
- **Multi-channel Feedback Collection** - Web forms, email, social media integration
- **Automated Case Management** - Smart routing, escalation, and SLA tracking
- **Role-based Access Control** - Admin, Agent, Supervisor, and Viewer roles
- **Real-time Analytics** - Dashboards with drill-down capabilities
- **Survey Tools** - Post-resolution satisfaction measurement
- **Integration Ready** - API-first architecture for ERP and external systems

### Key Capabilities
- Automated case creation and workflow routing
- Smart ticket tagging and categorization
- Progress tracking for stakeholders
- Comprehensive audit trails
- Exportable reports (PDF, Excel)
- Root cause analysis tools

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── cases/
│   │   ├── analytics/
│   │   ├── settings/
│   │   └── users/
│   ├── api/               # API routes
│   │   ├── auth/
│   │   ├── cases/
│   │   └── surveys/
│   └── globals.css
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components
│   │   ├── feedback-form.tsx
│   │   ├── case-form.tsx
│   │   └── survey-form.tsx
│   ├── dashboard/         # Dashboard components
│   │   ├── case-list.tsx
│   │   ├── analytics-charts.tsx
│   │   └── user-management.tsx
│   └── layout/            # Layout components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   ├── validations/      # Zod schemas
│   │   ├── case.ts
│   │   ├── user.ts
│   │   └── survey.ts
│   └── utils.ts          # Utility functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── types/                # TypeScript type definitions
│   ├── auth.ts
│   ├── case.ts
│   └── survey.ts
└── hooks/                # Custom React hooks
    ├── use-cases.ts
    └── use-analytics.ts
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bol-crm-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/bol_crm"
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Email Configuration
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-password"
   EMAIL_FROM="noreply@yourcompany.com"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma db push
   
   # Seed database (optional)
   npx prisma db seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🎯 MVP Phase 1 Features

The initial release focuses on core functionality:

- ✅ **Basic Authentication** - Admin and Agent roles
- ✅ **Simple Case Management** - Create, view, update cases
- ✅ **Web Form Submission** - Public feedback form
- ✅ **Basic Dashboard** - Case list with simple statistics
- ✅ **Email Notifications** - Alerts for new cases

## 🔐 User Roles & Permissions

| Role | Permissions |
|------|------------|
| **Admin** | Full system access, user management, system configuration |
| **Supervisor** | Case oversight, team management, advanced reporting |
| **Agent** | Case handling, customer communication, basic reporting |
| **Viewer** | Read-only access to cases and reports |

## 📊 Key Database Models

```typescript
// Core entities
- User (authentication & roles)
- Case (feedback/complaint records)
- Category (case classification)
- Comment (case updates/communication)
- Survey (satisfaction measurement)
- Notification (system alerts)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Cases
- `GET /api/cases` - List cases (with filtering)
- `POST /api/cases` - Create new case
- `GET /api/cases/[id]` - Get case details
- `PUT /api/cases/[id]` - Update case
- `DELETE /api/cases/[id]` - Delete case

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/reports` - Generate reports

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Email service configured
- [ ] Monitoring tools setup

### Recommended Platforms
- **Vercel** - Seamless Next.js deployment
- **Railway** - Database hosting
- **Supabase** - Alternative database + auth solution

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📈 Future Enhancements

### Phase 2 Features
- Advanced analytics and reporting
- Social media integration
- Mobile app support
- Automated workflows
- AI-powered categorization

### Phase 3 Features
- Multi-tenant support
- Advanced integrations (ERP, CRM)
- Custom survey builders
- API marketplace

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ for BOL stakeholder management**