-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppPreference" (
    "id" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "updatedAt" DATETIME NOT NULL,

    CONSTRAINT "AppPreference_pkey" PRIMARY KEY ("id")
);
