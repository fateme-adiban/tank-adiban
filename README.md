# Kanban Board

This project is a Kanban board built with Next.js, and @dnd-kit.

It supports:

- Adding, deleting, and editing boards, columns, and cards
- Drag & drop cards across columns
- Session-based user access
- Multi-tab synchronization

---

## Features

1. User Authentication (local storage based)
2. Per-user boards (users only see their boards)
3. Drag and drop cards using `@dnd-kit`
4. Multi-tab sync via `BroadcastChannel`
5. LocalStorage persistence

## Advanced Features

- Simulated teams and permissions system

- End-to-end (E2E) tests using Playwright

- Improved UX with notifications

- Optimistic updates with logical rollback

- Meaningful tests for critical components

- Simple and extensible code (Clean Code)

- Basic accessibility coverage

## Structure

```bash
/components

  CardItem.tsx
  ColumnComponent.tsx
  LoginPage.tsx

/app/kanbanBoard

  page.tsx
```

---

## Setup & Run Locally

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

## How to Use

1. Sign Up & Login

   - Fill in your username and password
   - Click Sign Up or Login
   - After login, a session key is stored in `localStorage`

2. Create Boards

   - Enter a board title → click Add Board
   - Only boards belonging to you will be visible

3. Create Columns & Cards

   - Select a board
   - Add columns and cards using the input fields
   - Drag & drop cards between columns

4. Edit & Delete

5. Multi-Tab Sync
   - Open the app in two tabs with the same session
   - Changes in one tab will automatically appear in the other

### Deployment

- Push your code to GitHub
- Import the repository on Vercel
- Automatic deployment on every push

## Trade offs

1. **LocalStorage for Session & State**

   - Pros: Fast, simple for small projects, no server required
   - Cons: Data is limited to the user’s browser, insecure for sensitive information, data is lost if the browser is cleared

2. **BroadcastChannel for Multi-Tab Sync**

   - Pros: Simple tab-to-tab synchronization, no need for WebSockets
   - Cons: Works only between tabs in the same browser, not across devices

3. **useReducer for State Management**

   - Pros: Suitable for managing complex board and card states, scalable for adding new actions
   - Cons: Slightly more complex than `useState`, especially for beginners

4. **Client side Rendering**

   - Pros: Fast for user interactions, full control on the client-side
   - Cons: Weaker SEO, initial render may appear delayed, requires careful handling of hydration issues

5. **Using DnD Kit**
   - Pros: Light weight and modern library, TypeScript friendly, flexible
   - Cons: Requires smart event management for simultaneous editing and dragging

---

# Demo Link : `https://tankadiban.vercel.app`
