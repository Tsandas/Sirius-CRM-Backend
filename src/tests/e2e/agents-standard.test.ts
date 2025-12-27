import supertest from "supertest";

// const request = supertest(app);
const BASE_URL = process.env.API_BASE_URL  || "http://localhost:3000";
const request = supertest(BASE_URL);
const user =  process.env.TEST_USER
const pass =  process.env.TEST_PASS

// Check what to do in order for these to run only on render
describe("POST /api/auth/login", () => {
  describe("Login & Tokens", () => {
    test("returns access & refresh tokens for valid credentials", async () => {
      const response = await request.post("/api/auth/login").send({
        username:  user,
        password: pass,
      });
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
    });

    test("should fail for invalid credentials", async () => {
      const response = await request.post("/api/auth/login").send({
        username: "failuser",
        password: "failpass",
      });
      expect(response.status).toBe(401);
    });

    test("allows access to protected route with valid access token", async () => {
      const login = await request
        .post("/api/auth/login")
        .send({ username: user, password: pass });

      const token = login.body.data.accessToken;

      const res = await request
        .get("/api/testing/admin")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    test("returns a new access token with valid refresh token", async () => {
      const login = await request
        .post("/api/auth/login")
        .send({ username: user, password: pass });

      const refreshToken = login.body.data.refreshToken;

      const res = await request
        .post("/api/auth/refresh-token")
        .set("x-refresh-token", refreshToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("accessToken");
    });


  });
});
