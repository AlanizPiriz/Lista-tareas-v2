export type Area = 'tienda' | 'pista';

export type Section = 'tareas' | 'mantenimiento';

export interface Task {
    id: string;
    text: string;
    area: Area;
    fecha?: string;
    section: Section;
    createdAt?: any;
}