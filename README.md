# Job-Cipher
# JobCipher Connect

A job search and career management platform that helps users find and track job opportunities.

## Features

- Job search across multiple platforms
- Resume parsing and analysis
- Job alerts and notifications
- User profile management
- Dashboard with job application tracking

## Tech Stack

- Frontend: React with TypeScript
- Backend: Node.js
- Database: Supabase and AWS DynamoDB
- Authentication: Supabase Auth
- UI: Tailwind CSS with shadcn-ui components
- Build Tool: Vite

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- AWS account (for DynamoDB)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/jobcipher-connect.git
   cd jobcipher-connect
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase and AWS credentials

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Environment Variables

The following environment variables are required:

```
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your_aws_access_key_id
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
NEXT_PUBLIC_AWS_REGION=your_aws_region
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
