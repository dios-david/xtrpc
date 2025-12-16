import { type } from 'arktype';
import { procedure, router } from './trpc';

// Common API structure implemented with ArkType
export const appRouter = router({
	// Root-level procedure
	health: procedure
		.output(
			type({
				status: 'string',
				timestamp: 'number',
			}),
		)
		.query(() => ({
			status: 'healthy',
			timestamp: Date.now(),
		})),

	// Users sub-router
	users: router({
		list: procedure
			.input(
				type({
					'limit?': 'number',
					'page?': 'number',
				}),
			)
			.output(
				type({
					total: 'number',
					users: type({
						email: 'string',
						id: 'string',
						name: 'string',
						role: '"admin" | "guest" | "user"',
					}).array(),
				}),
			)
			.query(() => ({
				users: [],
				total: 0,
			})),

		get: procedure
			.input(
				type({
					id: 'string',
				}),
			)
			.output(
				type({
					createdAt: 'Date',
					email: 'string',
					id: 'string',
					name: 'string',
					role: '"admin" | "guest" | "user"',
				}),
			)
			.query(({ input }) => ({
				id: input.id,
				name: 'Test User',
				email: 'user@example.com',
				role: 'user' as const,
				createdAt: new Date(),
			})),

		create: procedure
			.input(
				type({
					email: 'string',
					name: 'string',
					password: 'string',
				}),
			)
			.output(
				type({
					createdAt: 'Date',
					id: 'string',
				}),
			)
			.mutation(() => ({
				id: '123',
				createdAt: new Date(),
			})),
	}),

	// Test complex cases
	misc: router({
		create: procedure
			.input(
				type({
					title: 'string',
					'tags?': type({ id: 'string' }).or({ label: 'string' }).array(),
				}),
			)
			.output(
				type({
					id: 'string',
					title: 'string',
				}),
			)
			.mutation(({ input }) => ({
				id: '456',
				title: input.title,
			})),
	}),
});

export type AppRouter = typeof appRouter;
