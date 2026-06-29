import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
	it('renders create form by default', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		expect(screen.getByTestId('task-form')).toBeInTheDocument();
		expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
		expect(screen.getByText('Ajouter')).toBeInTheDocument();
	});

	it('renders edit form when mode is edit', () => {
		render(<TaskForm onSubmit={vi.fn()} mode="edit" />);
		expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
		expect(screen.getByText('Modifier')).toBeInTheDocument();
	});

	it('submits form with title', () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);
		fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'Ma tâche' } });
		fireEvent.submit(screen.getByTestId('task-form'));
		expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: 'Ma tâche' }));
	});

	it('shows validation error if title is empty', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		fireEvent.submit(screen.getByTestId('task-form'));
		expect(screen.getByRole('alert')).toBeInTheDocument();
	});

	it('calls onCancel when cancel button clicked', () => {
		const onCancel = vi.fn();
		render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);
		fireEvent.click(screen.getByText('Annuler'));
		expect(onCancel).toHaveBeenCalled();
	});

	it('renders with initial values', () => {
		render(<TaskForm onSubmit={vi.fn()} initialValues={{ title: 'Initial', description: 'Desc' }} />);
		expect(screen.getByDisplayValue('Initial')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Desc')).toBeInTheDocument();
	});
});