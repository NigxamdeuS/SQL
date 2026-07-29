/**
 * 作成タブ — 選んだタグと完全一致するSQLだけを生成する
 * 近い候補は出さない。できない組み合わせはエラー表示。
 */
(function () {
  "use strict";

  if (typeof INTENT_TAG_GROUPS === "undefined") return;
  if (typeof buildExactSqlFromIntent !== "function") return;

  const selected = new Set();
  let hasSearched = false;
  const PLACEHOLDER_RE =
    /テーブル\d+|列名\d+|並べ替え列|検索列|別名\d*|集計条件|条件\d*|演算子|並び順|開始値|終了値|件数|倍率|値\d+|'%キーワード%'|'パターン'|\{"キー": "値"\}|\(値1, 値2\)/g;

  const SQL_KEYWORDS = [
    "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "BETWEEN", "LIKE", "ILIKE",
    "IS", "NULL", "AS", "ORDER", "BY", "ASC", "DESC", "LIMIT", "OFFSET",
    "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE",
    "GROUP", "HAVING", "COUNT", "SUM", "AVG", "MAX", "MIN",
    "INNER", "LEFT", "RIGHT", "FULL", "OUTER", "JOIN", "ON", "USING", "LATERAL",
    "WITH", "RECURSIVE", "UNION", "ALL", "EXISTS", "CASE", "WHEN", "THEN", "ELSE", "END",
    "DISTINCT", "RETURNING", "CONFLICT", "DO", "NOTHING", "EXCLUDED",
    "BEGIN", "COMMIT", "ROLLBACK", "CREATE", "INDEX", "EXPLAIN", "ANALYZE",
    "OVER", "PARTITION", "ROW_NUMBER", "RANK", "LAG", "COALESCE", "NULLIF",
    "GENERATE_SERIES", "UNNEST", "ARRAY", "ARRAY_AGG", "STRING_AGG",
  ];

  function hasSel(id) {
    return selected.has(id);
  }

  const els = {
    groups: document.getElementById("intentGroups"),
    summary: document.getElementById("intentSelectedSummary"),
    ask: document.getElementById("intentAsk"),
    clear: document.getElementById("intentClear"),
    search: document.getElementById("intentSearch"),
    examples: document.getElementById("intentExamples"),
    templateList: document.getElementById("templateList"),
    emptyState: document.getElementById("emptyState"),
    resultCount: document.getElementById("resultCount"),
    errorBox: document.getElementById("intentError"),
  };

  if (!els.groups || !els.templateList) return;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function allTags() {
    return INTENT_TAG_GROUPS.flatMap(function (g) {
      return g.tags.map(function (t) {
        return { id: t.id, label: t.label, hints: t.hints || [] };
      });
    });
  }

  function labelOf(id) {
    var tag = allTags().find(function (t) { return t.id === id; });
    return tag ? tag.label : id;
  }

  function labelsOf(ids) {
    return ids.map(labelOf).join("・");
  }

  function selectedLabels() {
    return allTags()
      .filter(function (t) { return selected.has(t.id); })
      .map(function (t) { return t.label; });
  }

  function highlightSql(sql) {
    const tokens = [];
    function stash(html) {
      tokens.push(html);
      return "\u0000" + (tokens.length - 1) + "\u0000";
    }
    let text = String(sql);
    text = text.replace(PLACEHOLDER_RE, function (m) {
      return stash('<span class="ph">' + escapeHtml(m) + "</span>");
    });
    text = text.replace(/'([^'\\]|\\.)*'/g, function (m) {
      return stash('<span class="str">' + escapeHtml(m) + "</span>");
    });
    text = escapeHtml(text);
    const kwPattern = new RegExp(
      "\\b(" + SQL_KEYWORDS.map(function (k) {
        return k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }).join("|") + ")\\b",
      "gi"
    );
    text = text.replace(kwPattern, function (m) {
      return '<span class="kw">' + m.toUpperCase() + "</span>";
    });
    return text.replace(/\u0000(\d+)\u0000/g, function (_, i) {
      return tokens[Number(i)];
    });
  }

  /** 本当に両立できない組み合わせだけ（足し引きしやすいよう緩め） */
  function findConflicts() {
    var reasons = [];
    var actions = ["fetch", "insert", "update", "delete"].filter(hasSel);
    var aggregates = ["sum", "avg", "count", "max", "min"].filter(hasSel);

    if (actions.length >= 2) {
      reasons.push("「" + labelsOf(actions) + "」は別々のSQLです。1つだけ選んでください。");
    }

    if (hasSel("returning") && !hasSel("insert") && !hasSel("update") && !hasSel("delete") &&
        !hasSel("upsert") && !hasSel("insert_select") && !hasSel("multi_insert")) {
      reasons.push("「" + labelOf("returning") + "」は追加・更新・削除と一緒に使います。");
    }

    // プレーン INSERT / UPSERT（INSERT SELECT 以外）は取得系と混ぜない
    if ((hasSel("insert") && !hasSel("insert_select") && !hasSel("multi_insert")) || hasSel("upsert")) {
      if (aggregates.length || hasSel("per_group") || hasSel("join") || hasSel("left_join") ||
          hasSel("sort") || hasSel("filter") || hasSel("after_group") || hasSel("window") ||
          hasSel("select_columns") || hasSel("alias") || hasSel("like")) {
        reasons.push(
          "通常の「追加 / UPSERT」と取得・条件タグは同時に使えません。" +
          "別テーブルから追加したいときは「別テーブルから追加」を選んでください。"
        );
      }
    }

    if (hasSel("upsert") && hasSel("delete")) {
      reasons.push("「" + labelOf("upsert") + "」と「" + labelOf("delete") + "」は同時に使えません。");
    }

    if (hasSel("unique") && aggregates.length > 0) {
      reasons.push("「" + labelOf("unique") + "」と集計は同時に使えません。");
    }

    if (hasSel("like") && hasSel("case_insensitive")) {
      reasons.push("「" + labelOf("like") + "」と「" + labelOf("case_insensitive") + "」はどちらか一方にしてください。");
    }

    var joinKinds = ["join", "left_join", "right_join", "full_join", "cross_join"].filter(hasSel);
    if (joinKinds.length >= 2) {
      reasons.push("結合の種類（" + labelsOf(joinKinds) + "）は1つだけ選んでください。");
    }

    if (hasSel("self_join") && ["left_join", "right_join", "full_join", "cross_join"].some(hasSel)) {
      reasons.push("「" + labelOf("self_join") + "」と他の結合種類は同時に選ばないでください。");
    }

    if (hasSel("exists") && hasSel("not_exists")) {
      reasons.push("「" + labelOf("exists") + "」と「" + labelOf("not_exists") + "」はどちらか一方にしてください。");
    }

    if (hasSel("scalar_subquery") && hasSel("multirow_subquery")) {
      reasons.push(
        "「" + labelOf("scalar_subquery") + "」と「" + labelOf("multirow_subquery") + "」はどちらか一方にしてください。"
      );
    }

    if (hasSel("all_columns") && hasSel("select_columns")) {
      reasons.push("「" + labelOf("all_columns") + "」と「" + labelOf("select_columns") + "」はどちらか一方にしてください。");
    }

    if (hasSel("all_columns") && aggregates.length) {
      reasons.push("「" + labelOf("all_columns") + "」と集計は同時に使えません。");
    }

    if (hasSel("insert_select") && (hasSel("update") || hasSel("delete") || hasSel("upsert") || hasSel("insert"))) {
      reasons.push("「" + labelOf("insert_select") + "」と他の追加・更新・削除は同時に使えません。");
    }

    var txTags = ["begin", "commit", "rollback", "savepoint"].filter(hasSel);
    if (txTags.length && (
      aggregates.length || hasSel("filter") || hasSel("join") || hasSel("select_columns") ||
      hasSel("insert") || hasSel("update") || hasSel("delete") || hasSel("fetch") ||
      hasSel("explain") || hasSel("explain_analyze") || hasSel("create_table") || hasSel("view")
    )) {
      reasons.push("「" + labelsOf(txTags) + "」は単独で選んでください。");
    }

    var ddl = ["create_table", "constraints", "index"].filter(hasSel);
    if (ddl.length && (aggregates.length || hasSel("filter") || hasSel("join") || hasSel("insert") ||
        hasSel("update") || hasSel("delete") || hasSel("select_columns") || hasSel("fetch"))) {
      reasons.push("「" + labelsOf(ddl) + "」は定義用です。取得・更新系とは分けてください。");
    }

    return reasons;
  }

  /** 選択タグをすべて満たすテンプレート（intent 優先・完全一致を最優先） */
  function selectedIntentSet() {
    var sel = new Set(selected);
    var nonFetch = [
      "insert", "update", "delete", "upsert",
      "create_table", "constraints", "view", "index",
      "begin", "commit", "rollback", "savepoint",
      "explain", "explain_analyze",
      "multi_insert", "insert_select", "update_join", "delete_join", "update_cte",
    ];
    var hasNonFetch = false;
    sel.forEach(function (id) {
      if (nonFetch.indexOf(id) !== -1) hasNonFetch = true;
    });
    if (!hasNonFetch) sel.add("fetch");
    // 「紐づかない行」だけで LEFT JOIN + IS NULL が付くようにする
    if (sel.has("no_match")) sel.add("left_join");
    return sel;
  }

  var generatedExact = null;

  /** 選択タグだけから完全一致のSQLを1件作る（近い候補は出さない） */
  function buildExactTemplate() {
    if (typeof buildExactSqlFromIntent !== "function") return null;
    var sel = selectedIntentSet();
    var sql = buildExactSqlFromIntent(sel);
    if (!sql) return null;
    var labels = selectedLabels();
    var tags = [];
    sel.forEach(function (id) {
      var lab = labelOf(id);
      if (lab && tags.indexOf(lab) === -1) tags.push(lab);
    });
    return {
      id: "generated-exact",
      name: labels.length ? labels.slice(0, 8).join("・") : "SQL",
      purpose: "選択タグと完全一致のSQL",
      category: "SELECT",
      tags: tags.slice(0, 16),
      intent: Array.from(sel).sort(),
      sql: sql,
      notes: ["選んだタグに対応する句だけを含みます。近い候補や余分な句は付けません。"],
    };
  }

  function renderGroups() {
    els.groups.innerHTML = INTENT_TAG_GROUPS.map(function (group) {
      const tags = group.tags.map(function (tag) {
        const active = selected.has(tag.id) ? " is-active" : "";
        return (
          '<button type="button" class="intent-tag' + active + '" data-tag="' + escapeHtml(tag.id) + '">' +
          escapeHtml(tag.label) +
          "</button>"
        );
      }).join("");
      return (
        '<div class="intent-group">' +
        '<p class="intent-group-title">' + escapeHtml(group.label) + "</p>" +
        '<div class="intent-tag-list">' + tags + "</div>" +
        "</div>"
      );
    }).join("");
  }

  function renderSummary() {
    if (!els.summary) return;
    if (selected.size === 0) {
      els.summary.textContent = "タグ未選択 — 選んで「検索」を押してください";
      els.summary.classList.remove("has-selection");
      return;
    }
    els.summary.textContent =
      "選択中: " + selectedLabels().join(" × ") + " → 「検索」を押す";
    els.summary.classList.add("has-selection");
  }

  function hideError() {
    if (!els.errorBox) return;
    els.errorBox.hidden = true;
    els.errorBox.innerHTML = "";
  }

  function showError(title, reasons) {
    if (!els.errorBox) return;
    var reasonHtml = (reasons || []).map(function (r) {
      return "<li>" + escapeHtml(r) + "</li>";
    }).join("");

    els.errorBox.hidden = false;
    els.errorBox.innerHTML =
      '<h3 class="intent-conflict-title">' + escapeHtml(title) + "</h3>" +
      (reasonHtml ? "<ul class=\"intent-conflict-list\">" + reasonHtml + "</ul>" : "");
  }

  function renderCard(tpl) {
    var tagsHtml = (tpl.tags || []).slice(0, 8).map(function (tag) {
      return '<span class="mini-tag">' + escapeHtml(tag) + "</span>";
    }).join("");

    var notesHtml = (tpl.notes || []).length
      ? '<div class="notes"><h4>注意事項</h4><ul>' +
        tpl.notes.map(function (n) { return "<li>" + escapeHtml(n) + "</li>"; }).join("") +
        "</ul></div>"
      : "";

    return (
      '<article class="template-card" data-id="' + escapeHtml(tpl.id) + '">' +
      "<h3>" + escapeHtml(tpl.name) + "</h3>" +
      '<p class="template-purpose">' + escapeHtml(tpl.purpose) + "</p>" +
      '<p class="match-hint">選択タグと完全一致</p>' +
      '<div class="template-tags">' + tagsHtml + "</div>" +
      '<div class="sql-box">' +
      '<div class="sql-box-head"><span>SQLテンプレート</span>' +
      '<button type="button" class="copy-btn" data-copy="' + escapeHtml(tpl.id) + '">コピー</button></div>' +
      "<pre>" + highlightSql(tpl.sql) + "</pre>" +
      "</div>" +
      notesHtml +
      "</article>"
    );
  }

  function renderResults() {
    hideError();

    if (!hasSearched) {
      if (els.resultCount) els.resultCount.textContent = "";
      els.emptyState.hidden = false;
      els.emptyState.textContent = "タグを選んで「検索」ボタンを押してください。";
      els.templateList.innerHTML = "";
      return;
    }

    if (selected.size === 0) {
      if (els.resultCount) els.resultCount.textContent = "";
      els.emptyState.hidden = true;
      els.templateList.innerHTML = "";
      showError("タグが選ばれていません", [
        "やりたいことを表すタグを選んでから、もう一度「検索」を押してください。",
      ]);
      return;
    }

    var conflicts = findConflicts();
    if (conflicts.length) {
      if (els.resultCount) els.resultCount.textContent = "エラー";
      els.emptyState.hidden = true;
      els.templateList.innerHTML = "";
      showError("このタグの組み合わせは使えません", conflicts);
      return;
    }

    generatedExact = null;
    // 近い候補は出さない。選択タグから完全一致SQLを必ず1件だけ生成する
    generatedExact = buildExactTemplate();
    var list = generatedExact ? [generatedExact] : [];

    if (els.resultCount) {
      els.resultCount.textContent = list.length ? "完全一致 1件" : "0 件";
    }

    if (list.length === 0) {
      els.emptyState.hidden = true;
      els.templateList.innerHTML = "";
      showError(
        "この組み合わせのSQLを作れません",
        [
          "選択: " + selectedLabels().join(" × "),
          "タグの組み合わせを変えて再度「検索」してください。",
        ]
      );
      return;
    }

    els.emptyState.hidden = true;
    els.templateList.innerHTML = list.map(renderCard).join("");
  }

  function refreshTagsOnly() {
    renderGroups();
    renderSummary();
  }

  function runSearch() {
    hasSearched = true;
    refreshTagsOnly();
    renderResults();
    var panel = document.querySelector(".intent-result-panel");
    if (panel) {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function toggleTag(id) {
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    refreshTagsOnly();
  }

  function clearAll() {
    selected.clear();
    hasSearched = false;
    if (els.ask) els.ask.value = "";
    refreshTagsOnly();
    renderResults();
  }

  function applyAskText(text) {
    const q = String(text || "").toLowerCase();
    if (!q.trim()) return;
    selected.clear();
    allTags().forEach(function (tag) {
      const hit = (tag.hints || []).some(function (h) {
        return q.indexOf(String(h).toLowerCase()) !== -1;
      }) || q.indexOf(tag.label.toLowerCase()) !== -1;
      if (hit) selected.add(tag.id);
    });
    if (/取得|一覧|出して|見せて|調べ/.test(q)) selected.add("fetch");
    refreshTagsOnly();
  }

  function renderExamples() {
    if (!els.examples || typeof INTENT_EXAMPLES === "undefined") return;
    els.examples.innerHTML = INTENT_EXAMPLES.map(function (ex) {
      return '<button type="button" class="intent-example" data-ask="' + escapeHtml(ex) + '">' +
        escapeHtml(ex) + "</button>";
    }).join("");
  }

  async function copySql(id, button) {
    var tpl = (generatedExact && generatedExact.id === id) ? generatedExact : null;
    if (!tpl) return;
    try {
      await navigator.clipboard.writeText(tpl.sql);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = tpl.sql;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    button.classList.add("is-ok");
    button.textContent = "コピー済み";
    setTimeout(function () {
      button.classList.remove("is-ok");
      button.textContent = "コピー";
    }, 1600);
  }

  function bind() {
    els.groups.addEventListener("click", function (e) {
      const btn = e.target.closest(".intent-tag");
      if (!btn) return;
      toggleTag(btn.getAttribute("data-tag"));
    });

    if (els.clear) els.clear.addEventListener("click", clearAll);
    if (els.search) els.search.addEventListener("click", runSearch);

    if (els.ask) {
      els.ask.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          applyAskText(els.ask.value);
          runSearch();
        }
      });
    }

    if (els.examples) {
      els.examples.addEventListener("click", function (e) {
        const btn = e.target.closest(".intent-example");
        if (!btn) return;
        const text = btn.getAttribute("data-ask") || "";
        if (els.ask) els.ask.value = text;
        applyAskText(text);
        runSearch();
      });
    }

    els.templateList.addEventListener("click", function (e) {
      const btn = e.target.closest(".copy-btn");
      if (!btn) return;
      copySql(btn.getAttribute("data-copy"), btn);
    });
  }

  renderExamples();
  bind();
  refreshTagsOnly();
  renderResults();
})();
