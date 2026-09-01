import { getMyAccount } from "@/lib/server/rank";

export type MyAccount = Awaited<ReturnType<typeof getMyAccount>>;

const TTL = 15_000;
let mem: { data: MyAccount; at: number } | null = null;
let inflight: Promise<MyAccount> | null = null;

export function peekAccount(): MyAccount | null {
  if (!mem) return null;
  if (Date.now() - mem.at > TTL) return mem.data;
  return mem.data;
}

export function setAccountCache(data: MyAccount) {
  mem = { data, at: Date.now() };
}

export function clearAccountCache() {
  mem = null;
  inflight = null;
}

export function loadAccount(force = false): Promise<MyAccount> {
  if (!force && mem && Date.now() - mem.at < TTL) return Promise.resolve(mem.data);
  if (!force && inflight) return inflight;
  const req = getMyAccount()
    .then((data) => {
      mem = { data, at: Date.now() };
      if (inflight === req) inflight = null;
      return data;
    })
    .catch((err) => {
      if (inflight === req) inflight = null;
      throw err;
    });
  inflight = req;
  return req;
}
