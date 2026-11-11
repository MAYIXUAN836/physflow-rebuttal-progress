(() => {
  'use strict';
  const data = window.PHYSFLOW_REPLIES;
  const groups = data.overview ? [data.overview, ...data.reviewers] : data.reviewers;
  const prefix = 'physflow-reply-draft-v1:';
  const limit = data.characterLimit;
  const editors = new Map();
  let activeReviewer = groups[0];
  let lastSubmission = '';
  const legacyDrafts = [];
  const sync = window.PhysFlowSync(groups, refreshSharedEditors);
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
    const state = sync.summary();
    document.getElementById('reply-draft-total').textContent = !state.ready ? '正在载入共享稿…' :
      state.conflicts ? `${state.conflicts} 份回复需要合并冲突，双方内容均已保留` :
      state.error ? state.error : state.pending ? `${state.pending} 份修改待同步${state.connected ? '' : ' · 请开启共享保存'}` : '正在查看共享最新版';
    document.getElementById('shared-disconnect').hidden = !state.connected;
    document.getElementById('shared-connect-label').textContent = state.connected ? '共享保存已连接' : '开启共享保存';
  }

  function refreshSharedEditors() {
    for (const editor of editors.values()) {
      const state = sync.state(editor.item);
      const value = sync.view(editor.item);
      if (!editor.composing && editor.input.value !== value) {
        const old = editor.input.value;
        let first = 0;
        while (first < old.length && old[first] === value[first]) first++;
        const offset = value.length - old.length;
        const start = editor.input.selectionStart, end = editor.input.selectionEnd;
        editor.input.value = value;
        if (document.activeElement === editor.input) editor.input.setSelectionRange(
          first < start ? Math.max(first, start + offset) : start,
          first < end ? Math.max(first, end + offset) : end);
      }
      if (!editor.composing) editor.displayed = value;
      editor.input.readOnly = !state.ready;
      editor.saveState.textContent = !state.ready ? '正在载入…' : state.conflict ? '有冲突 · 请核对双方文字' :
        state.pending ? (state.connected ? (state.busy ? '正在同步…' : '已备份 · 待同步') : '已备份 · 待开启共享保存') :
        state.error ? '离线缓存' : '与共享稿一致';
      editor.saveState.classList.toggle('error', Boolean(state.error || state.conflict));
      editor.conflictBox.hidden = !state.conflict;
      editor.conflictText.textContent = state.conflict?.theirs || '';
      editor.restore.disabled = !state.pending && !state.conflict;
      if (editor.lastRendered !== editor.input.value) renderEditor(editor);
    }
    updateDraftTotal();
    refreshSubmissionBlocks();
    // Task-view excerpts and response editors read the same shared text.
    const legacy = { r1: 'r1', 'data-split': 'data-split', 'latent-representation': 'latent-representation',
      'method-contribution': 'method-contribution', 'sft-dataset': 'sft-dataset', 'sft-baseline': 'sft-baseline',
      'terminal-only': 'terminal-status', 'general-editing': 'general-editing', cost: 'cost' };
    for (const [block, id] of Object.entries(legacy)) {
      const editor = [...editors.values()].find(e => e.item.syncKey === 'block:' + block);
      const prose = document.querySelector('#reply-' + id + ' .reply-prose');
      if (editor && prose) {
        const text = sync.view(editor.item);
        if (prose.dataset.sharedText !== text) { prose.innerHTML = md.render(text); prose.dataset.sharedText = text; }
      }
    }
  }

  function renderEditor(editor) {
    const { input, preview, counter, card } = editor;
    editor.lastRendered = input.value;
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
    const label = button.dataset.copyLabel || (button.dataset.copyLabel = button.textContent);
    try {
      await navigator.clipboard.writeText(editor.input.value);
      button.textContent = '已复制';
    } catch {
      editor.input.focus();
      editor.input.select();
      button.textContent = '已选中，请按 Ctrl / ⌘ C';
    }
    setTimeout(() => { button.textContent = label; }, 2200);
  }

  function submissionBlocks(reviewer) {
    let closing = '';
    const entries = reviewer.items.map(item => {
      let text = sync.view(item).trim();
      const ending = reviewer.submissionClosing;
      if (ending?.item === item.id) {
        const start = text.lastIndexOf('\n\n' + ending.startsWith);
        if (start >= 0) { closing = text.slice(start + 2); text = text.slice(0, start); }
      }
      if (reviewer !== data.overview && !text.includes(`**${item.subject}**`)) text = `**${item.subject}**\n\n${text}`;
      return { item, text };
    });
    const compose = (block, index, total) => {
      const heading = reviewer === data.overview ? '' :
        `**Response to Reviewer ${reviewer.code}: Part ${index + 1}/${total}${block.title ? '. ' + block.title : ''}**\n\n`;
      return heading + block.entries.map(entry => entry.text).join('\n\n');
    };
    let blocks;
    if (reviewer.submissionBlocks) {
      blocks = reviewer.submissionBlocks.map(block => ({ title: block.title,
        entries: block.items.map(id => entries.find(entry => entry.item.id === id)) }));
    } else {
      blocks = [];
      for (const entry of entries) {
        const target = blocks.find(block => compose({ entries: [...block.entries, entry] }, 0, entries.length).length <= limit);
        if (target) target.entries.push(entry);
        else blocks.push({ entries: [entry] });
      }
    }
    return blocks.map((block, index) => ({ ...block,
      text: compose(block, index, blocks.length) + (closing && index === blocks.length - 1 ? '\n\n' + closing : '') }));
  }

  function refreshSubmissionBlocks() {
    const reviewer = activeReviewer;
    const blocks = submissionBlocks(reviewer);
    const state = sync.summary();
    const signature = JSON.stringify([reviewer.code, blocks.map(block => block.text), state.ready, state.error, state.conflicts]);
    if (signature === lastSubmission) return;
    lastSubmission = signature;
    const panel = document.getElementById('response-blocks');
    const opened = new Set([...panel.querySelectorAll('details[open]')].map(detail => detail.id));
    panel.replaceChildren();
    const heading = element('div', 'submission-heading');
    heading.append(element('h2', '', '提交用回复 Blocks'),
      element('span', '', `${reviewer.name} · ${blocks.length} 个 Blocks`));
    panel.append(heading, element('p', 'submission-note',
      `每个 Block 复制为一条评论，目标不超过 ${limit.toLocaleString('en-US')} 字符。下方逐点修改后，这里同步更新；回复点保持完整。`));
    if (!state.ready || state.error || state.conflicts) panel.append(element('p', 'submission-warning',
      !state.ready ? '正在载入共享稿…' : state.conflicts ? '共享稿有冲突，请先在下方核对双方文字。' : '当前使用缓存内容，请刷新共享稿后核对。'));
    blocks.forEach((block, index) => {
      const count = block.text.length;
      const card = element('article', 'submission-block' + (count > limit ? ' over-limit' : ''));
      const head = element('div', 'submission-block-head');
      const title = element('h3', '', `Block ${index + 1} / ${blocks.length}`);
      const counter = element('span', 'char-counter' + (count > limit ? ' over-limit' : count >= 4500 ? ' near-limit' : ''),
        `${count.toLocaleString('en-US')} / ${limit} 字符${count > limit ? ` · 超出 ${count - limit}` : ` · 还可写 ${limit - count}`}`);
      const copy = element('button', 'editor-button primary', `复制 Block ${index + 1}`);
      copy.type = 'button';
      copy.disabled = !state.ready;
      head.append(title, counter, copy);
      card.append(head);
      if (block.title) card.append(element('p', 'submission-topic', block.title));
      const points = element('div', 'submission-points');
      points.append(element('span', '', '包含回复点：'));
      block.entries.forEach(({ item }) => {
        const link = element('a', '', item.title);
        link.href = '#response-' + reviewer.code + '-' + item.id;
        points.append(link);
      });
      card.append(points);
      if (block.entries.some(({ item }) => item.pending)) card.append(element('p', 'submission-warning', '含待补充回复点，提交前请核对。'));
      const detail = element('details', 'submission-content');
      detail.id = `submission-${reviewer.code}-${index + 1}`;
      detail.open = opened.has(detail.id);
      detail.append(element('summary', '', '展开合并正文 · Markdown'));
      const input = element('textarea', 'markdown-input');
      input.readOnly = true;
      input.spellcheck = false;
      input.value = block.text;
      input.setAttribute('aria-label', `${reviewer.name} Block ${index + 1} 合并正文`);
      detail.append(input);
      card.append(detail);
      copy.addEventListener('click', () => copyEditor({ input }, copy));
      panel.append(card);
    });
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
    if (saved) legacyDrafts.push({ key, item, saved });
    input.value = sync.view(item);
    input.readOnly = true;
    const foot = element('div', 'editor-column-foot');
    const counter = element('span', 'char-counter');
    counter.id = 'count-' + key;
    counter.setAttribute('aria-live', 'polite');
    input.setAttribute('aria-describedby', counter.id);
    const saveState = element('span', 'draft-save-state', '正在载入共享稿…');
    foot.append(counter, saveState);
    source.append(sourceHead, input, foot);
    const rendered = element('div', 'editor-column');
    const renderedHead = element('div', 'editor-column-head');
    renderedHead.append(element('span', '', '实时预览'), element('span', '', '仅预览英文回复'));
    const preview = element('div', 'markdown-preview');
    preview.setAttribute('lang', 'en');
    const renderedFoot = element('div', 'editor-column-foot');
    renderedFoot.append(element('span', '', '复制内容不包含审稿原文和中文分析'));
    const restore = element('button', 'editor-button restore-button', '撤销未同步修改');
    restore.type = 'button';
    renderedFoot.append(restore);
    rendered.append(renderedHead, preview, renderedFoot);
    columns.append(source, rendered);
    card.append(columns);
    const conflictBox = element('div', 'shared-conflict');
    conflictBox.hidden = true;
    conflictBox.append(element('strong', '', '同一处文字有不同修改，双方内容都已保留。'),
      element('p', '', '下方是共享稿；上方编辑框保留你的内容。请核对或手动合并后选择。'));
    const conflictText = element('pre', 'shared-conflict-text');
    const useShared = element('button', 'editor-button', '采用共享稿');
    const useEdited = element('button', 'editor-button primary', '将编辑框内容作为合并稿');
    useShared.type = useEdited.type = 'button';
    conflictBox.append(conflictText, useShared, useEdited);
    card.append(conflictBox);
    const editor = { key, item, reviewer, card, input, preview, counter, saveState, restore,
      conflictBox, conflictText, displayed: input.value, composing: false };
    editors.set(key, editor);
    input.addEventListener('input', () => {
      if (!editor.composing) sync.edit(item, editor.displayed, input.value);
    });
    input.addEventListener('compositionstart', () => { editor.composing = true; });
    input.addEventListener('compositionend', () => { editor.composing = false; sync.edit(item, editor.displayed, input.value); });
    useShared.addEventListener('click', () => sync.accept(item, false));
    useEdited.addEventListener('click', () => sync.accept(item, true));
    copy.addEventListener('click', () => copyEditor(editor, copy));
    restore.addEventListener('click', () => {
      if (!window.confirm('撤销这份回复尚未同步的修改，恢复共享稿？')) return;
      sync.restore(item);
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
    activeReviewer = reviewer;
    refreshSubmissionBlocks();
    taskPanel.hidden = replyMode;
    replyPanel.hidden = !replyMode;
    page.classList.toggle('reply-mode', replyMode);
    document.getElementById('view-tasks').setAttribute('aria-selected', String(!replyMode));
    document.getElementById('view-responses').setAttribute('aria-selected', String(replyMode));
    for (const section of sections.children) section.hidden = section.dataset.replyReviewer !== reviewer.code;
    for (const link of navigation.children) link.setAttribute('aria-current', String(link.dataset.replyReviewer === reviewer.code));
    const outline = document.getElementById('response-outline');
    outline.replaceChildren();
    const blocksLink = element('a', '', '↑ 提交用回复 Blocks');
    blocksLink.href = '#response-' + reviewer.code;
    outline.append(blocksLink);
    reviewer.items.forEach((item, i) => {
      const a = element('a', '', `${String(i + 1).padStart(2, '0')}  ${item.title}`);
      a.href = '#response-' + reviewer.code + '-' + item.id;
      outline.append(a);
    });
    if (hash.startsWith('response-')) requestAnimationFrame(() =>
      document.getElementById(hash === 'response-' + reviewer.code ? 'response-blocks' : hash)?.scrollIntoView({ block: 'start' }));
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
  document.getElementById('shared-auth-form').addEventListener('submit', async event => {
    event.preventDefault();
    const input = document.getElementById('shared-token');
    const message = document.getElementById('shared-auth-status');
    const button = event.currentTarget.querySelector('button[type="submit"]');
    button.disabled = true; message.textContent = '正在连接…';
    try {
      await sync.connect(input.value);
      message.textContent = '已连接；待同步修改会自动保存。';
      document.getElementById('shared-connection').open = false;
    } catch (error) { message.textContent = error.message; }
    finally { input.value = ''; button.disabled = false; }
  });
  document.getElementById('shared-disconnect').addEventListener('click', sync.disconnect);
  document.getElementById('shared-refresh').addEventListener('click', sync.refresh);
  sync.start(legacyDrafts);
})();
