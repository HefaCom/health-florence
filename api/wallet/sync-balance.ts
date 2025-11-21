import awsconfig from '../../src/aws-exports.js';

const GRAPHQL_ENDPOINT =
  process.env.AWS_APPSYNC_ENDPOINT || awsconfig.aws_appsync_graphqlEndpoint;
const GRAPHQL_API_KEY =
  process.env.AWS_APPSYNC_API_KEY || awsconfig.aws_appsync_apiKey;
const RPC_URL =
  process.env.XRPL_RPC_URL || 'https://s.altnet.rippletest.net:51234';
const SYNC_TOKEN = process.env.WALLET_SYNC_TOKEN;

type SyncPayload = {
  userId: string;
  walletAddress?: string;
  walletType?: 'joey' | 'custodial';
};

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

function parsePreferences(raw: any) {
  if (!raw) return {};
  if (typeof raw === 'object') return { ...raw };
  try {
    return JSON.parse(raw);
  } catch {
    return {};
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

async function fetchXRPLBalances(address: string) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      method: 'account_info',
      params: [{ account: address, ledger_index: 'validated' }],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to contact XRPL RPC');
  }

  const payload = await response.json();
  const drops = payload?.result?.account_data?.Balance;
  if (!drops) {
    throw new Error('XRPL response missing balance');
  }

  const xrp = parseFloat(drops) / 1_000_000;
  return {
    xrpDrops: drops,
    xrp,
  };
}

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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  if (SYNC_TOKEN) {
    const auth = req.headers['authorization'];
    if (auth !== `Bearer ${SYNC_TOKEN}`) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  let rawBody = '';
  try {
    rawBody = await readBody(req);
  } catch (error) {
    console.error('Failed to read request body', error);
    res.status(400).json({ error: 'Invalid body' });
    return;
  }

  let payload: SyncPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    res.status(400).json({ error: 'Invalid JSON payload' });
    return;
  }

  if (!payload.userId) {
    res.status(400).json({ error: 'userId is required' });
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
    const wallets = preferences.wallets || {};
    const walletKey =
      payload.walletType ||
      (wallets.joey?.address ? 'joey' : wallets.custodial?.address ? 'custodial' : null);

    if (!walletKey) {
      res.status(404).json({ error: 'No wallet linked for this user' });
      return;
    }

    const walletRecord = wallets[walletKey];
    const address = payload.walletAddress || walletRecord?.address;
    if (!address) {
      res.status(404).json({ error: 'Wallet address unavailable' });
      return;
    }

    const balances = await fetchXRPLBalances(address);

    wallets[walletKey] = {
      ...walletRecord,
      address,
      lastKnownBalances: balances,
      lastBalanceSyncedAt: new Date().toISOString(),
    };

    const nextPreferences = {
      ...preferences,
      wallets,
    };

    await callGraphQL(UPDATE_USER_MUTATION, {
      input: {
        id: payload.userId,
        preferences: JSON.stringify(nextPreferences),
      },
    });

    res.status(200).json({ status: 'ok', balances });
  } catch (error) {
    console.error('Failed to sync wallet balance', error);
    res.status(500).json({ error: 'Failed to sync wallet balance' });
  }
}

