declare module 'deepdash/standalone' {
  type ObjNode = {
    value: unknown
    key: number | string
    path: string
    parent?: ObjNode
  }

  type IterateeContext<Obj> = {
    path: string
    parent?: ObjNode
    parents: ObjNode[]
    obj: Obj
    depth: number
  }

  type ReduceIteratee<T, K> = (
    acc: K,
    value: unknown,
    key: number | string,
    parentValue: unknown | undefined,
    context: IterateeContext<T>,
  ) => K

  type Iteratee<T> = (
    value: unknown,
    key: number | string,
    parentValue: unknown | undefined,
    context: IterateeContext<T>,
  ) => void | false

  export function reduceDeep<T, K>(
    obj: T,
    iteratee: ReduceIteratee<T, K>,
    acc: K,
  ): K

  export function eachDeep<T>(obj: T, iteratee: Iteratee<T>): void
}

declare module 'node-stream-zip' {
  export default class StreamZip {
    public constructor(options: { file: string; storeEntries: boolean })

    public on(event: 'ready', handler: () => void): void

    public on(event: 'error', handler: (error: string) => void): void

    public entryDataSync(name: string): string

    public stream(
      ref: string,
      handler: (error: string, stream: NodeJS.ReadStream) => void,
    ): void

    public close(): void
  }
}

declare module 'probe-image-size' {
  type ProbeImageSize = (
    input: NodeJS.ReadStream,
  ) => Promise<{ width: number; height: number }>
  const probeImageSize: ProbeImageSize
  export default probeImageSize
}
