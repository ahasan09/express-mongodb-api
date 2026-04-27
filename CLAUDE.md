# Node.js MongoDB

Node.js REST API with Express, MongoDB/Mongoose, and JWT authentication.

## Tech Stack
- Node.js
- Express
- MongoDB / Mongoose
- JWT (authentication)

## Project Structure
```
nodejs-mongodb/
├── src/
│   ├── routes/
│   ├── models/
│   ├── middleware/      # JWT auth middleware
│   └── app.js
└── package.json
```

## Development
```bash
# Install dependencies
npm install

# Run development server
npm start
```

## Key Notes
- Requires a running MongoDB instance. Set the connection URI in environment variables or a `.env` file.
- JWT secret should be set in environment variables.
