import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../api/taskApi';

const mockTask = {
	id: 1,
	title: 'Test',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('taskApi', () => {
	describe('getTasks', () => {
		it('returns array of tasks', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([mockTask]),
			}));
			const tasks = await getTasks();
			expect(tasks).toEqual([mockTask]);
			expect(fetch).toHaveBeenCalledWith('/api/tasks');
		});

		it('throws on error response', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				text: () => Promise.resolve('Server error'),
			}));
			await expect(getTasks()).rejects.toThrow('HTTP 500');
		});
	});

	describe('getTask', () => {
		it('returns a single task', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockTask),
			}));
			const task = await getTask(1);
			expect(task).toEqual(mockTask);
			expect(fetch).toHaveBeenCalledWith('/api/tasks/1');
		});

		it('throws on error response', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not found'),
			}));
			await expect(getTask(999)).rejects.toThrow('HTTP 404');
		});
	});

	describe('createTask', () => {
		it('creates and returns a task', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockTask),
			}));
			const task = await createTask({ title: 'Test' });
			expect(task).toEqual(mockTask);
			expect(fetch).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({ method: 'POST' }));
		});

		it('throws on error response', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: false,
				status: 400,
				text: () => Promise.resolve('Bad request'),
			}));
			await expect(createTask({ title: '' })).rejects.toThrow('HTTP 400');
		});
	});

	describe('updateTask', () => {
		it('updates and returns a task', async () => {
			const updated = { ...mockTask, completed: true };
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(updated),
			}));
			const task = await updateTask(1, { completed: true });
			expect(task).toEqual(updated);
			expect(fetch).toHaveBeenCalledWith('/api/tasks/1', expect.objectContaining({ method: 'PUT' }));
		});

		it('throws on error response', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not found'),
			}));
			await expect(updateTask(999, { completed: true })).rejects.toThrow('HTTP 404');
		});
	});

	describe('deleteTask', () => {
		it('deletes a task successfully', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
			await expect(deleteTask(1)).resolves.toBeUndefined();
			expect(fetch).toHaveBeenCalledWith('/api/tasks/1', expect.objectContaining({ method: 'DELETE' }));
		});

		it('throws on error response', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not found'),
			}));
			await expect(deleteTask(999)).rejects.toThrow('HTTP 404');
		});
	});
});