(() => {
  const data = window.PHYSFLOW_REPLIES;
  const groups = [data.overview, ...data.reviewers].map(group => {
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
  const style = 'body{font:16px/1.8 Georgia,serif;color:#252b32;margin:24px;overflow-wrap:anywhere}p{margin:0 0 16px}table{border-collapse:collapse;font:13px/1.5 system-ui;width:100%;display:block;overflow:auto}th,td{border:1px solid #ddd;padding:7px 10px;text-align:left}th{background:#f5f6f7}img{max-width:100%}pre{white-space:pre-wrap}';
  const key = (group, block) => 'physflow-simple-markdown-v1:' + group.code + (group.items.length > 1 ? ':' + group.items[block].id : '');
  const converter = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  converter.use(turndownPluginGfm.gfm);
  const drafts = groups.map(group => group.items.map(item => item.markdown));
  const edited = groups.map(group => group.items.map(() => false));
  function backup(group, block) {
    try {
      const saved = localStorage.getItem(key(group, block));
      if (saved !== null) return saved;
      const old = group.items.length > 1 ? null : localStorage.getItem('physflow-simple-html-v1:' + group.code);
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
      restore.hidden = backup(group, block) === null;
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
      editor.addEventListener('input', () => {
        drafts[index][block] = editor.value;
        edited[index][block] = true;
        try {
          localStorage.setItem(key(group, block), editor.value);
          restore.hidden = false;
          status.textContent = '已保存到当前浏览器 · ' + new Date().toLocaleTimeString();
        } catch { status.textContent = '浏览器保存失败，请使用“导出 Markdown”保存修改'; }
        render();
      });
      restore.onclick = () => {
        const saved = backup(group, block);
        if (saved === null) return;
        editor.value = drafts[index][block] = saved;
        edited[index][block] = true;
        status.textContent = '已恢复本地备份 · 刷新页面将重新加载主稿';
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
})();
