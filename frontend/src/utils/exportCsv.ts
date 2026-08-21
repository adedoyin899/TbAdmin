/**
 * Universal CSV Exporter utility for TalentBridge Admin Portal
 */

export interface CsvColumn<T = any> {
  header: string;
  key?: keyof T | string;
  accessor?: (row: T, index: number) => string | number | boolean | null | undefined;
}

/**
 * Escapes a cell value for standard RFC 4180 CSV compliance
 */
const escapeCsvCell = (value: any): string => {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
};

/**
 * Triggers a browser download of structured data as a CSV file
 */
export function exportToCsv<T = any>({
  filename,
  columns,
  data,
}: {
  filename: string;
  columns: CsvColumn<T>[];
  data: T[];
}): void {
  if (!data || !data.length) {
    console.warn('[exportToCsv] No data available to export.');
    return;
  }

  // 1. Generate Header Row
  const headers = columns.map(col => escapeCsvCell(col.header)).join(',');

  // 2. Generate Data Rows
  const rows = data.map((item, idx) => {
    return columns
      .map(col => {
        let val: any;
        if (col.accessor) {
          val = col.accessor(item, idx);
        } else if (col.key && typeof item === 'object' && item !== null) {
          val = (item as any)[col.key];
        }
        return escapeCsvCell(val);
      })
      .join(',');
  });

  const csvContent = [headers, ...rows].join('\r\n');

  // 3. Create a Blob and trigger download
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');

  const timestamp = new Date().toISOString().slice(0, 10);
  const sanitizedFilename = filename.endsWith('.csv')
    ? filename.replace('.csv', `_${timestamp}.csv`)
    : `${filename}_${timestamp}.csv`;

  downloadLink.setAttribute('href', url);
  downloadLink.setAttribute('download', sanitizedFilename);
  downloadLink.style.visibility = 'hidden';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
