export interface VehicleImage {
  url: string;
  alt: string;
  order: number;
}

export type BodyType = "Sedan" | "Hatchback" | "SUV" | "Ute" | "Van" | "Performance";
export type Transmission = "Automatic" | "Manual" | "CVT";
export type FuelType = "Petrol" | "Diesel" | "Hybrid" | "PHEV" | "EV";
export type DriveType = "FWD" | "RWD" | "AWD" | "4WD";
export type ImportStatus = "NZ New" | "Used Import" | "Ex-Lease";
export type Condition = "Excellent" | "Very Good" | "Good";
export type VehicleStatus = "Available" | "Reserved" | "Sold" | "Incoming";

export interface Vehicle {
  id: string;
  slug: string;
  make: string;
  model: string;
  variant?: string;
  year: number;
  bodyType: BodyType;
  price: number;
  priceNote?: "Drive Away" | "Plus On-Road Costs" | "Negotiable";
  odometerKm: number;
  transmission: Transmission;
  fuelType: FuelType;
  engineSizeCc?: number;
  driveType: DriveType;
  colour: string;
  doors?: number;
  seats?: number;
  vin: string;
  importStatus: ImportStatus;
  condition: Condition;
  features: string[];
  images: VehicleImage[];
  description: string;
  location: string;
  status: VehicleStatus;
  inspectionReportUrl?: string;
  financeEligible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleEnquiry {
  vehicleId: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  preferredContactMethod: "Phone" | "Email";
  enquiryType: "General" | "Pricing" | "Availability" | "Finance Interest";
  consentToContact: boolean;
  source: string;
}

export interface TestDriveBooking {
  vehicleId?: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: "Morning" | "Afternoon" | "Evening";
  location: string;
  hasTradeIn: boolean;
  licenceConfirmed: boolean;
}

export interface FinanceApplication {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  employmentStatus: "Full-Time" | "Part-Time" | "Self-Employed" | "Other";
  employerName?: string;
  monthlyIncome: number;
  timeInRoleMonths: number;
  vehicleId?: string;
  desiredLoanAmount: number;
  depositAmount: number;
  termMonths: 12 | 24 | 36 | 48 | 60;
  hasTradeIn: boolean;
  creditCheckConsent: boolean;
  termsAccepted: boolean;
}

export interface TradeInSubmission {
  name: string;
  email: string;
  phone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  odometerKm: number;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  outstandingFinance: boolean;
  photoUrls?: string[];
  preferredContactMethod: "Phone" | "Email";
}
