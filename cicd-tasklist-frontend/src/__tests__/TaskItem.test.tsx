import { render, screen, fireEvent} from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const mockTask: Task = {
	id: 1,
	title: 'Test Task',
	description: 'Test description',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

describe('TaskItem', () => {
	it('renders task title and description', () => {
		render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
		expect(screen.getByText('Test Task')).toBeInTheDocument();
		expect(screen.getByText('Test description')).toBeInTheDocument();
	});

	it('renders task without description', () => {
		render(<TaskItem task={{ ...mockTask, description: null }} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
		expect(screen.getByText('Test Task')).toBeInTheDocument();
	});

	it('renders completed task', () => {
		render(<TaskItem task={{ ...mockTask, completed: true }} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
		const checkbox = screen.getByRole('checkbox');
		expect(checkbox).toBeChecked();
	});

	it('calls onToggle when checkbox clicked', () => {
		const onToggle = vi.fn();
		render(<TaskItem task={mockTask} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />);
		fireEvent.click(screen.getByRole('checkbox'));
		expect(onToggle).toHaveBeenCalledWith(1);
	});

	it('enters edit mode when edit button clicked', () => {
		render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
		fireEvent.click(screen.getByTitle('Modifier'));
		expect(screen.getByLabelText('Modifier le titre')).toBeInTheDocument();
	});

	it('calls onEdit when save button clicked', () => {
		const onEdit = vi.fn();
		render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
		fireEvent.click(screen.getByTitle('Modifier'));
		fireEvent.change(screen.getByLabelText('Modifier le titre'), { target: { value: 'Nouveau titre' } });
		fireEvent.click(screen.getByText('Enregistrer'));
		expect(onEdit).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'Nouveau titre' }));
	});

	it('does not call onEdit if title is empty', () => {
		const onEdit = vi.fn();
		render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
		fireEvent.click(screen.getByTitle('Modifier'));
		fireEvent.change(screen.getByLabelText('Modifier le titre'), { target: { value: '' } });
		fireEvent.click(screen.getByText('Enregistrer'));
		expect(onEdit).not.toHaveBeenCalled();
	});

	it('cancels edit mode', () => {
		render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
		fireEvent.click(screen.getByTitle('Modifier'));
		fireEvent.click(screen.getByText('Annuler'));
		expect(screen.getByText('Test Task')).toBeInTheDocument();
	});

	it('calls onDelete on second delete click', () => {
		const onDelete = vi.fn();
		render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />);
		fireEvent.click(screen.getByTitle('Supprimer'));
		fireEvent.click(screen.getByTitle('Supprimer'));
		expect(onDelete).toHaveBeenCalledWith(1);
	});
});