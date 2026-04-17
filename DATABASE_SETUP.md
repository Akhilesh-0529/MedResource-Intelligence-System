# Database Setup Guide

This guide walks through setting up PostgreSQL for MedResource Intelligence System.

## Prerequisites

- PostgreSQL 12+
- psql command-line tool

## Setup Steps

### 1. Create Database and User

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE medresource_db;

# Create user (replace 'password' with secure password)
CREATE USER medresource_user WITH PASSWORD 'password';

# Grant privileges
ALTER ROLE medresource_user SET client_encoding TO 'utf8';
ALTER ROLE medresource_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE medresource_user SET default_transaction_deferrable TO on;
ALTER ROLE medresource_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE medresource_db TO medresource_user;

# Exit psql
\q
```

### 2. Initialize Database Schema

```bash
cd backend

# Run seed/migration script
node seed.js
```

### 3. Verify Connection

```bash
psql -U medresource_user -d medresource_db -h localhost
```

## Configuration

Update your `.env` file with:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medresource_db
DB_USER=medresource_user
DB_PASSWORD=your_password_here
```

## Tables

The database includes the following tables:

- **users**: User accounts and authentication
- **patients**: Patient information
- **resources**: Hospital resources (beds, equipment, staff)
- **allocation_logs**: History of resource allocations

## Backup & Restore

### Backup Database
```bash
pg_dump -U medresource_user -d medresource_db > backup.sql
```

### Restore Database
```bash
psql -U medresource_user -d medresource_db < backup.sql
```

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running: `brew services start postgresql` (macOS)
- Check host and port in `.env`

### Permission Denied
- Verify user has correct privileges
- Run privileges grant commands again

### Database exists
- Drop existing database: `dropdb -U postgres medresource_db`
- Recreate following setup steps
