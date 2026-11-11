(() => {
  'use strict';
  const data = window.PHYSFLOW_REPLIES;
  const groups = data.overview ? [data.overview, ...data.reviewers] : data.reviewers;
  const prefix = 'physflow-reply-draft-v1:';
  const limit = data.characterLimit;
  const editors = new Map();
  const page = document.querySelector('.page');
  const taskPanel = document.getElementById('tasks-panel');
  const replyPanel = document.getElementById('responses');
  const md = window.markdownit({ html: false, linkify: false, typographer: false }).disable('image');
  const element = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };

  function readDraft(key) {
    try {
      const value = JSON.parse(localStorage.getItem(prefix + key));
      return value && typeof value.text === 'string' ? value : null;
    } catch { return null; }
  }

  function updateDraftTotal() {
    const count = [...editors.values()].filter(e => e.input.value !== e.item.markdown).length;
    document.getElementById('reply-draft-total').textContent = count ? `本机有 ${count} 份未发布修改` : '正在查看已发布稿';
  }

  function renderEditor(editor) {
    const { input, preview, counter, card } = editor;
    preview.innerHTML = md.render(input.value);
    if (!input.value.trim()) preview.append(element('p', 'preview-empty', '左侧输入 Markdown，这里会实时显示预览。'));
    for (const table of preview.querySelectorAll('table')) {
      const wrap = element('div', 'preview-table');
      table.replaceWith(wrap);
      wrap.append(table);
    }
    for (const link of preview.querySelectorAll('a')) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    const count = input.value.length;
    counter.textContent = `${count.toLocaleString('en-US')} / ${limit} 字符${count > limit ? ` · 超出 ${count - limit}` : ''}`;
    counter.classList.toggle('over-limit', count > limit);
    counter.classList.toggle('near-limit', count >= 4500 && count <= limit);
    card.classList.toggle('over-limit', count > limit);
    updateDraftTotal();
  }

  async function copyEditor(editor, button) {
    try {
      await navigator.clipboard.writeText(editor.input.value);
      button.textContent = '已复制';
    } catch {
      editor.input.focus();
      editor.input.select();
      button.textContent = '已选中，请按 Ctrl / ⌘ C';
    }
    setTimeout(() => { button.textContent = '复制 Markdown'; }, 2200);
  }

  function makeCard(reviewer, item, index) {
    const key = reviewer.code + '-' + item.id;
    const card = element('article', 'response-card');
    card.id = 'response-' + key;
    const head = element('header', 'response-card-head');
    const title = element('div');
    title.append(element('div', 'editor-kicker', `RESPONSE ${String(index + 1).padStart(2, '0')}`), element('h3', '', item.title));
    head.append(title, element('span', 'response-status' + (item.pending ? ' pending' : ''), item.status));
    card.append(head);
    const comments = element('blockquote', 'reviewer-comment');
    for (const comment of item.comments) {
      comments.append(element('div', 'comment-label', '审稿人原文 · ' + comment.label), element('p', '', comment.text));
    }
    const analysis = element('div', 'response-analysis');
    analysis.append(element('strong', '', '我们的分析'), element('p', '', item.analysis));
    if (item.comments.length) card.append(comments);
    card.append(analysis);
    const columns = element('div', 'editor-columns');
    const source = element('div', 'editor-column');
    const sourceHead = element('div', 'editor-column-head');
    const label = element('label', '', 'Markdown · 可编辑');
    label.htmlFor = 'markdown-' + key;
    const copy = element('button', 'editor-button primary', '复制 Markdown');
    copy.type = 'button';
    sourceHead.append(label, copy);
    const input = element('textarea', 'markdown-input');
    input.id = label.htmlFor;
    input.spellcheck = false;
    input.setAttribute('aria-label', reviewer.code + ' · ' + item.title + ' Markdown');
    const saved = readDraft(key);
    // Apply the author's requested sentence edit without replacing their draft.
    if (key === 'overview-summary' && saved) {
      const previous = 'We have carefully considered your feedback and revised the paper, with the main changes in blue.';
      const revised = 'We have carefully considered every comment and suggestion and revised the paper accordingly, with the main changes marked in blue.';
      if (saved.text.includes(previous) && item.markdown.includes(revised)) {
        saved.text = saved.text.replace(previous, revised);
        try { localStorage.setItem(prefix + key, JSON.stringify(saved)); } catch {}
      }
    }
    let draftRevision = saved?.revision || item.revision;
    input.value = saved ? saved.text : item.markdown;
    const foot = element('div', 'editor-column-foot');
    const counter = element('span', 'char-counter');
    counter.id = 'count-' + key;
    counter.setAttribute('aria-live', 'polite');
    input.setAttribute('aria-describedby', counter.id);
    const saveState = element('span', 'draft-save-state', saved ? (saved.revision !== item.revision ? '本机草稿 · 发布稿已有更新' : '已恢复本机草稿') : '已发布稿 · 编辑后自动保存本机');
    foot.append(counter, saveState);
    source.append(sourceHead, input, foot);
    const rendered = element('div', 'editor-column');
    const renderedHead = element('div', 'editor-column-head');
    renderedHead.append(element('span', '', '实时预览'), element('span', '', '仅预览英文回复'));
    const preview = element('div', 'markdown-preview');
    preview.setAttribute('lang', 'en');
    const renderedFoot = element('div', 'editor-column-foot');
    renderedFoot.append(element('span', '', '复制内容不包含审稿原文和中文分析'));
    const restore = element('button', 'editor-button restore-button', '还原已发布稿');
    restore.type = 'button';
    renderedFoot.append(restore);
    rendered.append(renderedHead, preview, renderedFoot);
    columns.append(source, rendered);
    card.append(columns);
    const editor = { key, item, reviewer, card, input, preview, counter, saveState };
    editors.set(key, editor);
    input.addEventListener('input', () => {
      renderEditor(editor);
      try {
        if (input.value === item.markdown) {
          localStorage.removeItem(prefix + key);
          draftRevision = item.revision;
        } else localStorage.setItem(prefix + key, JSON.stringify({ text: input.value, revision: draftRevision }));
        saveState.textContent = input.value === item.markdown ? '与已发布稿一致' : '已保存到当前浏览器';
        saveState.classList.remove('error');
      } catch {
        saveState.textContent = '浏览器未能保存，请复制或导出';
        saveState.classList.add('error');
      }
    });
    copy.addEventListener('click', () => copyEditor(editor, copy));
    restore.addEventListener('click', () => {
      if (input.value !== item.markdown && !window.confirm('用已发布稿替换这一个回复框的本机修改？此操作不能撤销。')) return;
      input.value = item.markdown;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    renderEditor(editor);
    return card;
  }

  const navigation = document.getElementById('response-reviewers');
  const sections = document.getElementById('response-sections');
  for (const reviewer of groups) {
    const heading = reviewer === data.overview ? reviewer.name : reviewer.name + ' · ' + reviewer.code;
    const navLink = element('a', 'reply-reviewer-link');
    navLink.href = '#response-' + reviewer.code;
    navLink.dataset.replyReviewer = reviewer.code;
    navLink.append(element('strong', '', heading), element('span', '', reviewer === data.overview ? '给所有审稿人和 AC 的开场回复' : reviewer.items.length + ' 个回复点'));
    navigation.append(navLink);
    const section = element('section', 'response-reviewer');
    section.id = 'response-' + reviewer.code;
    section.dataset.replyReviewer = reviewer.code;
    const header = element('header', 'reply-reviewer-head');
    header.append(element('h2', '', heading));
    section.append(header);
    if (reviewer.url) {
      const link = element('a', '', '查看 OpenReview 原始评审 ↗');
      link.href = reviewer.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      header.append(link);
      const original = element('details', 'original-review');
      original.append(element('summary', '', '展开完整评审原文 · 2026-11-06 快照'), element('pre', '', reviewer.original));
      section.append(original);
    }
    reviewer.items.forEach((item, i) => section.append(makeCard(reviewer, item, i)));
    sections.append(section);
  }

  function route() {
    const hash = location.hash.slice(1);
    const replyMode = hash === 'responses' || hash.startsWith('response-');
    const reviewer = groups.find(r => hash === 'response-' + r.code || hash.startsWith('response-' + r.code + '-')) || groups[0];
    taskPanel.hidden = replyMode;
    replyPanel.hidden = !replyMode;
    page.classList.toggle('reply-mode', replyMode);
    document.getElementById('view-tasks').setAttribute('aria-selected', String(!replyMode));
    document.getElementById('view-responses').setAttribute('aria-selected', String(replyMode));
    for (const section of sections.children) section.hidden = section.dataset.replyReviewer !== reviewer.code;
    for (const link of navigation.children) link.setAttribute('aria-current', String(link.dataset.replyReviewer === reviewer.code));
    const outline = document.getElementById('response-outline');
    outline.replaceChildren();
    reviewer.items.forEach((item, i) => {
      const a = element('a', '', `${String(i + 1).padStart(2, '0')}  ${item.title}`);
      a.href = '#response-' + reviewer.code + '-' + item.id;
      outline.append(a);
    });
    if (hash.startsWith('response-')) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ block: 'start' }));
  }
  document.getElementById('view-tasks').addEventListener('click', () => { location.hash = 'tasks-panel'; });
  document.getElementById('view-responses').addEventListener('click', () => { location.hash = 'responses'; });
  document.querySelector('.workspace-tabs').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const button = document.getElementById(['ArrowLeft', 'Home'].includes(event.key) ? 'view-tasks' : 'view-responses');
    button.focus(); button.click();
  });
  window.addEventListener('hashchange', route);
  document.getElementById('export-replies').addEventListener('click', () => {
    const text = groups.map(reviewer => `## ${reviewer.name} (${reviewer.code})\n\n` + reviewer.items.map(item => `### ${item.subject}\n\n${editors.get(reviewer.code + '-' + item.id).input.value}`).join('\n\n')).join('\n\n');
    const url = URL.createObjectURL(new Blob([text + '\n'], { type: 'text/markdown;charset=utf-8' }));
    const a = element('a'); a.href = url; a.download = 'physflow-replies-' + new Date().toISOString().slice(0, 10) + '.md';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  route();
})();
