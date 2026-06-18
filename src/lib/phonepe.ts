const SANDBOX_AUTH_URL =
  "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";
const PROD_AUTH_URL =
  "https://api.phonepe.com/apis/identity-manager/v1/oauth/token";

const SANDBOX_PAY_URL =
  "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay";
const PROD_PAY_URL = "https://api.phonepe.com/apis/pg/checkout/v2/pay";

const SANDBOX_STATUS_URL =
  "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order";
const PROD_STATUS_URL =
  "https://api.phonepe.com/apis/pg/checkout/v2/order";

export interface PhonePeConfig {
  clientId: string;
  clientSecret: string;
  clientVersion: string;
  merchantId: string;
  env: "sandbox" | "production";
}

export function getPhonePeConfig(): PhonePeConfig {
  const clientId = process.env.PHONEPE_CLIENT_ID ?? "";
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET ?? "";
  const clientVersion = process.env.PHONEPE_CLIENT_VERSION ?? "1";
  const merchantId = process.env.PHONEPE_MERCHANT_ID ?? "";
  const env =
    process.env.PHONEPE_ENV === "production" ? "production" : "sandbox";

  if (!clientId || !clientSecret || !merchantId) {
    throw new Error(
      "PhonePe credentials missing on server. Add PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, and PHONEPE_MERCHANT_ID to Vercel Environment Variables and redeploy.",
    );
  }

  return { clientId, clientSecret, clientVersion, merchantId, env };
}

export async function getAuthToken(config: PhonePeConfig): Promise<string> {
  const authUrl =
    config.env === "production" ? PROD_AUTH_URL : SANDBOX_AUTH_URL;

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_version: config.clientVersion,
    client_secret: config.clientSecret,
    grant_type: "client_credentials",
  });

  const response = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    const hint =
      response.status === 401
        ? " Check PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, and PHONEPE_ENV (production keys need PHONEPE_ENV=production)."
        : "";
    throw new Error(
      `PhonePe auth failed (${response.status}): ${data.message ?? JSON.stringify(data)}.${hint}`,
    );
  }

  return data.access_token;
}

export interface InitiatePaymentParams {
  merchantOrderId: string;
  amountPaise: number;
  redirectUrl: string;
  phone?: string;
  orderId?: string;
}

export async function initiatePayment(
  config: PhonePeConfig,
  token: string,
  params: InitiatePaymentParams,
) {
  const payUrl = config.env === "production" ? PROD_PAY_URL : SANDBOX_PAY_URL;

  const payload: Record<string, unknown> = {
    merchantOrderId: params.merchantOrderId,
    amount: params.amountPaise,
    expireAfter: 1200,
    paymentFlow: {
      type: "PG_CHECKOUT",
      merchantUrls: {
        redirectUrl: params.redirectUrl,
      },
    },
    metaInfo: {
      udf1: params.orderId ?? "",
    },
  };

  if (params.phone) {
    const cleanPhone = params.phone.replace(/\D/g, "");
    if (cleanPhone.length >= 10) {
      payload.prefillUserLoginDetails = {
        phoneNumber: cleanPhone.slice(-10),
      };
    }
  }

  const response = await fetch(payUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `O-Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.redirectUrl) {
    throw new Error(
      `PhonePe payment initiation failed: ${data.message ?? JSON.stringify(data)}`,
    );
  }

  return data as {
    orderId: string;
    state: string;
    redirectUrl: string;
    expireAt: number;
  };
}

export async function checkOrderStatus(
  config: PhonePeConfig,
  token: string,
  merchantOrderId: string,
) {
  const baseUrl =
    config.env === "production" ? PROD_STATUS_URL : SANDBOX_STATUS_URL;

  const response = await fetch(
    `${baseUrl}/${encodeURIComponent(merchantOrderId)}/status?details=false`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `PhonePe status check failed: ${data.message ?? JSON.stringify(data)}`,
    );
  }

  return data as {
    orderId: string;
    state: "PENDING" | "COMPLETED" | "FAILED";
    amount: number;
    paymentDetails?: Array<{ transactionId: string; state: string }>;
    metaInfo?: { udf1?: string };
  };
}

export type PaymentOutcome = "paid" | "failed" | "cancelled" | "pending";

export function resolvePaymentOutcome(status: {
  state: string;
  paymentDetails?: Array<{ transactionId: string; state: string }>;
}): PaymentOutcome {
  if (status.state === "COMPLETED") return "paid";
  if (status.state === "FAILED") return "failed";
  if (
    status.state === "PENDING" &&
    (!status.paymentDetails || status.paymentDetails.length === 0)
  ) {
    return "cancelled";
  }
  return "pending";
}

export function mapPaymentStatus(outcome: PaymentOutcome): string {
  return outcome;
}
