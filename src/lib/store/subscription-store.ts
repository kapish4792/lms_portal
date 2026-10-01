import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  seatAllowance: number;
  storageGb: number;
  features: string[];
  status: "active" | "draft" | "archived";
  badge?: string;
  createdAt: string;
}

export interface OrgSubscription {
  orgName: string;
  planId: string;
  billingCycle: "monthly" | "annual";
  status: "active" | "trial" | "past_due" | "canceled";
  renewalDate: string;
  seatsAllocated: number;
  seatsUsed: number;
  storageGbAllocated: number;
  storageGbUsed: number;
  accountManager: string;
  paymentMethod: {
    brand: string;
    last4: string;
    exp: string;
    billingEmail: string;
    taxId: string;
    cardholderName: string;
  };
}

export interface Invoice {
  id: string;
  orgName: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
  plan: string;
  pdfUrl?: string;
}

const seedPlans: SubscriptionPlan[] = [
  {
    id: "plan-starter",
    name: "Starter Tier",
    description: "Ideal for small teams and expanding departmental pilots",
    monthlyPrice: 99,
    annualPrice: 990,
    seatAllowance: 25,
    storageGb: 20,
    features: [
      "Up to 25 active learners",
      "20 GB video & content storage",
      "Standard SCORM & xAPI compliance",
      "Standard email notifications",
      "Basic reporting & analytics",
      "Community forum support",
    ],
    status: "active",
    badge: "Startup Friendly",
    createdAt: "2026-01-01",
  },
  {
    id: "plan-professional",
    name: "Professional Tier",
    description: "Full-featured LMS power for high-velocity mid-market companies",
    monthlyPrice: 249,
    annualPrice: 2490,
    seatAllowance: 75,
    storageGb: 50,
    features: [
      "Up to 75 active learners",
      "50 GB video & content storage",
      "Custom branding & white-labeling",
      "SAML 2.0 & Okta SSO integration",
      "Automated compliance tracking & recertifications",
      "Advanced visual report builder",
      "Priority 24/7 technical support",
    ],
    status: "active",
    badge: "Most Popular",
    createdAt: "2026-01-01",
  },
  {
    id: "plan-enterprise",
    name: "Enterprise Cloud Tier",
    description: "Maximum scale, dedicated security, and white-glove onboarding",
    monthlyPrice: 499,
    annualPrice: 4990,
    seatAllowance: 150,
    storageGb: 100,
    features: [
      "150+ active learners (expandable)",
      "100 GB fast edge CDN storage",
      "Unlimited custom sub-organizations & multi-tenancy",
      "Dedicated account manager & SLA guarantee",
      "Custom AI quiz generation & auto-grading",
      "Full API & Webhook enterprise access",
      "Audit logs & HIPAA/SOC2 compliance exports",
    ],
    status: "active",
    badge: "Enterprise Grade",
    createdAt: "2026-01-01",
  },
];

const seedSubscriptions: Record<string, OrgSubscription> = {
  "ESSCI": {
    orgName: "ESSCI",
    planId: "plan-enterprise",
    billingCycle: "annual",
    status: "active",
    renewalDate: "2027-09-01",
    seatsAllocated: 150,
    seatsUsed: 84,
    storageGbAllocated: 100,
    storageGbUsed: 28.4,
    accountManager: "Sophia Chen (enterprise@lms.local)",
    paymentMethod: {
      brand: "VISA Business",
      last4: "4242",
      exp: "08/29",
      billingEmail: "finance@essci.org",
      taxId: "US-EIN 84-9382109",
      cardholderName: "ESSCIoration Inc.",
    },
  },
  "LMS Platform": {
    orgName: "LMS Platform",
    planId: "plan-enterprise",
    billingCycle: "annual",
    status: "active",
    renewalDate: "2028-01-01",
    seatsAllocated: 1000,
    seatsUsed: 120,
    storageGbAllocated: 500,
    storageGbUsed: 45.2,
    accountManager: "Global Operations Lead",
    paymentMethod: {
      brand: "MasterCard Enterprise",
      last4: "8888",
      exp: "12/30",
      billingEmail: "admin@lms.dev",
      taxId: "US-EIN 10-0000001",
      cardholderName: "LMS Platform Global",
    },
  },
};

const seedInvoices: Invoice[] = [
  { id: "INV-2026-09", orgName: "ESSCI", date: "2026-09-01", amount: "$499.00", status: "Paid", plan: "Enterprise Tier (Annual)" },
  { id: "INV-2026-08", orgName: "ESSCI", date: "2026-08-01", amount: "$499.00", status: "Paid", plan: "Enterprise Tier (Annual)" },
  { id: "INV-2026-07", orgName: "ESSCI", date: "2026-07-01", amount: "$499.00", status: "Paid", plan: "Enterprise Tier (Annual)" },
  { id: "INV-2026-06", orgName: "ESSCI", date: "2026-06-01", amount: "$499.00", status: "Paid", plan: "Enterprise Tier (Annual)" },
  { id: "INV-2026-05", orgName: "ESSCI", date: "2026-05-01", amount: "$499.00", status: "Paid", plan: "Enterprise Tier (Annual)" },
];

