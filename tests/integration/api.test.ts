jest.setTimeout(30000); // Increase timeout to 30 seconds
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import request from "supertest";
import { Product } from "../../src/types/product";
import app from "../../src/index";

const prisma = new PrismaClient();

let authTokenAdmin: string;
let adminId: string;
let authTokenUser: string;
let createdProductId: string;
let userId: string;

const login = async (email: string, password: string, role: string) => {
  const res = await request(app).post("/api/user/login").send({
    email,
    password,
    role,
  });
  expect(res.statusCode).toBe(200);
  return res.body.accessToken;
};

beforeAll(async () => {
  try {
    // Clean up existing test data
    await prisma.user.deleteMany({ where: { email: "test@example.com" } });

    // Create test user
    const hashedPassword = await argon2.hash("hashedpassword");
    const user = await prisma.user.create({
      data: {
        email: "testuser@example.com",
        password: hashedPassword,
        name: "Test User",
        role: "USER",
      },
    });
    userId = user.id;

    // Create test admin
    const admin = await prisma.user.create({
      data: {
        email: "testadmin@example.com",
        password: hashedPassword,
        name: "Test Admin",
        role: "ADMIN",
      },
    });
    adminId = admin.id;

    // Login user
    const res = await request(app).post("/api/user/login").send({
      email: "testuser@example.com",
      password: "hashedpassword",
      role: "USER",
    });
    authTokenUser = res.body.accessToken;

    // Login admin
    const resAdmin = await request(app).post("/api/user/login").send({
      email: "testadmin@example.com",
      password: "hashedpassword",
      role: "ADMIN",
    });
    authTokenAdmin = resAdmin.body.accessToken;
  } catch (error) {
    console.error("Setup failed:", error);
    throw error;
  }
});

afterAll(async () => {
  await prisma.user.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.$disconnect();
});

// USER AUTHENTICATION TESTS

describe("User Authentication", () => {
  test("POST /api/user/register - Register a new user", async () => {
    const res = await request(app).post("/api/user/register").send({
      email: "newuser1@example.com",
      password: "password123",
      name: "New User",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      message: "User created successfully",
      registerUser: {
        id: expect.any(String),
        email: "newuser1@example.com",
        name: "New User",
        password: expect.any(String), // Changed from specific regex to any string
        role: "USER",
        createdAt: expect.any(String), // Changed from Date to String
      },
    });

    // Additional checks
    expect(res.body.registerUser.password).toMatch(/^\$argon2id\$/); // Check if it's an Argon2 hash
    expect(new Date(res.body.registerUser.createdAt)).toBeInstanceOf(Date); // Ensure createdAt can be parsed as a Date
  });

  test("POST /api/user/register-admin - Register a admin", async () => {
    const res = await request(app).post("/api/user/register-admin").send({
      email: "newuser1@example.com",
      password: "password123",
      name: "New User",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      message: "Admin created successfully",
    });
  });

  test("POST /api/user/register - Try to Register with same email", async () => {
    const res = await request(app).post("/api/user/register").send({
      email: "newuser1@example.com",
      password: "password123",
      name: "New User",
    });
    expect(res.statusCode).toBe(405);
    expect(res.body).toMatchObject({
      message: "You are not allowed to registered for the same role again",
    });
  });

  test("POST /api/user/register-admin - Try to Register with same email", async () => {
    const res = await request(app).post("/api/user/register-admin").send({
      email: "newuser1@example.com",
      password: "password123",
      name: "New User",
    });
    expect(res.statusCode).toBe(405);
    expect(res.body).toMatchObject({
      message: "You are not allowed to registered for the same role again",
    });
  });

  test("POST /api/user/login - Login user", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: "newuser1@example.com",
      password: "password123",
      role: "USER",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      message: "Hello newuser1@example.com you are successfully logged in", // Removed extra 'y'
      accessToken: expect.any(String),
    });
  });

  test("POST /api/user/login - Login user", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: "newuser1@example.com",
      password: "password123",
      role: "ADMIN",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      message: "Hello newuser1@example.com you are successfully logged in", // Removed extra 'y'
      accessToken: expect.any(String),
    });
  });

  test("POST /api/user/login - Login with incorrect email", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: "newus@example.com",
      password: "password123",
      role: "USER",
    });
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({
      message: "USER NOT FOUND",
    });
  });

  test("POST /api/user/login - Login with incorrect password", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: "newuser1@example.com",
      password: "wrongpassword",
      role: "USER",
    });
    expect(res.statusCode).toBe(401);
  });

  test("POST /api/user/logout - Logout user", async () => {
    const res = await request(app)
      .post("/api/user/logout")
      .set("Authorization", `Bearer ${authTokenUser}`);
    expect(res.statusCode).toBe(200);
  });

  test("POST /api/user/logout - Logout user", async () => {
    const res = await request(app)
      .post("/api/user/logout")
      .set("Authorization", `Bearer ${authTokenAdmin}`);
    expect(res.statusCode).toBe(200);
  });
});

