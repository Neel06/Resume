export type EmployeeSortBy = 'id' | 'name' | 'department' | 'salary'; // the syntax is called UNION TYPE
export type SortDirection = 'asc' | 'desc';

export interface EmployeeQuery {
    pageNumber: number;
    pageSize: number;
    search: string;
    sortBy: EmployeeSortBy;
    sortDirection: SortDirection;
}

export interface PageResult<T> {
    items: T[],
    totalCount: number,
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}
