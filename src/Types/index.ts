export type Area = 'tienda' | 'pista';

export interface Task {
    id: string;
    text: string;
    area: Area;
}