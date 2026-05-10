-- CreateTable
CREATE TABLE "Make" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "country" TEXT
);

-- CreateTable
CREATE TABLE "Model" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "makeId" INTEGER NOT NULL,
    CONSTRAINT "Model_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "Make" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Version" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "modelId" INTEGER NOT NULL,
    "horsepower" INTEGER NOT NULL,
    "torque_nm" INTEGER NOT NULL,
    "weight_kg" INTEGER NOT NULL,
    "top_speed_kmh" INTEGER NOT NULL,
    "acc_0_100" REAL NOT NULL,
    "fuel_consumption" REAL NOT NULL,
    "tank_liters" REAL NOT NULL,
    "fuel_type" TEXT NOT NULL DEFAULT 'gasoline',
    "price_br" REAL,
    "price_us" REAL,
    "market" TEXT NOT NULL DEFAULT 'BOTH',
    "category" TEXT NOT NULL DEFAULT 'sedan',
    "eq_abs" BOOLEAN NOT NULL DEFAULT false,
    "eq_airbags" INTEGER NOT NULL DEFAULT 0,
    "eq_leather" BOOLEAN NOT NULL DEFAULT false,
    "eq_sunroof" BOOLEAN NOT NULL DEFAULT false,
    "eq_apple_carplay" BOOLEAN NOT NULL DEFAULT false,
    "eq_navigation" BOOLEAN NOT NULL DEFAULT false,
    "eq_premium_audio" BOOLEAN NOT NULL DEFAULT false,
    "eq_heated_seats" BOOLEAN NOT NULL DEFAULT false,
    "eq_wireless_charge" BOOLEAN NOT NULL DEFAULT false,
    "eq_hud" BOOLEAN NOT NULL DEFAULT false,
    "eq_lane_assist" BOOLEAN NOT NULL DEFAULT false,
    "eq_auto_brake" BOOLEAN NOT NULL DEFAULT false,
    "eq_blind_spot" BOOLEAN NOT NULL DEFAULT false,
    "eq_adaptive_cruise" BOOLEAN NOT NULL DEFAULT false,
    "eq_launch_control" BOOLEAN NOT NULL DEFAULT false,
    "eq_awd" BOOLEAN NOT NULL DEFAULT false,
    "eq_air_suspension" BOOLEAN NOT NULL DEFAULT false,
    "eq_digital_cockpit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Version_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Make_name_key" ON "Make"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Model_name_makeId_key" ON "Model"("name", "makeId");
