"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg",
          title: "text-gray-900 dark:text-white font-medium",
          description: "text-gray-600 dark:text-gray-300 text-sm",
          actionButton: "bg-blue-500 text-white",
          cancelButton: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
          success:
            "!bg-green-50 dark:!bg-green-900/20 !border-green-200 dark:!border-green-800",
          error:
            "!bg-red-50 dark:!bg-red-900/20 !border-red-200 dark:!border-red-800",
          warning:
            "!bg-yellow-50 dark:!bg-yellow-900/20 !border-yellow-200 dark:!border-yellow-800",
          info:
            "!bg-blue-50 dark:!bg-blue-900/20 !border-blue-200 dark:!border-blue-800",
        },
      }}
      expand={false}
      richColors
      closeButton
    />
  );
}
