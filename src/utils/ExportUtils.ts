import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface AttendanceRecord {
  studentName: string;
  nis: string;
  class: string;
  date: string;
  subject: string;
  status: string;
}

/**
 * Export attendance records to PDF
 */
export const exportToPDF = (records: AttendanceRecord[], filename: string = 'attendance-report.pdf') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Laporan Presensi Siswa', 14, 22);
  
  // Add metadata
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, 14, 32);
  
  // Prepare table data
  const tableData = records.map(record => [
    record.studentName,
    record.nis,
    record.class,
    record.date,
    record.subject,
    record.status === 'present' ? 'Hadir' :
    record.status === 'absent' ? 'Tidak Hadir' :
    record.status === 'late' ? 'Terlambat' : 'Sakit'
  ]);
  
  // Add table
  autoTable(doc, {
    head: [['Nama', 'NIS', 'Kelas', 'Tanggal', 'Mata Pelajaran', 'Status']],
    body: tableData,
    startY: 40,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] }, // Blue header
  });
  
  // Save the PDF
  doc.save(filename);
};

/**
 * Export attendance records to Excel
 */
export const exportToExcel = (records: AttendanceRecord[], filename: string = 'attendance-report.xlsx') => {
  // Prepare data for Excel
  const data = records.map(record => ({
    'Nama': record.studentName,
    'NIS': record.nis,
    'Kelas': record.class,
    'Tanggal': record.date,
    'Mata Pelajaran': record.subject,
    'Status': record.status === 'present' ? 'Hadir' :
              record.status === 'absent' ? 'Tidak Hadir' :
              record.status === 'late' ? 'Terlambat' : 'Sakit'
  }));
  
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  const colWidths = [
    { wch: 25 }, // Nama
    { wch: 15 }, // NIS
    { wch: 15 }, // Kelas
    { wch: 12 }, // Tanggal
    { wch: 20 }, // Mata Pelajaran
    { wch: 15 }, // Status
  ];
  ws['!cols'] = colWidths;
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Presensi');
  
  // Save the file
  XLSX.writeFile(wb, filename);
};
