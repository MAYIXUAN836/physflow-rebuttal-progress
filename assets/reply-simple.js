(() => {
  const data = window.PHYSFLOW_REPLIES;
  const groups = [data.overview, ...data.reviewers].map(group => {
    if (data.prebuiltBlocks) return group;
    if (group.code === '62MG' && group.submissionBlocks) {
      return { ...group, items: group.submissionBlocks.map(block => ({
        id: block.items.join('+'),
        subject: block.title,
        markdown: block.items.map(id => {
          const item = group.items.find(item => item.id === id);
          return item.markdown.includes(`**${item.subject}**`) ? item.markdown : `**${item.subject}**\n\n${item.markdown}`;
        }).join('\n\n')
      })) };
    }
    const blocks = [];
    group.items.forEach(item => {
      const text = group === data.overview || item.markdown.includes(`**${item.subject}**`)
        ? item.markdown : `**${item.subject}**\n\n${item.markdown}`;
      const previous = blocks[blocks.length - 1];
      if (previous && previous.markdown.length + 2 + text.length <= 5000) {
        previous.markdown += '\n\n' + text;
        previous.id += '+' + item.id;
        previous.subject += ' / ' + item.subject;
      } else {
        blocks.push({ id: item.id, subject: item.subject, markdown: text });
      }
    });
    return { ...group, items: blocks };
  });
  const md = window.markdownit({ html: false });
  const style = 'body{font:16px/1.8 Georgia,serif;color:#252b32;margin:24px;overflow-wrap:anywhere}p{margin:0 0 16px}table{border-collapse:collapse;font:13px/1.5 system-ui;width:100%;table-layout:fixed}th,td{border:1px solid #ddd;padding:7px 4px;text-align:left;overflow-wrap:anywhere}th{background:#f5f6f7}img{max-width:100%}pre{white-space:pre-wrap}';
  const key = (group, block) => (data.storageNamespace || 'physflow-simple-markdown-v1:') + group.code + (group.items.length > 1 ? ':' + group.items[block].id : '');
  const converter = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  converter.use(turndownPluginGfm.gfm);
  const drafts = groups.map(group => group.items.map(item => item.markdown));
  const edited = groups.map(group => group.items.map(() => false));
  const visible = new Map();
  const sync = data.sharedEditing ? window.PhysFlowSync(groups, refreshShared, {
    autoSave: false, draftKey: data.readOnly ? 'physflow-1116-viewer-v1' : 'physflow-1116-shared-drafts-v1',
    writeEndpoint: data.saveEndpoint, readEndpoint: data.saveEndpoint,
    requestTimeoutMs: data.saveEndpoint ? 60000 : 15000
  }) : null;
  function refreshShared() {
    groups.forEach((group, index) => group.items.forEach((item, block) => {
      drafts[index][block] = sync.view(item);
      visible.get(item.syncKey)?.();
    }));
    const state = sync.summary();
    document.querySelector('#master-status').textContent = state.error || (!state.ready ? '正在载入线上主稿…' :
      state.busy ? '正在同步…' : state.conflicts ? '存在编辑冲突，请核对双方内容' :
      state.pending ? `${state.pending} 个回复块待保存` : '与线上主稿一致');
    document.querySelector('#save-master').hidden = Boolean(data.readOnly);
    document.querySelector('#save-master').disabled = !state.ready || state.busy || !state.pending || Boolean(state.conflicts);
    document.querySelector('#refresh-master').disabled = !state.ready || state.busy;
  }
  function backup(group, block) {
    try {
      const saved = localStorage.getItem(key(group, block));
      if (saved !== null) return saved;
      const old = data.storageNamespace || group.items.length > 1 ? null : localStorage.getItem('physflow-simple-html-v1:' + group.code);
      return old === null ? null : converter.turndown(old);
    } catch { return null; }
  }
  // Scripts and remote resources remain blocked; same-origin access lets us measure the preview.
  function documentHTML(html) {
    return '<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data:; form-action \'none\'; base-uri \'none\'"><style>' + style + '</style></head><body>' + html + '</body></html>';
  }
  function fitBlock(section) {
    const editor = section.querySelector('[data-role="editor"]');
    const preview = section.querySelector('[data-role="preview"]');
    editor.style.height = '0px';
    const editorHeight = editor.scrollHeight;
    const body = preview.contentDocument?.body;
    const previewHeight = body ? Math.ceil(body.getBoundingClientRect().height) + 48 : 0;
    const height = Math.max(editorHeight, previewHeight);
    editor.style.height = `${height}px`;
    preview.style.height = `${height}px`;
  }
  window.addEventListener('resize', () => {
    document.querySelectorAll('.reply-block').forEach(fitBlock);
  });
  function select(index) {
    const group = groups[index];
    document.querySelector('#title').textContent = index ? `Reviewer ${index} · ${group.code}` : 'General';
    document.querySelectorAll('nav button').forEach((button, i) => button.setAttribute('aria-selected', String(i === index)));
    const blocks = document.querySelector('#blocks');
    blocks.replaceChildren();
    visible.clear();
    group.items.forEach((item, block) => {
      const section = document.querySelector('#block-template').content.firstElementChild.cloneNode(true);
      const field = name => section.querySelector(`[data-role="${name}"]`);
      const editor = field('editor');
      const preview = field('preview');
      const status = field('status');
      const restore = field('restore');
      field('title').textContent = `Block ${block + 1}`;
      editor.setAttribute('aria-label', `Block ${block + 1} Markdown 回复正文`);
      preview.title = `Block ${block + 1} 回复预览`;
      editor.value = drafts[index][block];
      status.textContent = edited[index][block] ? '当前为本地修改 · 不回写共享主稿' : '已加载最新发布主稿 · 本地备份未覆盖主稿';
      restore.hidden = Boolean(data.readOnly) || backup(group, block) === null;
      if (data.readOnly) section.querySelector('footer span:last-child').textContent = '共享主稿 · 作者保存后可刷新查看';
      preview.addEventListener('load', () => {
        fitBlock(section);
        preview.contentDocument.querySelectorAll('img').forEach(img => {
          img.addEventListener('load', () => fitBlock(section), { once: true });
        });
      });
      function render() {
        preview.srcdoc = documentHTML(md.render(editor.value));
        field('count').textContent = `${editor.value.length.toLocaleString()} / 5000 字符`;
        field('count').style.color = editor.value.length > 5000 ? '#c62828' : '';
        fitBlock(section);
      }
      if (sync) {
        const update = () => {
          const state = sync.state(item);
          const value = sync.view(item);
          if (editor.value !== value) { editor.value = value; render(); }
          editor.readOnly = Boolean(data.readOnly) || !state.ready;
          status.textContent = state.error || (!state.ready ? '正在载入线上主稿…' :
            state.conflict ? '编辑冲突 · 当前编辑和线上版本均已保留' :
            state.pending ? '修改已备份 · 预览后点击“保存到主稿”' : '与线上主稿一致');
          field('conflict').hidden = !state.conflict;
          field('remote').textContent = state.conflict?.theirs || '';
        };
        visible.set(item.syncKey, update);
        field('keep-mine').onclick = () => sync.accept(item, true);
        field('keep-remote').onclick = () => sync.accept(item, false);
        update();
      }
      editor.addEventListener('input', () => {
        const previous = drafts[index][block];
        drafts[index][block] = editor.value;
        edited[index][block] = true;
        try {
          localStorage.setItem(key(group, block), editor.value);
          restore.hidden = false;
          status.textContent = '已保存到当前浏览器 · ' + new Date().toLocaleTimeString();
        } catch { status.textContent = '浏览器保存失败，请使用“导出 Markdown”保存修改'; }
        if (sync) sync.edit(item, previous, editor.value);
        render();
      });
      restore.onclick = () => {
        const saved = backup(group, block);
        if (saved === null) return;
        const previous = drafts[index][block];
        editor.value = drafts[index][block] = saved;
        edited[index][block] = true;
        status.textContent = '已恢复本地备份 · 刷新页面将重新加载主稿';
        if (sync) sync.edit(item, previous, saved);
        render();
      };
      field('download').onclick = () => {
        const url = URL.createObjectURL(new Blob([editor.value], { type: 'text/markdown;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url; link.download = `rebuttal-${index ? 'reviewer-' + index : 'general'}-block-${block + 1}.md`;
        link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
      blocks.append(section);
      render();
    });
  }
  groups.forEach((group, index) => {
    const button = document.createElement('button');
    button.textContent = index ? `Reviewer ${index}` : 'General';
    button.setAttribute('role', 'tab');
    button.onclick = () => select(index);
    document.querySelector('nav').append(button);
  });
  select(0);
  if (sync) {
    document.querySelector('#save-master').onclick = async () => {
      await sync.save();
    };
    document.querySelector('#refresh-master').onclick = sync.refresh;
    document.querySelector('a[href="rebuttal-1116.md"]').onclick = event => {
      event.preventDefault();
      const text = '# PhysFlow Rebuttal · 1116\n\n' + groups.map((group, index) =>
        `## ${index ? 'Reviewer ' + group.code : 'General Response'}\n\n` + group.items.map((item, block) =>
          `### Block ${block + 1}\n\n${sync.view(item)}`).join('\n\n')).join('\n\n') + '\n';
      const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url; link.download = 'rebuttal-1116.md';
      link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    sync.start([]);
  }
})();
