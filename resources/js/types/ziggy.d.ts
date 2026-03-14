declare module 'ziggy-js' {
    export interface RouteName {}
    interface RouteHelper {
        current(name?: string): boolean;
    }
    export function route(): RouteHelper;
    export function route(name: string, params?: any, absolute?: boolean, config?: any): string;
}

declare module '../../vendor/tightenco/ziggy' {
    interface RouteHelper {
        current(name?: string): boolean;
    }
    export function route(): RouteHelper;
    export function route(name: string, params?: any, absolute?: boolean, config?: any): string;
}
