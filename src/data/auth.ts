import type { DemoUser, Role } from '../types';

export const DEMO_DEFAULT_PASSWORD = 'SecurityDeposit@2026';

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'u-inst-1',
    name: 'Dr. Priya Sharma',
    title: 'Demo Institution User',
    role: 'Institution User',
    institutionId: 'inst-1',
    email: 'priya.sharma@nvit.ac.in',
    password: 'SecurityDeposit@2026',
    department: 'Registrar & Finance, North Valley Institute of Technology'
  },
  {
    id: 'u-rev-1',
    name: 'R. K. Verma',
    title: 'Review Officer',
    role: 'AICTE Reviewing Official',
    institutionId: 'inst-1',
    email: 'rk.verma@aicte.gov.in',
    password: 'SecurityDeposit@2026',
    department: 'AICTE Bureau of Scrutiny & Verification'
  },
  {
    id: 'u-app-1',
    name: 'S. C. Nair',
    title: 'Approving Authority',
    role: 'Approving Authority',
    institutionId: 'inst-1',
    email: 'sc.nair@aicte.gov.in',
    password: 'SecurityDeposit@2026',
    department: 'Competent Financial Authority, Directorate of Approvals'
  },
  {
    id: 'u-adm-1',
    name: 'Aditi Sen',
    title: 'System Administrator',
    role: 'System Administrator',
    institutionId: 'inst-1',
    email: 'aditi.sen@admin.fdrguardian.gov.in',
    password: 'SecurityDeposit@2026',
    department: 'Central e-Governance & Systems Division'
  }
];

export function findDemoUserByEmail(email: string): DemoUser | undefined {
  if (!email) return undefined;
  const clean = email.toLowerCase().trim();
  return DEMO_USERS.find(u => u.email.toLowerCase() === clean);
}

export function findDemoUserByRole(role: Role): DemoUser | undefined {
  return DEMO_USERS.find(u => u.role === role);
}

export function validateDemoCredentials(
  email: string,
  password?: string
): { user?: DemoUser; error?: string } {
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail) {
    return { error: 'Please enter your registered institutional email address.' };
  }

  const user = findDemoUserByEmail(cleanEmail);
  if (!user) {
    return {
      error: 'Demo account not found for this email address. Please select one of the four demonstration accounts below.'
    };
  }

  if (!cleanPassword) {
    return { error: 'Please enter your account password.' };
  }

  // Accepts user's password, master demo password, or simplified test password
  const isMatch =
    cleanPassword === user.password ||
    cleanPassword === DEMO_DEFAULT_PASSWORD ||
    cleanPassword === 'Demo@1234' ||
    cleanPassword === 'demo';

  if (!isMatch) {
    return {
      error: 'Invalid password. Please check your credentials or click a demo persona below to autofill.'
    };
  }

  return { user };
}
