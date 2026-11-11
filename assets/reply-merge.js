(function (root) {
  const diff3 = root.Diff3 || require('./vendor/diff3.js');
  const tokens = text => text.match(/\r\n|\n|[^\S\r\n]+|[\p{L}\p{N}_]+(?:[.,:/-][\p{L}\p{N}_]+)*%?|[^\s]/gu) || [];

  function mergeText(base, mine, theirs) {
    if (mine === theirs || theirs === base) return { ok: true, text: mine };
    if (mine === base) return { ok: true, text: theirs };
    if (typeof base !== 'string') return { ok: false, mine, theirs, base: null };
    const regions = diff3.diff3Merge(tokens(mine), tokens(base), tokens(theirs), { excludeFalseConflicts: true });
    if (regions.some(region => region.conflict)) return { ok: false, mine, theirs, base };
    return { ok: true, text: regions.flatMap(region => region.ok).join('') };
  }

  function mergeReplies(base, mine, theirs) {
    const replies = { ...theirs }, conflicts = {};
    for (const [key, value] of Object.entries(mine)) {
      const result = mergeText(base[key], value, theirs[key] ?? '');
      if (result.ok) replies[key] = result.text;
      else conflicts[key] = result;
    }
    return { replies, conflicts };
  }

  const api = { mergeText, mergeReplies };
  if (typeof module === 'object') module.exports = api;
  else root.PhysFlowMerge = api;
})(globalThis);
