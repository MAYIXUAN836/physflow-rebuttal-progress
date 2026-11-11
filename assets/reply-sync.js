(() => {
  const endpoint = 'https://api.github.com/repos/MAYIXUAN836/physflow-rebuttal-progress/contents/reply-store.json';
  const branch = 'rebuttal-drafts';
  const draftKey = 'physflow-shared-drafts-v1';
  const tokenKey = 'physflow-github-session-v1';
  const { mergeText } = window.PhysFlowMerge;
  const decode = value => new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\s/g, '')), c => c.charCodeAt(0)));
  const encode = value => btoa(Array.from(new TextEncoder().encode(value), byte => String.fromCharCode(byte)).join(''));

  window.PhysFlowSync = function (groups, onChange) {
    const docs = new Map();
    let saved = {}, token = '', busy = false, ready = false, error = '', lastWrite = 0, timer;
    try { saved = JSON.parse(localStorage.getItem(draftKey)) || {}; } catch {}
    try { token = sessionStorage.getItem(tokenKey) || ''; } catch {}
    for (const group of groups) for (const item of group.items) {
      if (docs.has(item.syncKey)) continue;
      const draft = saved[item.syncKey];
      docs.set(item.syncKey, draft && typeof draft.base === 'string' && typeof draft.text === 'string'
        ? draft : { base: item.syncMarkdown, text: item.syncMarkdown, conflict: null });
    }

    function persist() {
      try { localStorage.setItem(draftKey, JSON.stringify(Object.fromEntries(docs))); }
      catch { error = '浏览器未能备份，请导出回复'; }
    }
    function notify() { persist(); onChange(); }
    function view(item) {
      let value = docs.get(item.syncKey).text;
      for (const omitted of item.source.drop || []) value = value.replace(omitted, '');
      return value;
    }
    function state(item) {
      const doc = docs.get(item.syncKey);
      return { ...doc, pending: doc.text !== doc.base, ready, connected: Boolean(token), busy, error };
    }
    function summary() {
      const values = [...docs.values()];
      return { pending: values.filter(d => d.text !== d.base).length,
        conflicts: values.filter(d => d.conflict).length, ready, connected: Boolean(token), busy, error };
    }
    function edit(item, previous, next) {
      const doc = docs.get(item.syncKey);
      const merged = mergeText(previous, next, doc.text);
      if (!merged.ok) merged.mine = preserveHidden(item, next, doc.text);
      doc.text = merged.ok ? merged.text : merged.mine;
      if (!merged.ok) doc.conflict = merged;
      else if (doc.conflict) doc.conflict.mine = doc.text;
      notify(); schedule();
    }
    function preserveHidden(item, text, full) {
      for (const omitted of item.source.drop || []) {
        if (full.includes(omitted) && !text.includes(omitted)) text += omitted;
      }
      return text;
    }
    function accept(item, keepMine) {
      const doc = docs.get(item.syncKey);
      if (!doc.conflict) return;
      doc.base = doc.conflict.theirs;
      if (!keepMine) doc.text = doc.base;
      doc.conflict = null;
      notify(); schedule();
    }
    function receive(store) {
      if (store.schemaVersion !== 1 || !store.replies) throw new Error('共享稿格式不匹配，修改已保留');
      for (const [key, doc] of docs) {
        if (typeof store.replies[key] !== 'string') throw new Error('共享稿缺少回复，修改已保留');
        if (doc.conflict && doc.text !== store.replies[key]) {
          doc.conflict.theirs = store.replies[key];
          continue;
        }
        const result = mergeText(doc.base, doc.text, store.replies[key]);
        if (result.ok) { doc.base = store.replies[key]; doc.text = result.text; doc.conflict = null; }
        else doc.conflict = result;
      }
    }
    async function request(method = 'GET', body) {
      const headers = { Accept: 'application/vnd.github+json' };
      if (token) headers.Authorization = 'Bearer ' + token;
      if (body) headers['Content-Type'] = 'application/json';
      const response = await fetch(endpoint + '?ref=' + branch, {
        method, headers, body: body ? JSON.stringify(body) : undefined,
        cache: 'no-store', signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) {
        const failure = new Error(response.status === 401 ? '授权已失效，请重新连接' :
          response.status === 403 ? 'GitHub 拒绝请求或请求过多；请检查 Contents 写入权限，稍后重试' :
          response.status === 404 ? '暂时无法读取共享稿，修改已保留' : '同步暂时失败，修改已保留');
        failure.status = response.status; throw failure;
      }
      return response.json();
    }
    async function refresh() {
      if (busy || !ready) return;
      busy = true;
      try {
        const remote = await request();
        receive(JSON.parse(decode(remote.content)));
        error = '';
      } catch (failure) { error = failure.message; }
      finally { busy = false; notify(); schedule(); }
    }
    function schedule() {
      clearTimeout(timer);
      if (ready && token && [...docs.values()].some(d => d.text !== d.base && !d.conflict)) {
        timer = setTimeout(save, Math.max(1500, 10000 - (Date.now() - lastWrite)));
      }
    }
    async function save() {
      if (busy || !token || !ready) return;
      busy = true; notify();
      try {
        for (let attempt = 0; attempt < 3; attempt++) {
          const remote = await request();
          const store = JSON.parse(decode(remote.content));
          receive(store);
          const sent = {};
          for (const [key, doc] of docs) if (doc.text !== doc.base && !doc.conflict) sent[key] = doc.text;
          if (!Object.keys(sent).length) { error = ''; return; }
          const next = { schemaVersion: 1, updatedAt: new Date().toISOString(), replies: { ...store.replies, ...sent } };
          try {
            await request('PUT', { branch, sha: remote.sha, message: 'Save shared rebuttal edits', content: encode(JSON.stringify(next, null, 2) + '\n') });
          } catch (failure) {
            if ([409, 422].includes(failure.status) && attempt < 2) continue;
            throw failure;
          }
          for (const [key, text] of Object.entries(sent)) docs.get(key).base = text;
          lastWrite = Date.now(); error = ''; return;
        }
      } catch (failure) { error = failure.message; lastWrite = Date.now() + 20000; }
      finally { busy = false; notify(); schedule(); }
    }
    async function connect(value) {
      token = value.trim();
      if (!token) throw new Error('请填写编辑授权');
      try {
        const remote = await request();
        receive(JSON.parse(decode(remote.content)));
        try { sessionStorage.setItem(tokenKey, token); } catch {}
        error = ''; notify(); schedule();
      } catch (failure) { token = ''; notify(); throw failure; }
    }
    function disconnect() {
      token = ''; try { sessionStorage.removeItem(tokenKey); } catch {} clearTimeout(timer); notify();
    }
    async function start(legacy) {
      let history = {};
      if (legacy.length) {
        try { history = await (await fetch('assets/reply-history.json', { cache: 'no-store' })).json(); } catch {}
      }
      for (const { key, item, saved: old } of legacy) {
        if (saved[item.syncKey]) continue;
        const doc = docs.get(item.syncKey);
        const result = mergeText(history[old.revision], old.text, doc.text);
        if (result.ok) doc.text = result.text;
        else { result.mine = preserveHidden(item, old.text, doc.text); doc.text = result.mine; doc.conflict = result; }
      }
      // Retain the old per-editor backups; the shared draft now records their merged state.
      ready = true; notify();
      await refresh();
      setInterval(() => { if (!document.hidden) refresh(); }, 75000);
      setInterval(() => { if (token && !document.hidden) refresh(); }, 5000);
      window.addEventListener('online', refresh);
      window.addEventListener('focus', refresh);
      window.addEventListener('beforeunload', event => {
        if (summary().pending) { event.preventDefault(); event.returnValue = ''; }
      });
    }
    function restore(item) {
      const doc = docs.get(item.syncKey);
      doc.base = doc.conflict ? doc.conflict.theirs : doc.base;
      doc.text = doc.base; doc.conflict = null; notify();
    }
    return { view, state, summary, edit, accept, restore, refresh, save, connect, disconnect, start };
  };
})();
