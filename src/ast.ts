import { type Node, type SourceFile, ts } from 'ts-morph';

export const findNodeOrThrow = (
	sourceFile: SourceFile,
	predicate: (node: Node) => boolean,
	verbose: boolean = false,
) => {
	let count = 0;

	for (const node of sourceFile.getDescendantsOfKind(
		ts.SyntaxKind.Identifier,
	)) {
		count++;
		if (predicate(node)) {
			if (verbose) {
				console.log(`Visited ${count} nodes`);
			}

			return [node, sourceFile] as const;
		}
	}

	if (verbose) {
		console.log(`Visited ${count} nodes`);
	}

	throw new Error('Could not find node with predicate');
};

export const getFirstSiblingByKindOrThrow = (
	node: Node,
	kind: ts.SyntaxKind,
) => {
	for (const sibling of node.getNextSiblings()) {
		if (sibling.getKind() === kind) {
			return sibling;
		}
	}

	throw new Error(`No sibling of kind ${kind.toString()} was found`);
};
