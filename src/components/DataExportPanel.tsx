import React from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenses } from '@/contexts/ExpenseContext';
import { useHabits } from '@/contexts/HabitContext';
import { CATEGORIES, calculateCategoryTotal, calculateMonthTotal, type ExpenseItem } from '@/data/expenseData';
import { toast } from 'sonner';

const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

const downloadFile = (content: BlobPart, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const escapePdfText = (text: string) => text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const createSimplePdf = (lines: string[]) => {
  const linesPerPage = 38;
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += linesPerPage) pages.push(lines.slice(i, i + linesPerPage));

  const objects: string[] = ['<< /Type /Catalog /Pages 2 0 R >>'];
  const pageObjectNumbers: number[] = [];
  const contentObjectNumbers: number[] = [];
  objects.push('');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  pages.forEach((pageLines) => {
    const content = [
      'BT',
      '/F1 11 Tf',
      '50 790 Td',
      '14 TL',
      ...pageLines.map((line, index) => `${index === 0 ? '' : 'T* '}(${escapePdfText(line.slice(0, 92))}) Tj`),
      'ET',
    ].join('\n');
    const contentNumber = objects.length + 1;
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const pageNumber = objects.length + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentNumber} 0 R >>`);
    contentObjectNumbers.push(contentNumber);
    pageObjectNumbers.push(pageNumber);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((num) => `${num} 0 R`).join(' ')}] /Count ${pageObjectNumbers.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Uint8Array([...pdf].map((char) => char.charCodeAt(0)));
};

export const DataExportPanel: React.FC = () => {
  const { expenses, availableYears } = useExpenses();
  const { habits } = useHabits();

  const exportExpensesCsv = () => {
    const rows = [['Year', 'Month', 'Category', 'Description', 'Amount INR']];
    availableYears.forEach((year) => {
      const yearData = expenses[year];
      if (!yearData) return;
      Object.entries(yearData).forEach(([month, monthData]) => {
        Object.entries(CATEGORIES).forEach(([key, category]) => {
          const values = monthData[key as keyof typeof monthData];
          if (!values.length) return;
          if (typeof values[0] === 'number') {
            (values as number[]).forEach((amount, index) => rows.push([String(year), month, category.label, `${category.label} #${index + 1}`, String(amount)]));
          } else {
            (values as ExpenseItem[]).forEach((item) => rows.push([String(year), month, category.label, item.desc || category.label, String(item.amount)]));
          }
        });
      });
    });
    downloadFile(rows.map((row) => row.map(csvCell).join(',')).join('\n'), 'habex-expense-report.csv', 'text/csv;charset=utf-8');
    toast.success('Expense CSV downloaded');
  };

  const exportHabitsCsv = () => {
    const rows = [['Habit', 'Category', 'Frequency', 'Best Streak', 'Completions', 'Completed Dates']];
    habits.forEach((habit) => rows.push([
      habit.name,
      habit.category,
      habit.frequency,
      String(habit.bestStreak),
      String(habit.completedDates.length),
      habit.completedDates.join(' | '),
    ]));
    downloadFile(rows.map((row) => row.map(csvCell).join(',')).join('\n'), 'habex-habit-history.csv', 'text/csv;charset=utf-8');
    toast.success('Habit CSV downloaded');
  };

  const exportPdf = () => {
    const lines = ['Habex Expense & Habit Report', `Generated: ${new Date().toLocaleString()}`, ''];
    availableYears.forEach((year) => {
      const yearData = expenses[year];
      if (!yearData) return;
      const total = Object.values(yearData).reduce((sum, month) => sum + calculateMonthTotal(month), 0);
      lines.push(`${year} expense total: INR ${total.toLocaleString()}`);
      Object.entries(CATEGORIES).forEach(([key, category]) => {
        const categoryTotal = Object.values(yearData).reduce((sum, month) => sum + calculateCategoryTotal(month[key as keyof typeof month]), 0);
        if (categoryTotal > 0) lines.push(`- ${category.label}: INR ${categoryTotal.toLocaleString()}`);
      });
      lines.push('');
    });
    lines.push('Habit History');
    if (!habits.length) lines.push('No habits recorded yet.');
    habits.forEach((habit) => {
      lines.push(`${habit.icon} ${habit.name} | ${habit.category} | ${habit.completedDates.length} completions | best streak ${habit.bestStreak}`);
    });
    downloadFile(createSimplePdf(lines), 'habex-report.pdf', 'application/pdf');
    toast.success('PDF report downloaded');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="w-5 h-5" />
          Export Data
        </CardTitle>
        <CardDescription>Download expense reports and habit history for your records</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Button variant="outline" onClick={exportExpensesCsv} className="justify-start gap-2">
          <Table className="h-4 w-4" />
          Expenses CSV
        </Button>
        <Button variant="outline" onClick={exportHabitsCsv} className="justify-start gap-2">
          <Table className="h-4 w-4" />
          Habits CSV
        </Button>
        <Button onClick={exportPdf} className="justify-start gap-2">
          <FileText className="h-4 w-4" />
          PDF Report
        </Button>
      </CardContent>
    </Card>
  );
};
