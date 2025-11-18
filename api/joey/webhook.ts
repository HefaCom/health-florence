import crypto from 'crypto';
import awsconfig from '../../src/aws-exports.js';

const GRAPHQL_ENDPOINT =
  process.env.AWS_APPSYNC_ENDPOINT || awsconfig.aws_appsync_graphqlEndpoint;
const GRAPHQL_API_KEY =
  process.env.AWS_APPSYNC_API_KEY || awsconfig.aws_appsync_apiKey;
const WEBHOOK_SECRET = process.env.JOEY_WEBHOOK_SECRET;

type JoeyWebhookPayload = {
  type: 'wallet_linked' | 'wallet_unlinked' | 'balance_update';
  userId: string;
  walletAddress?: string;
  chain?: string;
  metadata?: Record<string, unknown>;
  balances?: Record<string, unknown>;
};

const GET_USER_QUERY = /* GraphQL */ `
  query GetUserPreferences($id: ID!) {
    getUser(id: $id) {
      id
      preferences
    }
  }
`;

const UPDATE_USER_MUTATION = /* GraphQL */ `
  mutation UpdateUserPreferences($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      preferences
      updatedAt
    }
  }
`;

function parsePreferences(raw: any) {
  if (!raw) return {};
  if (typeof raw === 'object') return { ...raw };
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function readBody(req: any): Promise<string> {
  if (req.body) {
    return typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function verifySignature(payload: string, signature: string | string[] | undefined) {
  if (!WEBHOOK_SECRET) {
    return false;
  }
  if (!signature) {
    return false;
  }

  const provided =
    typeof signature === 'string' ? signature : signature.length > 0 ? signature[0] : '';

  const digest = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(provided));
  } catch {
    return false;
  }
}

async function callGraphQL(query: string, variables: Record<string, unknown>) {
  if (!GRAPHQL_ENDPOINT || !GRAPHQL_API_KEY) {
    throw new Error('GraphQL endpoint or API key missing');
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': GRAPHQL_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message || 'GraphQL request failed');
  }
  return json.data;
}

function mergeWalletPreferences(preferences: any, payload: JoeyWebhookPayload) {
  const wallets = { ...(preferences.wallets || {}) };

  if (payload.type === 'wallet_linked') {
    wallets.joey = {
      ...(wallets.joey || {}),
      address: payload.walletAddress,
      chain: payload.chain || wallets.joey?.chain || 'xrpl:mainnet',
      connectedAt: new Date().toISOString(),
      metadata: {
        ...(wallets.joey?.metadata || {}),
        ...(payload.metadata || {}),
      },
      verified: true,
      verification: {
        method: 'joey-webhook',
        at: new Date().toISOString(),
      },
    };
  } else if (payload.type === 'wallet_unlinked') {
    delete wallets.joey;
  } else if (payload.type === 'balance_update') {
    wallets.joey = {
      ...(wallets.joey || {}),
      address: wallets.joey?.address || payload.walletAddress,
      lastKnownBalances: payload.balances || wallets.joey?.lastKnownBalances,
      lastBalanceSyncedAt: new Date().toISOString(),
    };
  }

  if (Object.keys(wallets).length > 0) {
    return { ...preferences, wallets };
  }

  const next = { ...preferences };
  delete next.wallets;
  return next;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  if (!WEBHOOK_SECRET) {
    res.status(500).json({ error: 'Missing Joey webhook secret' });
    return;
  }

  let rawBody = '';
  try {
    rawBody = await readBody(req);
  } catch (error) {
    console.error('Failed to read webhook body', error);
    res.status(400).json({ error: 'Invalid body' });
    return;
  }

  if (!verifySignature(rawBody, req.headers['x-joey-signature'])) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  let payload: JoeyWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    res.status(400).json({ error: 'Invalid JSON payload' });
    return;
  }

  if (!payload.type || !payload.userId) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  if (payload.type !== 'wallet_unlinked' && !payload.walletAddress) {
    res.status(400).json({ error: 'walletAddress is required for this event' });
    return;
  }

  try {
    const data = await callGraphQL(GET_USER_QUERY, { id: payload.userId });
    const user = data?.getUser;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const preferences = parsePreferences(user.preferences);
    const nextPreferences = mergeWalletPreferences(preferences, payload);

    await callGraphQL(UPDATE_USER_MUTATION, {
      input: {
        id: payload.userId,
        preferences: JSON.stringify(nextPreferences),
      },
    });

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Failed to process Joey webhook', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
}

