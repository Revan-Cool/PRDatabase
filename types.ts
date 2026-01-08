
export type ColumnType = 'string' | 'number' | 'date' | 'boolean';

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
}

export interface Table {
  id: string;
  name: string;
  columns: Column[];
  rows: Record<string, any>[];
  icon: string;
}

export interface Database {
  id: string;
  name: string;
  tables: Table[];
}
