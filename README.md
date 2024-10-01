# X-Clone Backend

Backend for the X-Clone application, built with Node.js and Express, managing user authentication, media uploads, and data storage with Prisma and PostgreSQL.

## 🔗 Links

- **Live Demo:** [https://x-social-media.vercel.app](https://x-social-media.vercel.app)
- **Frontend Repository:** [https://github.com/SamuelFerfort/x-clone-frontend](https://github.com/SamuelFerfort/x-clone-frontend)



## 🚀 Technologies

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JSON Web Tokens (JWT)
- **File Uploads:** Cloudinary
- **Environment Management:** dotenv

## 🌟 Features

- **User Authentication:** Secure registration and login using JWT.
- **Post Management:** Create, read, update, and delete posts with media attachments.
- **Media Uploads:** Handle image and GIF uploads via Cloudinary.
- **Follow System:** Enable users to follow and unfollow others.
- **Database Management:** Efficient data handling with Prisma ORM and PostgreSQL.
- **API Security:** Protect routes and ensure secure data transactions.

## 🔧 Setup

### 1. **Clone the Repository:**

```bash
git clone https://github.com/yourusername/x-clone-backend.git
cd x-clone-backend
```

### 2. **Install Dependencies:**

```bash

npm install

```

### 3. **Configure Environment Variables:**

```

DATABASE_URL=your_database_key
CLOUDINARY_API_KEY=cloudinary_api_key
CLOUDINARY_CLOUD_NAME=cloudinary_cloud_name
CLOUDINARY_API_SECRET=cloudinary_api_secret
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=your_client_url

```

### 4. **Set up the Database:**

```bash
npx prisma migrate dev --name init


```

### 5. **Start the Server:**

```bash

npm run devStart


```

The server should now be running on http://localhost:3000.

## 🎯 Goals

Designed to complement the X-Clone frontend, this backend project was made to practice building scalable APIs with Node.js and Express, managing databases with Prisma and PostgreSQL, handling media uploads with Cloudinary, and implementing secure authentication mechanisms using JWT.
