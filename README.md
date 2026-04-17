# Vue + Vite Headless WordPress Frontend

This project is a modern frontend application built with Vue 3 and Vite, consuming data from a WordPress backend (Headless CMS) hosted on Pantheon.

The goal of this project is to replace a legacy WordPress + Divi frontend with a clean, scalable, and maintainable architecture.

---

## 🚀 Tech Stack

* Vue 3 (Composition API)
* Vite
* Vuetify (UI framework)
* Axios (HTTP client)
* WordPress REST API (Headless CMS)
* Netlify (hosting + serverless functions)

---

## 🧱 Project Structure

```
project/
  src/
    api/              # API clients and services
    composables/      # reusable logic (Vue composables)
    components/       # UI components
    views/            # pages (routes)
    router/           # Vue Router config
    App.vue
    main.js

  netlify/
    functions/        # serverless functions (secure WP access)

  public/             # static assets

  index.html
  vite.config.js
  package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```
VITE_WP_API=https://your-wordpress-site.com
```

---

## 🧠 Architecture Overview

```
WordPress (Pantheon)
   └── Custom Post Types (CPT)
        ↓ REST API
Netlify Functions (for secure POST/UPDATE)
        ↓
Vue App (Vite)
        ↓
Netlify (deployment)
```

---

## 📡 API Usage

### Fetch Posts (Public)

The frontend directly consumes the WordPress REST API:

```
GET /wp-json/wp/v2/posts
```

Handled via:

```
src/api/wpClient.js
src/api/wp.service.js
src/composables/usePosts.js
```

---

### Create / Update Posts (Secure)

Sensitive operations are handled via Netlify Functions:

```
POST /.netlify/functions/createPost
POST /.netlify/functions/updatePost
```

This avoids exposing WordPress credentials in the frontend.

---

## 🔁 Reusable Data Layer

The project uses a composable pattern for fetching data:

```js
const { items, fetchAll } = usePosts('posts')
```

Supports any CPT:

```js
usePosts('posts')
usePosts('projects')
usePosts('entries')
```

---

## 🧼 Data Normalization

WordPress returns nested data (e.g. `title.rendered`).
The app maps it into a clean structure before rendering.

---

## 🧪 Development

Install dependencies:

```
npm install
```

Run dev server:

```
npm run dev
```

App runs at:

```
http://localhost:5173
```

---

## 🏗️ Build

```
npm run build
```

---

## 🌍 Deployment

This project is designed to be deployed on Netlify.

* Connect repository
* Set environment variables
* Deploy

---

## 🔐 Security Notes

* Never expose WordPress credentials in the frontend
* Use Netlify Functions for authenticated requests
* Configure CORS properly on WordPress

---

## 🎯 Goals of This Architecture

* Replace WordPress page builders (e.g. Divi)
* Decouple frontend and backend
* Improve performance and scalability
* Enable modern frontend development

---

## 📌 Future Improvements

* Dynamic routing (`/post/:slug`)
* Pagination and filtering
* Authentication (JWT)
* State management (Pinia)
* Caching strategies

---

## 👩‍💻 Author

Built by iLIT
---
