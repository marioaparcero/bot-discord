export interface Event {
    event: string
    once: boolean
    rest?: boolean
    run: (...args: unknown[]) => void
}