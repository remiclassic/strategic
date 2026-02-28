import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		publishDate: z.date(),
		category: z.enum(['starter', 'builder', 'scale']),
		heroEmoji: z.string(),
		readTime: z.number(),
	}),
});

export const collections = { blog };
