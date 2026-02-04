"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";

export function CsvUploader() {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setMessage("");
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setMessage("");
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        if (!user) {
            setMessage("Please log in to upload.");
            return;
        }

        setUploading(true);
        setMessage("Uploading... (Simulation)");

        // Simulate upload delay
        setTimeout(() => {
            setUploading(false);
            setMessage(`Successfully uploaded ${file.name} for user ${user.name}`);
            setFile(null);
        }, 1500);

        // TODO: Implement actual API call
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Upload Trades</h2>

            <div
                className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <p className="text-zinc-500 dark:text-zinc-400 mb-2">Drag and drop your CSV file here</p>
                <p className="text-xs text-zinc-400 mb-4">or</p>

                <label className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded cursor-pointer transition-colors">
                    Browse Files
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </label>
            </div>

            {file && (
                <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{file.name}</span>
                    <button
                        onClick={() => setFile(null)}
                        className="text-red-500 hover:text-red-700 text-sm"
                    >
                        Remove
                    </button>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`w-full mt-4 py-2 px-4 rounded font-medium text-white transition-colors ${!file || uploading
                        ? "bg-zinc-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
            >
                {uploading ? "Uploading..." : "Upload CSV"}
            </button>

            {message && (
                <p className={`mt-3 text-sm text-center ${message.includes("Success") ? "text-green-600" : "text-zinc-600"}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
