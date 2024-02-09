type GroupedValues<T extends PropertyKey, V> = {
    [K in T]: V
};

export function groupItemsBy<T, P extends PropertyKey>(items: T[], groupingKey: keyof T, enu: Record<string, string>): GroupedValues<P, T[]> {
    const result: GroupedValues<P, T[]> = Object.values(enu).reduce((a: GroupedValues<P, T[]>, b) => {
        a[b as P] = [];
        return a;
    }, {} as GroupedValues<P, T[]>);

    items.forEach(i => {
        const key = i[groupingKey] as unknown as P;
        result[key].push(i);
    });

    return result;
}