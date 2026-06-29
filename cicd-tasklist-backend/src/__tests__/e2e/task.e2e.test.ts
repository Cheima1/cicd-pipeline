import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import testPrisma from "./setup.js";

vi.mock("../../lib/prisma.js", () => ({
	default: testPrisma,
}));

const { default: app } = await import("../../app.js");
import request from "supertest";

describe("Task API E2E Tests", () => {
	beforeEach(async () => {
		await testPrisma.task.deleteMany();
	});

	afterAll(async () => {
		await testPrisma.$disconnect();
	});

	describe("POST /api/tasks", () => {
		it("should create a new task", async () => {
			const res = await request(app)
				.post("/api/tasks")
				.send({ title: "E2E Task", description: "E2E Description" });

			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty("id");
			expect(res.body.title).toBe("E2E Task");
			expect(res.body.completed).toBe(false);
		});

		it("should return 400 if title is missing", async () => {
			const res = await request(app)
				.post("/api/tasks")
				.send({ description: "No title" });

			expect(res.status).toBe(400);
		});

		it("should return 400 if title is empty", async () => {
			const res = await request(app)
				.post("/api/tasks")
				.send({ title: "   " });

			expect(res.status).toBe(400);
		});
	});

	describe("GET /api/tasks", () => {
		it("should return all tasks", async () => {
			await testPrisma.task.create({ data: { title: "Task 1" } });
			await testPrisma.task.create({ data: { title: "Task 2" } });

			const res = await request(app).get("/api/tasks");

			expect(res.status).toBe(200);
			expect(res.body).toHaveLength(2);
		});

		it("should return empty array when no tasks", async () => {
			const res = await request(app).get("/api/tasks");
			expect(res.status).toBe(200);
			expect(res.body).toHaveLength(0);
		});
	});

	describe("GET /api/tasks/:id", () => {
		it("should return a task by id", async () => {
			const task = await testPrisma.task.create({ data: { title: "Task by ID" } });

			const res = await request(app).get(`/api/tasks/${task.id}`);

			expect(res.status).toBe(200);
			expect(res.body.title).toBe("Task by ID");
		});

		it("should return 404 if task not found", async () => {
			const res = await request(app).get("/api/tasks/99999");
			expect(res.status).toBe(404);
		});

		it("should return 400 if id is invalid", async () => {
			const res = await request(app).get("/api/tasks/abc");
			expect(res.status).toBe(400);
		});
	});

	describe("PUT /api/tasks/:id", () => {
		it("should update a task", async () => {
			const task = await testPrisma.task.create({ data: { title: "Old Title" } });

			const res = await request(app)
				.put(`/api/tasks/${task.id}`)
				.send({ title: "New Title", completed: true });

			expect(res.status).toBe(200);
			expect(res.body.title).toBe("New Title");
			expect(res.body.completed).toBe(true);
		});

		it("should return 404 if task not found", async () => {
			const res = await request(app)
				.put("/api/tasks/99999")
				.send({ title: "New Title" });

			expect(res.status).toBe(404);
		});

		it("should return 400 if id is invalid", async () => {
			const res = await request(app)
				.put("/api/tasks/abc")
				.send({ title: "New Title" });

			expect(res.status).toBe(400);
		});
	});

	describe("DELETE /api/tasks/:id", () => {
		it("should delete a task", async () => {
			const task = await testPrisma.task.create({ data: { title: "To Delete" } });

			const res = await request(app).delete(`/api/tasks/${task.id}`);

			expect(res.status).toBe(204);
		});

		it("should return 404 if task not found", async () => {
			const res = await request(app).delete("/api/tasks/99999");
			expect(res.status).toBe(404);
		});

		it("should return 400 if id is invalid", async () => {
			const res = await request(app).delete("/api/tasks/abc");
			expect(res.status).toBe(400);
		});
	});
});