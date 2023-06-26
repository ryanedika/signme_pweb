# SignMe App

App for document signing, user will be able to create an account, upload document, assign signers, check sign request, sign document, and download signed document.

## Getting Started

### Prerequisites

-   Node
-   NPM
-   MySQL

### Installing

-   Clone the repo
-   Run `npm install` to install dependencies
-   Create a `.env` file in the root directory and add the following

```
DB_CONNECTION_STRING=
PORT=
JWT_SECRET=
BASE_URL=
NODE_ENV=
```

-   Setup database config in `config/config.json` for migrations
-   Install sequelize-cli globally `npm install -g sequelize-cli`
-   Run `sequelize db:migrate` to run migrations
-   Run `npm run dev` to start the server

## Models

### User Model

-   id: int
-   fullname: string
-   username: string (unique)
-   email: string email (unique)
-   instance string
-   password: string
-   signature: string (image url)
-   timestamps [created_at, updated_at]

### ocument Model (One to Many with User)

-   id: int
-   owner_id: int (user id)
-   title: string
-   description: string
-   file: string (file url)
-   timestamps [created_at, updated_at]

### Request Model (Many to Many with User and Document)

-   id: int
-   sender_id: int (user id)
-   receiver_id: int (user id)
-   document_id: int
-   status: string (pending, signed)
-   timestamps [created_at, updated_at]
