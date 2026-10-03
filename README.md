# BizFlow ERP System

BizFlow ERP is a modern, web-based Enterprise Resource Planning (ERP) system designed to streamline and simplify business operations for small and medium-sized businesses. It provides a centralized platform for managing essential business processes, improving operational efficiency, and supporting data-driven decision-making through an intuitive and responsive interface.

Built with React 19, TypeScript, TanStack Start, Supabase, and PostgreSQL, BizFlow ERP combines modern web technologies with a scalable architecture, type-safe data management, and an accessible user interface.

## 🚀 Key Features
- **Business Dashboard** – Monitor business performance through interactive dashboards, key performance indicators, and data visualizations.
- **Inventory Management** – Manage products, stock levels, and inventory-related operations.
- **Sales Management** – Organize sales transactions and monitor business revenue.
- **Purchase Management** – Manage purchasing activities and maintain purchase records.
- **Customer Management** – Maintain customer profiles and track customer-related information.
- **Supplier Management** – Organize supplier details and manage supplier-related operations.
- **Expense Management** – Record and monitor business expenses.
- **Employee Management** – Manage employee information and business roles.
- **Reports & Analytics** – Visualize business data using interactive charts and reports.
- **Responsive UI** – Access the system through a modern, responsive interface designed for different screen sizes.
- **Form Validation** – Ensure data consistency through structured form handling and validation.

## 🛠️ Technology Stack

### Frontend
- **React 19** – Component-based user interface development.
- **TypeScript 5** – Static typing and improved code maintainability.
- **Vite 8** – Fast development server and frontend build tooling.
- **TanStack Start** – Full-stack React framework with server-side rendering capabilities.
- **TanStack Router** – Type-safe, file-based routing.
- **TanStack Query v5** – Server-state management, caching, and background data synchronization.

### Backend & Database
- **Supabase** – Backend platform providing PostgreSQL database services and authentication capabilities.
- **PostgreSQL** – Relational database for structured business data.
- **Drizzle ORM** – Type-safe database queries and schema management.
- **Drizzle Kit** – Database schema migrations and development tools.
- **Row-Level Security (RLS)** – Database-level access control through PostgreSQL policies.

### UI & Styling
- **Tailwind CSS v4** – Utility-first styling and responsive layouts.
- **Radix UI** – Accessible and reusable UI primitives.
- **Lucide React** – Consistent iconography.
- **Recharts** – Interactive charts and data visualization.
- **Class Variance Authority (CVA)** – Component variant management.
- **Tailwind Merge & CLSX** – Conditional styling and class management.

### Forms & Validation
- **React Hook Form** – Efficient form state management.
- **Zod** – Type-safe schema validation.
- **Hookform Resolvers** – Integration between React Hook Form and validation schemas.

### Development & Deployment
- **Nitro** – Server runtime and deployment engine.
- **ESLint 9** – Code linting and quality checks.
- **Prettier** – Consistent code formatting.

## 🏗️ Architecture

BizFlow ERP uses a modern full-stack architecture that integrates a React-based frontend with server-side capabilities and a PostgreSQL database.

- **Frontend**: React, TypeScript, Tailwind CSS, and Radix UI.
- **Application Framework**: TanStack Start and TanStack Router.
- **Data Management**: TanStack Query and Drizzle ORM.
- **Backend Services**: Supabase and TanStack Start server functionality.
- **Database**: PostgreSQL with Supabase Row-Level Security.

## 🎯 Project Objectives
- Centralize essential business operations in a single platform.
- Reduce manual data management and improve workflow efficiency.
- Provide real-time access to business information where supported.
- Improve inventory, sales, and financial visibility.
- Support informed business decisions through analytics and reporting.
- Deliver a scalable, maintainable, and user-friendly ERP solution.

## 💻 Installation & Setup

### Prerequisites
- Node.js
- npm
- Supabase account
- Git

### 1. Clone the Repository
```sh
git clone <your-repository-url>
cd bizflow-erp
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and configure the required environment variables:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_connection_string
```

### 4. Run the Development Server
```sh
npm run dev
```
Open the local URL shown in the terminal to access the application.

### 5. Build for Production
```sh
npm run build
```

## 🔒 Security
- PostgreSQL Row-Level Security policies.
- Type-safe validation with Zod.
- Controlled access to application data.
- Secure environment variable management.

## 🔮 Future Enhancements
- AI-powered business insights and analytics.
- Intelligent inventory restocking recommendations.
- Sales forecasting and trend analysis.
- Barcode and QR code scanning.
- Automated email notifications.
- Advanced financial reporting.
- Enhanced audit logs and activity tracking.

## 👨‍💻 Developer
**Manusha Mihiran**  
- GitHub: [Manusha911](https://github.com/Manusha911)  
- LinkedIn: Manusha Mihiran  

*BizFlow ERP – Simplifying Business Operations Through Technology.*
