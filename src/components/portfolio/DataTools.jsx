import React, { useRef } from 'react';
import { useSavedItems } from '../../hooks/useSavedItems';
import { FaFileExport, FaFileImport, FaFileCsv } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function DataTools() {
    const { items, importItems } = useSavedItems();
    const fileInputRef = useRef(null);

    const handleExportJSON = () => {
        if (items.length === 0) {
            toast.error('No items to export.');
            return;
        }
        const dataStr = JSON.stringify(items, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `satoshi-portfolio-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Portfolio exported as JSON!');
    };

    const handleExportCSV = () => {
        if (items.length === 0) {
            toast.error('No items to export.');
            return;
        }

        // Generate CSV
        const headers = ['Name', 'Price', 'Currency', 'Sats', 'Category', 'Date Added'];
        const rows = items.map(item => [
            `"${item.name.replace(/"/g, '""')}"`,
            item.price,
            item.currency.toUpperCase(),
            item.sats,
            item.category || '',
            item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : '',
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `satoshi-portfolio-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Portfolio exported as CSV!');
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                importItems(json);
                e.target.value = '';
            } catch (error) {
                console.error('Import error:', error);
                toast.error('Failed to parse JSON file.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex items-center gap-1 bg-neutral-950/50 p-1 rounded-lg border border-white/5">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
            />

            {/* JSON Export */}
            <button
                onClick={handleExportJSON}
                className="p-2 text-neutral-400 hover:text-brand-orange hover:bg-neutral-800 rounded-md transition-colors"
                title="Export as JSON (Backup)"
            >
                <FaFileExport />
            </button>

            {/* CSV Export */}
            <button
                onClick={handleExportCSV}
                className="p-2 text-neutral-400 hover:text-brand-orange hover:bg-neutral-800 rounded-md transition-colors"
                title="Export as CSV"
            >
                <FaFileCsv />
            </button>

            <div className="w-px h-4 bg-white/10 mx-1"></div>

            {/* Import */}
            <button
                onClick={handleImportClick}
                className="p-2 text-neutral-400 hover:text-brand-orange hover:bg-neutral-800 rounded-md transition-colors"
                title="Import Portfolio (Restore)"
            >
                <FaFileImport />
            </button>
        </div>
    );
}