// PORDUCTS TEST CASES

describe("Products ", () => {
  test("GET /api/products - Get all products", async () => {
    const res = await request(app).get("/api/products");
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      products: expect.any(Array),
    });
    expect(res.body.products.length).toBeGreaterThan(0);
    expect(res.body.products[0]).toHaveProperty("id");
    expect(res.body.products[0]).toHaveProperty("title");
    expect(res.body.products[0]).toHaveProperty("description");
    expect(res.body.products[0]).toHaveProperty("price");
    expect(res.body.products[0]).toHaveProperty("image");
  });

  test("GET /api/product/:id - Get each specific product", async () => {
    const allProductsRes = await request(app).get("/api/products");
    expect(allProductsRes.statusCode).toBe(200);
    expect(allProductsRes.body).toHaveProperty("products");
    expect(Array.isArray(allProductsRes.body.products)).toBeTruthy();

    const products = allProductsRes.body.products;

    // test fetching each product individually
    for (const product of products) {
      const res = await request(app).get(`/api/product/${product.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        product: {
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          image: product.image,
          published: product.published,
          createAt: product.createAt,
          updatedAt: product.updatedAt,
        },
      });

      // Additional checks to ensure all fields are present and of the correct type
      expect(typeof res.body.product.id).toBe("string");
      expect(typeof res.body.product.title).toBe("string");
      expect(typeof res.body.product.description).toBe("string");
      expect(typeof res.body.product.price).toBe("number");
      expect(typeof res.body.product.image).toBe("string");
      expect(typeof res.body.product.publishedAt).toBe("boolean");
      expect(typeof res.body.product.createdAt).toBe("string");
      expect(typeof res.body.product.updatedAt).toBe("string");
    }
  });
});

// PRODUCTS OPERATIONS TEST CASES

describe("Product Operations", () => {
  beforeEach(async () => {
    // Login before each test to ensure fresh tokens
    authTokenAdmin = await login(
      "testadmin@example.com",
      "testpassword",
      "ADMIN"
    );
    authTokenUser = await login("testuser@example.com", "testpassword", "USER");
  });

  test("POST /api/product/create - Create a new product", async () => {
    const newProduct = {
      title: "Product 1",
      description: "This is the test product 1",
      price: 200,
      image: "Image",
    };

    const res = await request(app)
      .post("/api/product/create")
      .set("Authorization", `Bearer ${authTokenAdmin}`)
      .send(newProduct);

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      message: "Product created successfully",
      product: {
        id: expect.any(String),
        title: "Product 1",
        description: "This is the test product 1",
        price: 200,
        image: "Image",
        published: false,
        createAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    });

    createdProductId = res.body.product.id;
  });

  test("PUT /api/product/:id - Change product status", async () => {
    const res = await request(app)
      .put(`/api/product/${createdProductId}`)
      .set("Authorization", `Bearer ${authTokenAdmin}`)
      .send({ status: true });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      message: "Product status changed successfully",
      product: {
        id: createdProductId,
        title: "Product 1",
        description: "This is the test product 1",
        price: 200,
        image: "Image",
        published: true,
        createAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    });
  });

  test("POST /api/product/create - Attempt to create product without admin rights", async () => {
    // Assuming you have a non-admin user token
    const newProduct = {
      title: "Unauthorized Product",
      description: "This should not be created",
      price: 100,
      image: "Image",
    };

    const res = await request(app)
      .post("/api/product/create")
      .set("Authorization", `Bearer ${authTokenUser}`) // Use a non-admin token
      .send(newProduct);

    expect(res.statusCode).toBe(403);
    expect(res.body).toMatchObject({ message: "Unauthorized access" });
  });

  test("PUT /api/product/:id - Attempt to change product status without admin rights", async () => {
    const res = await request(app)
      .put(`/api/product/${createdProductId}`)
      .set("Authorization", `Bearer ${authTokenUser}`) // Use a non-admin token
      .send({ status: false });

    expect(res.statusCode).toBe(403);
    expect(res.body).toMatchObject({ message: "Unauthorized access" });
  });

  test("PUT /api/product/:id - Attempt to change status of non-existent product", async () => {
    const nonExistentId = "non_existent_id";
    const res = await request(app)
      .put(`/api/product/${nonExistentId}`)
      .set("Authorization", `Bearer ${authTokenAdmin}`)
      .send({ status: true });

    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({ message: "PRODUCT NOT FOUND" });
  });
});
