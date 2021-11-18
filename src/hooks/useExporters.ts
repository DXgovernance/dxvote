import jsonexport, { UserOptions } from 'jsonexport';

export default function useExporters<T>() {
  const exportToCSV = async (rows: T[], config?: UserOptions) => {
    return jsonexport(rows, config);
  };

  const triggerDownload = (
    content: string,
    fileName: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return {
    exportToCSV,
    triggerDownload,
  };
}
