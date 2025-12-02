// import request from "supertest";
// import app from "../app";
// import { pool } from "../db";

// beforeAll(async () => {
//   await pool.query(`INSERT INTO agents(username, password) VALUES('alice', 'hashed')`);
// });

// afterAll(async () => {
//   await pool.query(`DELETE FROM agents WHERE username='alice'`);
//   await pool.end();
// });

// it("POST /api/auth/login returns 200 for correct credentials", async () => {
//   const res = await request(app)
//     .post("/api/auth/login")
//     .send({ username: "alice", password: "password" });
//   expect(res.status).toBe(200);
//   expect(res.body).toHaveProperty("accessToken");
// });
