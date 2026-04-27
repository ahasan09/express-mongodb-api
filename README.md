# Express MongoDB REST API

A production-ready REST API built with Node.js, Express, and MongoDB. Features include JWT-based authentication, user registration/login, and customer management.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Auth:** JSON Web Tokens (JWT) + bcrypt
- **Validation:** Joi
- **Logging:** Winston + winston-mongodb
- **Security:** Helmet, compression

## Prerequisites

- [Node.js](https://nodejs.org/) v14+
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI

## Getting Started

### 1. Clone and install dependencies

```bash
git clone https://github.com/ahasan09/express-mongodb-api
cd express-mongodb-api
npm install
```

### 2. Configure environment

Create a `config/` directory with your settings (the app uses the `config` npm package):

```bash
# config/default.json
{
  "jwtPrivateKey": "your_jwt_secret_key",
  "db": "mongodb://localhost/node-app"
}
```

Or set environment variables:

```bash
export node-app_jwtPrivateKey=your_jwt_secret
export node-app_db=mongodb://localhost/node-app
```

### 3. Start MongoDB

```bash
# macOS/Linux
mongod

# Or use MongoDB Atlas — update the db connection string above
```

### 4. Run the server

```bash
npm start
```

The API will be available at [http://localhost:3000](http://localhost:3000).

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users` | Register a new user | No |
| POST | `/api/auth` | Login and get JWT token | No |
| GET | `/api/customers` | List all customers | Yes |
| POST | `/api/customers` | Create a customer | Yes |
| PUT | `/api/customers/:id` | Update a customer | Yes |
| DELETE | `/api/customers/:id` | Delete a customer | Yes |

### Authentication

Include the JWT token in the `x-auth-token` header:

```
x-auth-token: <your_token>
```

## Project Structure

```
express-mongodb-api/
├── index.js            # App entry point
├── config/             # Configuration files
├── middleware/         # Express middleware (auth, error handling)
├── models/             # Mongoose schemas
├── routes/
│   ├── auth.js         # Login route
│   ├── users.js        # User registration
│   └── customers.js    # Customer CRUD
└── startup/            # App initialization (db, routes, logging, config)
```
