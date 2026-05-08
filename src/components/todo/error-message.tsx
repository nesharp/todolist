"use client";

export function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="mb-4 text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

