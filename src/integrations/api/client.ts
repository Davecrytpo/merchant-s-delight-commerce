const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const SESSION_KEY = "merchants-delight-session";

type Filter = { field: string; operator: "eq" | "neq" | "in"; value: any };
type Session = {
  access_token: string;
  token_type: string;
  user: { id: string; email: string; user_metadata?: { full_name?: string | null } };
};

type AuthListener = (event: string, session: Session | null) => void;

const listeners = new Set<AuthListener>();

const readSession = (): Session | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

const writeSession = (session: Session | null, event = session ? "SIGNED_IN" : "SIGNED_OUT") => {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
  listeners.forEach((listener) => listener(event, session));
};

const authHeaders = () => {
  const session = readSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
};

const apiFetch = async (path: string, init: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init.headers || {}),
    },
  });
  return response.json();
};

class QueryBuilder {
  table: string;
  op: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  selectSpec = "*";
  filters: Filter[] = [];
  orderSpec: { field: string; ascending: boolean } | null = null;
  limitCount: number | null = null;
  payload: any = null;
  options: any = {};
  singleMode: "single" | "maybeSingle" | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(spec = "*") {
    if (this.op === "select") this.selectSpec = spec;
    else this.options.returning = true;
    return this;
  }

  insert(payload: any) {
    this.op = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: any) {
    this.op = "update";
    this.payload = payload;
    return this;
  }

  delete() {
    this.op = "delete";
    return this;
  }

  upsert(payload: any, options: any = {}) {
    this.op = "upsert";
    this.payload = payload;
    this.options = options;
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, operator: "eq", value });
    return this;
  }

  neq(field: string, value: any) {
    this.filters.push({ field, operator: "neq", value });
    return this;
  }

  in(field: string, value: any[]) {
    this.filters.push({ field, operator: "in", value });
    return this;
  }

  order(field: string, options: { ascending?: boolean } = {}) {
    this.orderSpec = { field, ascending: options.ascending !== false };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleMode = "single";
    return this;
  }

  maybeSingle() {
    this.singleMode = "maybeSingle";
    return this;
  }

  async execute() {
    return apiFetch(`/db/${this.table}/query`, {
      method: "POST",
      body: JSON.stringify({
        op: this.op,
        selectSpec: this.selectSpec,
        filters: this.filters,
        order: this.orderSpec,
        limit: this.limitCount,
        payload: this.payload,
        options: this.options,
        singleMode: this.singleMode,
      }),
    });
  }

  then(resolve: any, reject: any) {
    return this.execute().then(resolve, reject);
  }
}

export const apiClient = {
  auth: {
    async signUp({ email, password, options }: any) {
      const result = await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          full_name: options?.data?.full_name || "",
        }),
      });
      if (result.data) writeSession(result.data);
      return result;
    },
    async signInWithPassword({ email, password }: any) {
      const result = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (result.data) writeSession(result.data);
      return result;
    },
    async signOut() {
      writeSession(null, "SIGNED_OUT");
      return { error: null };
    },
    async getSession() {
      return { data: { session: readSession() } };
    },
    async getUser() {
      const session = readSession();
      return { data: { user: session?.user || null } };
    },
    onAuthStateChange(callback: AuthListener) {
      listeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => listeners.delete(callback),
          },
        },
      };
    },
  },
  from(table: string) {
    return new QueryBuilder(table);
  },
  async rpc(name: string, payload: any) {
    return apiFetch(`/rpc/${name}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  functions: {
    async invoke(name: string, options: { body?: any } = {}) {
      try {
        const response = await fetch(`${API_BASE_URL}/functions/${name}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify(options.body || {}),
        });
        const data = await response.json();
        if (!response.ok) return { data: null, error: { message: data.error || "Request failed" } };
        return { data, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message || "Network error" } };
      }
    },
  },
  channel() {
    return {
      on() {
        return this;
      },
      subscribe() {
        return {};
      },
    };
  },
  removeChannel() {},
};
