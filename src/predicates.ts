import { type Node, ts } from 'ts-morph';

export type Predicate = (node: Node) => boolean;

export const isContext: Predicate = (node) =>
	node.getKind() === ts.SyntaxKind.PropertyAccessExpression &&
	node.getText().endsWith('.context');

export const isMiddleware: Predicate = (node) =>
	node.getKind() === ts.SyntaxKind.PropertyAccessExpression &&
	node.getText().endsWith('.use');

export const isProcedure: Predicate = (node) =>
	node.getKind() === ts.SyntaxKind.PropertyAccessExpression &&
	(node.getText().endsWith('.query') ||
		node.getText().endsWith('.mutation') ||
		node.getText().endsWith('.subscription'));

export const isRouter: Predicate = (node) =>
	node.getKind() === ts.SyntaxKind.Identifier &&
	node.getParent()?.getKind() === ts.SyntaxKind.CallExpression &&
	node.getText() === 'router';

export const isAppRouterName =
	(text: string): Predicate =>
	(node) =>
		node.getKind() === ts.SyntaxKind.Identifier &&
		node.getParent()?.getKind() === ts.SyntaxKind.TypeAliasDeclaration &&
		node.getText() === text;
