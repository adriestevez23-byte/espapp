// js/utils.js
export const escapeHtml = s =>
  String(s).replace(/[&<>"']/g, m =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[m])
  );

/**
 * Simple sleep promise
 */
export const sleep = ms => new Promise(res => setTimeout(res, ms));