interface SubscriptionStoreState {
  plans: SubscriptionPlan[];
  subscriptions: Record<string, OrgSubscription>;
  invoices: Invoice[];

  // Plan Management (LMS Admin Only)
  createPlan: (plan: Omit<SubscriptionPlan, "id" | "createdAt">) => string;
  updatePlan: (id: string, patch: Partial<SubscriptionPlan>) => void;
  deletePlan: (id: string) => void;

  // Organization Subscription Management (Org Admin & LMS Admin)
  getOrgSubscription: (orgName: string) => OrgSubscription;
  switchOrgPlan: (orgName: string, planId: string, billingCycle?: "monthly" | "annual") => void;
  updatePaymentMethod: (orgName: string, paymentMethod: OrgSubscription["paymentMethod"]) => void;
  addSeatsToOrg: (orgName: string, additionalSeats: number) => void;
}

export const useSubscriptionStore = create<SubscriptionStoreState>()(
  persist(
    (set, get) => ({
      plans: seedPlans,
      subscriptions: seedSubscriptions,
      invoices: seedInvoices,

      createPlan: (newPlanData) => {
        const id = `plan-${Date.now()}`;
        const newPlan: SubscriptionPlan = {
          ...newPlanData,
          id,
          createdAt: new Date().toISOString().split("T")[0],
        };
        set((state) => ({
          plans: [...state.plans, newPlan],
        }));
        return id;
      },

      updatePlan: (id, patch) => {
        set((state) => ({
          plans: state.plans.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }));
      },

      deletePlan: (id) => {
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== id),
        }));
      },

      getOrgSubscription: (orgName) => {
        const existing = get().subscriptions[orgName];
        if (existing) return existing;

        // Default fallback for new organizations
        const defaultSub: OrgSubscription = {
          orgName,
          planId: "plan-professional",
          billingCycle: "annual",
          status: "active",
          renewalDate: "2027-01-01",
          seatsAllocated: 75,
          seatsUsed: 12,
          storageGbAllocated: 50,
          storageGbUsed: 4.5,
          accountManager: "Sophia Chen (enterprise@lms.local)",
          paymentMethod: {
            brand: "VISA Corporate",
            last4: "4242",
            exp: "12/28",
            billingEmail: `billing@${orgName.toLowerCase().replace(/\s+/g, "")}.com`,
            taxId: "US-EIN 00-0000000",
            cardholderName: orgName,
          },
        };
        return defaultSub;
      },

      switchOrgPlan: (orgName, planId, billingCycle = "annual") => {
        const plan = get().plans.find((p) => p.id === planId);
        const currentSub = get().getOrgSubscription(orgName);

        const updatedSub: OrgSubscription = {
          ...currentSub,
          planId,
          billingCycle,
          seatsAllocated: plan ? plan.seatAllowance : currentSub.seatsAllocated,
          storageGbAllocated: plan ? plan.storageGb : currentSub.storageGbAllocated,
        };

        const newInvoice: Invoice = {
          id: `INV-${Date.now().toString().slice(-6)}`,
          orgName,
          date: new Date().toISOString().split("T")[0],
          amount: `$${billingCycle === "annual" ? (plan?.annualPrice ?? 499) : (plan?.monthlyPrice ?? 49)}.00`,
          status: "Paid",
          plan: `${plan?.name ?? "Custom Plan"} (${billingCycle === "annual" ? "Annual" : "Monthly"})`,
        };

        set((state) => ({
          subscriptions: {
            ...state.subscriptions,
            [orgName]: updatedSub,
          },
          invoices: [newInvoice, ...state.invoices],
        }));
      },

      updatePaymentMethod: (orgName, paymentMethod) => {
        const currentSub = get().getOrgSubscription(orgName);
        set((state) => ({
          subscriptions: {
            ...state.subscriptions,
            [orgName]: {
              ...currentSub,
              paymentMethod,
            },
          },
        }));
      },

      addSeatsToOrg: (orgName, additionalSeats) => {
        const currentSub = get().getOrgSubscription(orgName);
        set((state) => ({
          subscriptions: {
            ...state.subscriptions,
            [orgName]: {
              ...currentSub,
              seatsAllocated: currentSub.seatsAllocated + additionalSeats,
            },
          },
        }));
      },
    }),
    {
      name: "lms-subscription-store-v2",
    }
  )
);
