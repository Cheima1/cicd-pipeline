import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../hooks/useTasks';
import * as taskApi from '../api/taskApi';

vi.mock('../api/taskApi');

const mockTask = {
	id: 1,
	title: 'Test',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe('useTasks', () => {
	it('loads tasks on mount', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
		const { result } = renderHook(() => useTasks());
		await act(async () => {});
		expect(result.current.tasks).toEqual([mockTask]);
		expect(result.current.loading).toBe(false);
	});

	it('sets error on load failure', async () => {
		vi.mocked(taskApi.getTasks).mockRejectedValue(new Error('Erreur réseau'));
		const { result } = renderHook(() => useTasks());
		await act(async () => {});
		expect(result.current.error).toBe('Erreur réseau');
	});

	it('adds a task', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([]);
		vi.mocked(taskApi.createTask).mockResolvedValue(mockTask);
		const { result } = renderHook(() => useTasks());
		await act(async () => {});
		await act(async () => {
			await result.current.addTask({ title: 'Test' });
		});
		expect(result.current.tasks).toContainEqual(mockTask);
	});

	it('edits a task', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
		const updated = { ...mockTask, title: 'Modifié' };
		vi.mocked(taskApi.updateTask).mockResolvedValue(updated);
		const { result } = renderHook(() => useTasks());
		await act(async () => {});
		await act(async () => {
			await result.current.editTask(1, { title: 'Modifié' });
		});
		expect(result.current.tasks[0].title).toBe('Modifié');
	});

	it('removes a task', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
		vi.mocked(taskApi.deleteTask).mockResolvedValue(undefined);
		const { result } = renderHook(() => useTasks());
		await act(async () => {});
		await act(async () => {
			await result.current.removeTask(1);
		});
		expect(result.current.tasks).toHaveLength(0);
	});

	it('toggles task completion', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
		const toggled = { ...mockTask, completed: true };
		vi.mocked(taskApi.updateTask).mockResolvedValue(toggled);
		const { result } = renderHook(() => useTasks());
		await act(async () => {});
		await act(async () => {
			await result.current.toggleComplete(1);
		});
		expect(result.current.tasks[0].completed).toBe(true);
	});

	it('does nothing when toggling non-existent task', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
		const { result } = renderHook(() => useTasks());
		await act(async () => {});
		await act(async () => {
			await result.current.toggleComplete(999);
		});
		expect(taskApi.updateTask).not.toHaveBeenCalled();
	});
});