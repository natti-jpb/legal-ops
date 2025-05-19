# Legal Operations Management System

A modern web application for managing legal cases, court transcripts, and related documentation.

## 🚀 Features

- User authentication system
- Case management dashboard
- Transcript viewing and management
- Modern, responsive UI using Tailwind CSS
- Built with Next.js and TypeScript for robust performance

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:
- Node.js (version 16.x or higher)
- npm (usually comes with Node.js)
- Git (for version control)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd LegalOps
```

2. Install dependencies:
```bash
npm install
```

This will install all required dependencies including:
- Next.js 15.1.0
- React 19
- Tailwind CSS
- Various UI components from Radix UI
- Other utility libraries

## ⚙️ Configuration

The application uses default configuration for development. No additional configuration is required to start developing.

## 🏃‍♂️ Running the Application

### Development Mode
To run the application in development mode:
```bash
npm run dev
```
This will start the development server at `http://localhost:3000`

### Production Build
To create and run a production build:
```bash
npm run build
npm start
```

## 📦 Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Creates a production build
- `npm run start` - Runs the production server
- `npm run lint` - Runs the linter to check code quality

## 🔐 Authentication

The current version uses mock authentication:
- You can use any non-empty username and password to log in
- Session is maintained using browser storage
- Mock data is provided for demonstration purposes

## 📁 Project Structure

```
LegalOps/
├── app/                    # Next.js app directory
│   ├── cases/             # Case management pages
│   ├── login/             # Authentication pages
│   └── ...
├── components/            # Reusable React components
│   ├── ui/               # UI components
│   └── ...
├── public/               # Static files
├── styles/               # Global styles
├── package.json          # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

## 🔧 Dependencies

Here's a list of main dependencies and their purposes:

### Core Dependencies
- `next`: ^15.1.0 - The React framework
- `react`: ^19 - UI library
- `react-dom`: ^19 - React DOM utilities
- `typescript`: ^5 - TypeScript support

### UI Components and Styling
- `@radix-ui/*`: Various UI component primitives
- `tailwindcss`: ^3.4.17 - Utility-first CSS framework
- `class-variance-authority`: ^0.7.1 - Class utilities
- `clsx`: ^2.1.1 - Class name utilities
- `lucide-react`: ^0.454.0 - Icon library

### Form and Data Handling
- `react-hook-form`: ^7.54.1 - Form handling
- `zod`: ^3.24.1 - Schema validation
- `date-fns`: 4.1.0 - Date utilities

### Development Dependencies
- `@types/node`: ^22 - Node.js type definitions
- `@types/react`: ^19 - React type definitions
- `@types/react-dom`: ^19 - React DOM type definitions
- `postcss`: ^8 - CSS processing
- `typescript`: ^5 - TypeScript compiler

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Module not found errors**
   - Solution: Delete the `node_modules` folder and `package-lock.json`, then run `npm install` again

2. **TypeScript errors**
   - Solution: Run `npm run build` to check for type errors
   - Make sure your Node.js version is compatible

3. **Port 3000 already in use**
   - Solution: Kill the process using port 3000 or use a different port:
     ```bash
     npm run dev -- -p 3001
     ```

### Still having issues?
- Check that all dependencies are properly installed
- Verify your Node.js version (`node --version`)
- Clear your browser cache
- Check for any error messages in the console 