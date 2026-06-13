export function slugify(text: string): string {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Decomposes accented characters (e.g. á -> a + ´)
        .replace(/[\u0300-\u036f]/g, '') // Removes the accent markings
        .replace(/\s+/g, '-') // Replaces spaces with hinfens (-)
        .replace(/[^\w\-]+/g, '') // Removes all non-word characters except hinfens
        .replace(/\-\-+/g, '-') // Replaces multiple consecutive hinfens with a single one
        .replace(/^-+/, '') // Trims leading hinfens
        .replace(/-+$/, ''); // Trims trailing hinfens
}
