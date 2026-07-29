/**
 * PostgreSQL SQL講義まとめ - アプリ本体
 * 目次・講義の描画 / 検索 / コピー / 目次ハイライト
 */

(function () {
  "use strict";

  const tocEl = document.getElementById("toc");
  const lessonsEl = document.getElementById("lessons");
  const searchInput = document.getElementById("searchInput");
  const noResults = document.getElementById("noResults");
  const lessonCountEl = document.getElementById("lessonCount");

  const CATEGORY_ORDER = [
    "basic",
    "join",
    "aggregate",
    "pg",
    "types",
    "functions",
    "advanced",
    "ddl",
    "admin",
  ];

  /* ---------- SQLハイライト ---------- */

  const KEYWORDS = [
    "SELECT", "FROM", "WHERE", "AND", "OR", "IN", "BETWEEN",
    "LIKE", "ILIKE", "IS", "NULL", "NOT", "ORDER", "BY",
    "ASC", "DESC", "LIMIT", "OFFSET", "INSERT", "INTO", "VALUES",
    "UPDATE", "SET", "DELETE", "INNER", "JOIN", "LEFT", "RIGHT",
    "FULL", "OUTER", "CROSS", "LATERAL", "ON", "AS", "GROUP", "HAVING",
    "COUNT", "SUM", "AVG", "MAX", "MIN", "DISTINCT", "RETURNING",
    "CONFLICT", "DO", "NOTHING", "EXCLUDED", "FILTER", "WITHIN",
    "STRING_AGG", "ARRAY_AGG", "ARRAY", "COALESCE", "NULLIF", "CASE",
    "WHEN", "THEN", "ELSE", "END", "CAST", "UNION", "ALL", "INTERSECT",
    "EXCEPT", "EXISTS", "WITH", "RECURSIVE", "OVER", "PARTITION",
    "ROW_NUMBER", "RANK", "DENSE_RANK", "NTILE", "LAG", "LEAD",
    "CREATE", "TABLE", "ALTER", "DROP", "TRUNCATE", "INDEX", "VIEW",
    "SCHEMA", "TYPE", "ENUM", "PRIMARY", "KEY", "FOREIGN", "REFERENCES",
    "UNIQUE", "CHECK", "DEFAULT", "CONSTRAINT", "CASCADE", "GENERATE",
    "GENERATED", "IDENTITY", "ALWAYS", "SERIAL", "BOOLEAN", "TRUE",
    "FALSE", "TEXT", "INTEGER", "INT", "BIGINT", "SMALLINT", "NUMERIC",
    "DECIMAL", "REAL", "DOUBLE", "PRECISION", "DATE", "TIME", "TIMESTAMP",
    "TIMESTAMPTZ", "INTERVAL", "UUID", "JSON", "JSONB", "BEGIN", "COMMIT",
    "ROLLBACK", "SAVEPOINT", "EXPLAIN", "ANALYZE", "VACUUM", "VERBOSE",
    "COPY", "FORMAT", "HEADER", "ENCODING", "COMMENT", "COLUMN",
    "USING", "GIN", "BTREE", "FOR", "SKIP", "LOCKED", "FETCH", "FIRST",
    "ROWS", "ONLY", "NULLS", "LAST", "IF", "RESTART", "ADD", "TO",
    "SEARCH_PATH", "CURRENT_DATE", "CURRENT_TIMESTAMP", "NOW",
    "EXTRACT", "DATE_TRUNC", "TO_CHAR", "TO_DATE", "TO_TIMESTAMP",
    "GENERATE_SERIES", "UNNEST", "ANY", "SOME", "LATERAL",
  ];

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function highlightSql(code) {
    const escaped = escapeHtml(code);
    const kwPattern = KEYWORDS
      .slice()
      .sort((a, b) => b.length - a.length)
      .join("|");

    const tokens = [];
    function stash(html) {
      tokens.push(html);
      return `\u0000${tokens.length - 1}\u0000`;
    }

    let result = escaped;

    // ドル引用符 $$...$$
    result = result.replace(/\$\$[\s\S]*?\$\$/g, (m) =>
      stash(`<span class="str">${m}</span>`)
    );

    result = result.replace(/'([^']*)'/g, (_, s) =>
      stash(`<span class="str">'${s}'</span>`)
    );

    result = result.replace(/\b(\d+(?:\.\d+)?)\b/g, (m) =>
      stash(`<span class="num">${m}</span>`)
    );

    result = result.replace(
      new RegExp(`\\b(${kwPattern})\\b`, "gi"),
      (m) => stash(`<span class="kw">${m.toUpperCase()}</span>`)
    );

    result = result.replace(/\u0000(\d+)\u0000/g, (_, i) => tokens[Number(i)]);

    return result;
  }

  /* ---------- 意味ブロック ---------- */

  function renderMeaning(section) {
    const { meaning, meaningOutro } = section;
    if (meaning == null) return "";

    let html = `<p class="meaning-intro">これは、</p>`;

    if (Array.isArray(meaning)) {
      html += `<ul class="meaning-list">`;
      meaning.forEach((item) => {
        html += `<li>${item}</li>`;
      });
      html += `</ul>`;
      html += `<p class="meaning-outro">${
        meaningOutro || "という意味になります。"
      }</p>`;
    } else {
      html += `<p class="meaning-outro">${meaning}という意味になります。</p>`;
    }

    return html;
  }

  /* ---------- セクション描画 ---------- */

  function renderSection(section) {
    let html = "";

    if (section.heading) {
      html += `<h3>${section.heading}</h3>`;
    }

    if (section.description) {
      html += `<p>${section.description}</p>`;
    }

    if (section.extraHtml) {
      html += section.extraHtml;
    }

    if (section.code) {
      const label = section.exampleLabel || "例えば、";
      html += `<p>${label}</p>`;
      html += `
        <div class="code-box">
          <div class="code-header">
            <span>〈/〉 SQL</span>
            <button type="button" class="copy-button" aria-label="コードをコピー">コピー</button>
          </div>
          <pre><code>${highlightSql(section.code)}</code></pre>
        </div>
      `;
    }

    html += renderMeaning(section);

    if (section.point) {
      html += `<div class="point">${section.point}</div>`;
    }

    return html;
  }

  /* ---------- 講義カード ---------- */

  function renderLesson(lesson) {
    const badge = lesson.badge
      ? `<span class="pg-badge" title="PostgreSQLならではの機能">PG専用</span>`
      : "";
    const catLabel =
      typeof CATEGORY_LABELS !== "undefined"
        ? CATEGORY_LABELS[lesson.category] || ""
        : "";
    const sectionsHtml = lesson.sections.map(renderSection).join("");

    return `
      <section class="lesson" id="${lesson.id}" data-category="${lesson.category || ""}" data-search="">
        <h2>
          <span class="lesson-title-text">講義${lesson.number}（${lesson.title}）</span>
          ${badge}
        </h2>
        ${catLabel ? `<p class="lesson-category">${catLabel}</p>` : ""}
        ${sectionsHtml}
      </section>
    `;
  }

  /* ---------- 目次（カテゴリ分け） ---------- */

  function renderToc() {
    const byCategory = {};
    lessons.forEach((l) => {
      const cat = l.category || "basic";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(l);
    });

    let html = "";
    CATEGORY_ORDER.forEach((cat) => {
      const items = byCategory[cat];
      if (!items || !items.length) return;
      const label =
        typeof CATEGORY_LABELS !== "undefined"
          ? CATEGORY_LABELS[cat]
          : cat;
      html += `<li class="toc-category" data-category="${cat}">${label}</li>`;
      items.forEach((l) => {
        const mark = l.badge ? `<span class="toc-pg">PG</span>` : "";
        html += `<li data-lesson-id="${l.id}"><a href="#${l.id}">講義${l.number} ${l.title}${mark}</a></li>`;
      });
    });

    tocEl.innerHTML = html;
  }

  /* ---------- 初期描画 ---------- */

  function renderAll() {
    if (lessonCountEl) {
      lessonCountEl.textContent = String(lessons.length);
    }

    renderToc();
    lessonsEl.innerHTML = lessons.map(renderLesson).join("");

    document.querySelectorAll(".lesson").forEach((el, i) => {
      const lesson = lessons[i];
      const catLabel =
        typeof CATEGORY_LABELS !== "undefined"
          ? CATEGORY_LABELS[lesson.category] || ""
          : "";
      const texts = [
        lesson.title,
        String(lesson.number),
        catLabel,
        lesson.badge || "",
        "postgresql",
        ...lesson.sections.flatMap((s) => [
          s.heading || "",
          (s.description || "").replace(/<[^>]+>/g, ""),
          (s.extraHtml || "").replace(/<[^>]+>/g, ""),
          s.code || "",
          Array.isArray(s.meaning) ? s.meaning.join(" ") : s.meaning || "",
          (s.point || "").replace(/<[^>]+>/g, ""),
        ]),
      ];
      el.dataset.search = texts.join(" ").toLowerCase();
    });

    bindCopyButtons();
  }

  /* ---------- コピー ---------- */

  function bindCopyButtons() {
    document.querySelectorAll(".copy-button").forEach((button) => {
      button.addEventListener("click", async () => {
        const code = button
          .closest(".code-box")
          .querySelector("code")
          .innerText;

        try {
          await navigator.clipboard.writeText(code);
          const original = button.textContent;
          button.textContent = "コピーしました";
          button.classList.add("copied");
          setTimeout(() => {
            button.textContent = original;
            button.classList.remove("copied");
          }, 1500);
        } catch {
          alert("コピーに失敗しました。");
        }
      });
    });
  }

  /* ---------- 検索 ---------- */

  function filterLessons(keyword) {
    const q = keyword.toLowerCase().trim();
    const lessonNodes = document.querySelectorAll(".lesson");
    let visibleCount = 0;
    const visibleCategories = new Set();

    lessonNodes.forEach((el) => {
      const match = !q || el.dataset.search.includes(q);
      el.classList.toggle("hidden", !match);
      if (match) {
        visibleCount++;
        if (el.dataset.category) visibleCategories.add(el.dataset.category);
      }
    });

    tocEl.querySelectorAll("li[data-lesson-id]").forEach((li) => {
      const id = li.dataset.lessonId;
      const lesson = document.getElementById(id);
      li.style.display =
        !q || (lesson && !lesson.classList.contains("hidden")) ? "" : "none";
    });

    tocEl.querySelectorAll("li.toc-category").forEach((li) => {
      const cat = li.dataset.category;
      li.style.display =
        !q || visibleCategories.has(cat) ? "" : "none";
    });

    noResults.classList.toggle("visible", visibleCount === 0);
  }

  searchInput.addEventListener("input", () => {
    filterLessons(searchInput.value);
  });

  /* ---------- 目次アクティブ表示 ---------- */

  function setupScrollSpy() {
    const links = tocEl.querySelectorAll("a");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach((a) => {
            a.classList.toggle(
              "active",
              a.getAttribute("href") === `#${id}`
            );
          });
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    document.querySelectorAll(".lesson").forEach((el) => {
      observer.observe(el);
    });
  }

  /* ---------- 起動 ---------- */

  renderAll();
  setupScrollSpy();
})();
