import { type Node, type SourceFile, ts } from 'ts-morph';
import { getFirstSiblingByKindOrThrow } from './ast';
import { isProcedure, type Predicate } from './predicates';

const PROCEDURE_STUB = '() => undefined as any';
export const CONTEXT_STUB = 'any';
export const MIDDLEWARE_STUB = 't.middleware(({ ctx, next }) => next({ ctx }))';

type Transformer = (node: Node) => (() => Node<ts.Node>)[];

export const getAllTransformers = (
	files: SourceFile[],
	transformers: [Predicate, Transformer][],
	verbose: boolean = false,
) => {
	const results: ReturnType<Transformer> = [];

	let count = 0;

	for (const sourceFile of files) {
		// PropertyAccessExpression nodes: .context, .use, .query, .mutation, .subscription
		for (const node of sourceFile.getDescendantsOfKind(
			ts.SyntaxKind.PropertyAccessExpression,
		)) {
			count++;
			const text = node.getText();
			if (
				text.endsWith('.context') ||
				text.endsWith('.use') ||
				text.endsWith('.query') ||
				text.endsWith('.mutation') ||
				text.endsWith('.subscription')
			) {
				for (const [predicate, transform] of transformers) {
					if (predicate(node)) {
						results.push(...transform(node));
						break;
					}
				}
			}
		}
	}

	if (verbose) {
		console.log(
			`Visited ${count} nodes with ${transformers.length} transformers`,
		);
	}

	return results;
};

export const redefine =
	(text: string): Transformer =>
	(node: Node) => {
		const sibling = getFirstSiblingByKindOrThrow(
			node,
			ts.SyntaxKind.SyntaxList,
		);
		return [() => sibling.replaceWithText(text)];
	};

export const pruneProcedureImplementations: Transformer = (node) => {
	const expr = node
		.getParentOrThrow()
		.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ObjectLiteralExpression);

	return expr
		.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment)
		.flatMap((node) => {
			const [k, _, v] = node.getChildren();
			if (!k || !v) {
				throw new Error('Unexpected router');
			}

			if (v.getKind() === ts.SyntaxKind.CallExpression) {
				return node
					.getDescendantsOfKind(ts.SyntaxKind.PropertyAccessExpression)
					.flatMap((n) => {
						if (isProcedure(n)) {
							return redefine(PROCEDURE_STUB)(n);
						}

						return [];
					});
			}

			return [];
		});
};
