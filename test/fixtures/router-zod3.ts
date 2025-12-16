import { z } from 'zod3';
import { procedure, router } from './trpc';

// Common API structure implemented with Zod v3
export const appRouter = router({
	// Root-level procedure
	health: procedure
		.output(
			z.object({
				status: z.string(),
				timestamp: z.number(),
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
				z.object({
					limit: z.number().optional(),
					page: z.number().optional(),
				}),
			)
			.output(
				z.object({
					users: z.array(
						z.object({
							email: z.string(),
							id: z.string(),
							name: z.string(),
							role: z.enum(['admin', 'guest', 'user']),
						}),
					),
					total: z.number(),
				}),
			)
			.query(() => ({
				users: [],
				total: 0,
			})),

		get: procedure
			.input(z.object({ id: z.string() }))
			.output(
				z.object({
					email: z.string(),
					id: z.string(),
					name: z.string(),
					role: z.enum(['admin', 'guest', 'user']),
					createdAt: z.date(),
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
				z.object({
					email: z.string(),
					name: z.string(),
					password: z.string(),
				}),
			)
			.output(
				z.object({
					id: z.string(),
					createdAt: z.date(),
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
				z.object({
					title: z.string(),
					tags: z
						.array(
							z.union([
								z.object({ id: z.string() }),
								z.object({ label: z.string() }),
							]),
						)
						.optional(),
					metadata: z
						.object({
							description: z.string().nullable(),
						})
						.optional(),
				}),
			)
			.output(
				z.object({
					id: z.string(),
					title: z.string(),
				}),
			)
			.mutation(({ input }) => ({
				id: '456',
				title: input.title,
			})),
	}),
});

export type AppRouter = typeof appRouter;
