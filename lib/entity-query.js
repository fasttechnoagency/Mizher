// Base44-compatible entity API (list / filter / get / create / update / delete /
// updateMany / subscribe) on top of a Supabase client. Used in the browser (RLS as
// the signed-in user) and on the server (user-scoped or service-role client).
import { ENTITY_META } from './entity-meta';

const OPS = { $lt: 'lt', $lte: 'lte', $gt: 'gt', $gte: 'gte', $ne: 'neq' };

function metaFor(entityName) {
  const meta = ENTITY_META[entityName];
  if (!meta) throw new Error(`Unknown entity: ${entityName}`);
  return meta;
}

function quote(v) {
  const s = v === null ? 'null' : String(v);
  return /[,()":\s]/.test(s) ? `"${s.replace(/"/g, '\\"')}"` : s;
}

// One condition object -> PostgREST "or()" fragment
function toOrFragment(cond) {
  const parts = [];
  for (const [key, value] of Object.entries(cond)) {
    if (key === '$or') { parts.push(`or(${value.map(toOrFragment).join(',')})`); continue; }
    if (key === '$and') { parts.push(`and(${value.map(toOrFragment).join(',')})`); continue; }
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      for (const [op, v] of Object.entries(value)) {
        if (op === '$in') parts.push(`${key}.in.(${v.map(quote).join(',')})`);
        else if (op === '$nin') parts.push(`${key}.not.in.(${v.map(quote).join(',')})`);
        else if (OPS[op]) parts.push(`${key}.${OPS[op]}.${quote(v)}`);
      }
    } else if (value === null || value === undefined) {
      parts.push(`${key}.is.null`);
    } else {
      parts.push(`${key}.eq.${quote(value)}`);
    }
  }
  return parts.length === 1 ? parts[0] : `and(${parts.join(',')})`;
}

function applyFilter(q, query, columns) {
  if (!query) return q;
  for (const [key, value] of Object.entries(query)) {
    if (key === '$or') { q = q.or(value.map(toOrFragment).join(',')); continue; }
    if (key === '$and') { for (const c of value) q = applyFilter(q, c, columns); continue; }
    if (key.startsWith('$')) continue;
    const isJson = columns[key] === 'jsonb';
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      for (const [op, v] of Object.entries(value)) {
        if (op === '$in') q = q.in(key, v);
        else if (op === '$nin') q = q.not(key, 'in', `(${v.map(quote).join(',')})`);
        else if (op === '$ne') q = v === null ? q.not(key, 'is', null) : q.neq(key, v);
        else if (OPS[op]) q = q[OPS[op]](key, v);
        else if (op === '$exists') q = v ? q.not(key, 'is', null) : q.is(key, null);
      }
    } else if (value === null || value === undefined) {
      q = q.is(key, null);
    } else if (isJson) {
      q = q.contains(key, Array.isArray(value) ? value : [value]);
    } else {
      q = q.eq(key, value);
    }
  }
  return q;
}

function applySort(q, sort) {
  const s = sort || '-created_date';
  const desc = s.startsWith('-');
  return q.order(desc ? s.slice(1) : s, { ascending: !desc, nullsFirst: false });
}

// Keep only known columns; empty strings become null for non-text columns.
function clean(data, columns) {
  const out = {};
  for (const [k, v] of Object.entries(data || {})) {
    if (!(k in columns) || v === undefined) continue;
    const type = columns[k];
    if (v === '' && type !== 'text') { out[k] = null; continue; }
    if (type === 'double precision' && typeof v === 'string') { const n = Number(v); out[k] = Number.isFinite(n) ? n : null; continue; }
    out[k] = v;
  }
  return out;
}

function unwrap({ data, error }) {
  if (error) {
    const err = new Error(error.message || 'Request failed');
    err.code = error.code;
    err.details = error.details;
    throw err;
  }
  return data;
}

export function createEntityApi(getClient, entityName) {
  const { table, columns } = metaFor(entityName);
  const sb = () => getClient();
  const api = {
    async list(sort, limit, skip) {
      let q = applySort(sb().from(table).select('*'), sort);
      if (limit) q = q.range(skip || 0, (skip || 0) + limit - 1);
      return unwrap(await q) || [];
    },
    async filter(query, sort, limit, skip) {
      let q = applyFilter(sb().from(table).select('*'), query, columns);
      q = applySort(q, sort);
      if (limit) q = q.range(skip || 0, (skip || 0) + limit - 1);
      return unwrap(await q) || [];
    },
    async get(id) {
      const row = unwrap(await sb().from(table).select('*').eq('id', id).maybeSingle());
      if (!row) { const e = new Error(`${entityName} not found`); e.status = 404; throw e; }
      return row;
    },
    async create(data) {
      return unwrap(await sb().from(table).insert(clean(data, columns)).select('*').single());
    },
    async bulkCreate(items) {
      return unwrap(await sb().from(table).insert(items.map((d) => clean(d, columns))).select('*')) || [];
    },
    async update(id, data) {
      const payload = clean(data, columns);
      delete payload.id;
      return unwrap(await sb().from(table).update(payload).eq('id', id).select('*').maybeSingle());
    },
    async delete(id) {
      unwrap(await sb().from(table).delete().eq('id', id));
      return { success: true };
    },
    // Mongo-style bulk update: supports { $set } and { $inc } (increment is read-modify-write).
    async updateMany(query, update) {
      const set = update && (update.$set || update.$inc) ? update.$set || {} : update || {};
      if (update && update.$inc) {
        const rows = await api.filter(query);
        for (const row of rows) {
          const patch = { ...set };
          for (const [k, by] of Object.entries(update.$inc)) patch[k] = (Number(row[k]) || 0) + Number(by);
          await api.update(row.id, patch);
        }
        return { updated: rows.length };
      }
      const payload = clean(set, columns);
      const rows = unwrap(await applyFilter(sb().from(table).update(payload), query, columns).select('id')) || [];
      return { updated: rows.length };
    },
    subscribe(callback) {
      const client = sb();
      const channel = client
        .channel(`${table}-${Math.random().toString(36).slice(2)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          const type = payload.eventType === 'INSERT' ? 'create' : payload.eventType === 'UPDATE' ? 'update' : 'delete';
          const row = payload.new && Object.keys(payload.new).length ? payload.new : payload.old;
          try { callback({ type, id: row?.id, data: row }); } catch (e) { console.error(e); }
        })
        .subscribe();
      return () => { client.removeChannel(channel); };
    },
  };
  return api;
}

export function createEntitiesProxy(getClient) {
  const cache = {};
  return new Proxy({}, {
    get(_t, name) {
      if (typeof name !== 'string') return undefined;
      if (!cache[name]) cache[name] = createEntityApi(getClient, name);
      return cache[name];
    },
  });
}
