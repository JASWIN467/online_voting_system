## Secure Voting System (Backend)

Role-based online voting backend using **Node.js**, **Express**, **MongoDB (Mongoose)**, and **JWT**.

### Roles and entities

- **Users**: voters (`role=user`) and admins (`role=admin`)
- **Candidates**: **not users**, no authentication, stored in a separate `candidates` collection

### Folder structure

- `models/` — Mongoose models (`User`, `Election`, `Candidate`, `Vote`)
- `controllers/` — request handlers
- `routes/` — route definitions
- `middleware/` — JWT auth, role guard, voting guards
- `config/` — DB connection + admin seeding script

### Environment variables

Create a `.env` file in the project root:

```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/votingdb
JWT_SECRET=change_me

# optional: used by npm run seed:admin
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
```

### Run

```bash
npm install
npm run dev
```

### Create an admin (recommended)

```bash
npm run seed:admin
```

### API endpoints (samples)

#### Auth

- `POST /api/auth/register` (public) — register voter (role is always `user`)
- `POST /api/auth/login` (public) — login
- `GET /api/auth/me` (protected) — current user

#### Voter

- `GET /api/voter/elections` (protected) — list **active** elections (time-window checked)
- `GET /api/voter/elections/:id/candidates` (protected) — candidates for an **active** election
- `POST /api/voter/vote` (protected) — vote once per election (DB unique index + middleware check)

#### Admin (admin-only)

- `POST /api/admin/elections` — create election
- `POST /api/admin/candidates` — add candidate to election
- `PATCH /api/admin/elections/:id/start` — start election (only within valid time window)
- `PATCH /api/admin/elections/:id/end` — end election
- `GET /api/admin/elections/:id/results` — results (vote counts per candidate)

### Notes

- **One vote per election** is enforced at the DB level via a unique index on `Vote` \(userId + electionId\).
- **Role is never accepted from the client** during registration.
- Voting is allowed only when the election is **active** and within \(startTime, endTime\).

