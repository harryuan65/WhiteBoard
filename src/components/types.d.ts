import { Keys, MODES } from './constants';

export type ElementType<T extends ReadonlyArray<unknown>> =
  T extends ReadonlyArray<infer ElementType> ? ElementType : never;

export type KeyType = ElementType<typeof Keys>; // this is correctly inferred as literal "A" | "B"

export type DrawMode = typeof MODES[keyof typeof MODES];
