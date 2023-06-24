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
JWT_SECRET=
PORT=
```

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

npx sequelize-cli model:generate --name User --attributes fullname:string,username:string,email:string,instance:string,password:string,signature:string --underscored
npx sequelize-cli model:generate --name Document --attributes owner_id:integer,title:string,description:string,file:string --underscored
npx sequelize-cli model:generate --name Request --attributes sender_id:integer,receiver_id:integer,document_id:integer,status:string --underscored
