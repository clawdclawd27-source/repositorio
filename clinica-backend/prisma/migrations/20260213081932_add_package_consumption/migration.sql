-- CreateTable
CREATE TABLE "ClientPackageConsumption" (
    "id" TEXT NOT NULL,
    "clientPackageId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "consumedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "ClientPackageConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientPackageConsumption_appointmentId_key" ON "ClientPackageConsumption"("appointmentId");

-- AddForeignKey
ALTER TABLE "ClientPackageConsumption" ADD CONSTRAINT "ClientPackageConsumption_clientPackageId_fkey" FOREIGN KEY ("clientPackageId") REFERENCES "ClientPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPackageConsumption" ADD CONSTRAINT "ClientPackageConsumption_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
