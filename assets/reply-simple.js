(() => {
  const data = window.PHYSFLOW_REPLIES;
  const groups = [data.overview, ...data.reviewers];
  const md = window.markdownit({ html: false });
  const editor = document.querySelector('#editor');
  const preview = document.querySelector('#preview');
  const status = document.querySelector('#status');
  const style = 'body{font:16px/1.8 Georgia,serif;color:#252b32;margin:24px;overflow-wrap:anywhere}p{margin:0 0 16px}table{border-collapse:collapse;font:13px/1.5 system-ui;width:100%;display:block;overflow:auto}th,td{border:1px solid #ddd;padding:7px 10px;text-align:left}th{background:#f5f6f7}img{max-width:100%}pre{white-space:pre-wrap}';
  const key = group => 'physflow-simple-markdown-v1:' + group.code;
  const converter = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  converter.use(turndownPluginGfm.gfm);
  let active = 0;
  const drafts = groups.map(group => group.items.map(item => {
    const text = item.markdown;
    return group === data.overview || text.includes(`**${item.subject}**`) ? text : `**${item.subject}**\n\n${text}`;
  }).join('\n\n'));
  const edited = groups.map(() => false);
  function backup(group) {
    try {
      const saved = localStorage.getItem(key(group));
      if (saved !== null) return saved;
      const old = localStorage.getItem('physflow-simple-html-v1:' + group.code);
      return old === null ? null : converter.turndown(old);
    } catch { return null; }
  }
  // The preview is script-free and cannot access the parent or load remote resources.
  function documentHTML(html) {
    return '<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data:; form-action \'none\'; base-uri \'none\'"><style>' + style + '</style></head><body>' + html + '</body></html>';
  }
  function render() {
    preview.srcdoc = documentHTML(md.render(editor.value));
    const count = editor.value.length;
    const counter = document.querySelector('#count');
    counter.textContent = `${count.toLocaleString()} / 5000 字符`;
    counter.style.color = count > 5000 ? '#c62828' : '';
  }
  function select(index) {
    active = index;
    editor.value = drafts[index];
    document.querySelector('#title').textContent = index ? `Reviewer ${index} · ${groups[index].code}` : 'General';
    document.querySelectorAll('nav button').forEach((button, i) => button.setAttribute('aria-selected', String(i === index)));
    status.textContent = edited[index] ? '当前为本地修改 · 不回写共享主稿' : '已加载最新发布主稿 · 本地备份未覆盖主稿';
    document.querySelector('#restore').hidden = backup(groups[index]) === null;
    render();
  }
  groups.forEach((group, index) => {
    const button = document.createElement('button');
    button.textContent = index ? `Reviewer ${index}` : 'General';
    button.setAttribute('role', 'tab');
    button.onclick = () => select(index);
    document.querySelector('nav').append(button);
  });
  editor.addEventListener('input', () => {
    drafts[active] = editor.value;
    edited[active] = true;
    try {
      localStorage.setItem(key(groups[active]), editor.value);
      document.querySelector('#restore').hidden = false;
      status.textContent = '已保存到当前浏览器 · ' + new Date().toLocaleTimeString();
    } catch { status.textContent = '浏览器保存失败，请使用“导出 Markdown”保存修改'; }
    render();
  });
  document.querySelector('#restore').onclick = () => {
    const saved = backup(groups[active]);
    if (saved === null) return;
    drafts[active] = saved;
    edited[active] = true;
    select(active);
    status.textContent = '已恢复本地备份 · 刷新页面将重新加载主稿';
  };
  document.querySelector('#download').onclick = () => {
    const url = URL.createObjectURL(new Blob([editor.value], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = `rebuttal-${active ? 'reviewer-' + active : 'general'}.md`;
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  select(0);
})();
