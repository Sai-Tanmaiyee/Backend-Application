# User Management Backend API

## Overview

This is a backend API for user and admin management, including user registration, email verification, login, and profile management. The API also supports admin functionalities such as viewing and deleting users.

## Features

- User registration with email verification via OTP
- User login with JWT token generation
- User profile management
- Admin registration and login
- Admin functionality to view and delete users

## Technologies Used

- Node.js
- Express.js
- MongoDB (with Mongoose)
- bcrypt.js
- JWT (jsonwebtoken)
- nodemailer

## Prerequisites

- Node.js and npm installed
- MongoDB instance running
- Environment variables set up for email service

## Installation & Starting the Server

1. **Clone the repository**:

```sh
git clone https://github.com/your-username/user-management-api.git
cd user-management-api
```

2. **Install dependencies**:
```sh
npm install
```

3. **Start the server**:
```sh
npm start
```
The server will start on http://localhost:3002.
