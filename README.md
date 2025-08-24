# Loan Eligibility Checker

A full-stack Angular application for checking loan eligibility based on customer profiles and lender rules.

## Features

- **Role-based Access Control**: Customer, Lender, and Admin roles
- **Customer Features**: Profile management, loan applications, eligibility checking
- **Lender Features**: Profile management, eligibility rules management
- **Admin Features**: User management
- **Real-time Eligibility**: Instant eligibility checking based on lender rules

## Demo Users

Use any password for these demo accounts:

- **Customer**: `cust1`
- **Lender**: `lender1` 
- **Admin**: `admin1`

## Tech Stack

- **Frontend**: Angular 19.2.14
- **Styling**: Plain CSS with design system
- **State Management**: RxJS with BehaviorSubject
- **Routing**: Angular Router with guards
- **Mock API**: Simulated backend until real API is ready

## Getting Started

### Prerequisites

- Node.js 22.16.0+
- npm 11.4.2+

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:4200`

## Application Flow

### Customer Journey
1. Login as `cust1`
2. Update profile (age, salary, credit score)
3. Apply for a loan
4. View eligibility results
5. Track applications

### Lender Journey
1. Login as `lender1`
2. Update profile
3. Manage eligibility rules
4. See how rule changes affect customer eligibility

### Admin Journey
1. Login as `admin1`
2. View all system users

## Project Structure

```
src/app/
├── core/
│   ├── models/          # TypeScript interfaces
│   ├── services/        # Mock API service
│   └── guards/          # Route guards
├── features/
│   ├── auth/            # Login/Register
│   ├── dashboard/       # Role-aware dashboard
│   ├── customer/        # Customer features
│   ├── lender/          # Lender features
│   ├── admin/           # Admin features
│   └── eligibility/     # Eligibility checking
└── styles.css           # Global CSS design system
```

## Development

### Adding New Features
- Create components in appropriate feature folders
- Update routing in `app.routes.ts`
- Add guards for protected routes
- Follow the established CSS class naming conventions

### CSS Design System
- Uses CSS custom properties for consistent theming
- BEM-inspired class naming
- Responsive design with mobile-first approach
- Utility classes for common patterns

## Future Enhancements

- **Phase 2**: Real Spring Boot backend with MySQL
- **Phase 3**: JWT authentication and security
- **Phase 4**: Advanced validation and error handling

## Contributing

1. Follow Angular coding standards
2. Use standalone components
3. Maintain consistent CSS architecture
4. Add proper TypeScript types

## License

This project is for educational and demonstration purposes.
