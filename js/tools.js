/* ツール：INSERT / SQL整形 / エラー辞典UI */
/**
 * INSERT譁・函謌舌ヤ繝ｼ繝ｫ
 * Excel / TSV / CSV 繧定ｲｼ繧贋ｻ倥￠縺ｦ INSERT 繧剃ｽ懊ｋ
 */
(function () {
  "use strict";

  var tableInput = document.getElementById("insertTableName");
  var dataInput = document.getElementById("insertInput");
  var output = document.getElementById("insertOutput");
  var generateBtn = document.getElementById("insertGenerate");
  var sampleBtn = document.getElementById("insertSample");
  var clearBtn = document.getElementById("insertClear");
  var copyBtn = document.getElementById("insertCopy");

  if (!dataInput || !output) return;

  var SAMPLE =
    "employee_id\temployee_name\tsalary\n" +
    "1\t逕ｰ荳ｭ\t300000\n" +
    "2\t菴占陸\t320000";

  function escapeIdent(name) {
    var s = String(name || "").trim();
    if (/^[a-z_][a-z0-9_]*$/i.test(s)) return s;
    return '"' + s.replace(/"/g, '""') + '"';
  }

  function formatValue(raw) {
    var v = String(raw == null ? "" : raw).trim();
    if (v === "" || /^null$/i.test(v)) return "NULL";
    if (/^-?\d+(\.\d+)?$/.test(v)) return v;
    if (/^(true|false)$/i.test(v)) return v.toLowerCase();
    return "'" + v.replace(/'/g, "''") + "'";
  }

  function detectDelimiter(headerLine) {
    if (headerLine.indexOf("\t") !== -1) return "\t";
    if (headerLine.indexOf(",") !== -1) return ",";
    return "\t";
  }

  function splitLine(line, delimiter) {
    if (delimiter === "\t") {
      return line.split("\t").map(function (c) { return c.trim(); });
    }
    var cells = [];
    var cur = "";
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        cells.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    return cells;
  }

  function buildInsert(tableName, text) {
    var lines = String(text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .map(function (l) { return l.trimEnd(); })
      .filter(function (l) { return l.trim() !== ""; });

    if (!lines.length) return { error: "繝・・繧ｿ繧定ｲｼ繧贋ｻ倥￠縺ｦ縺上□縺輔＞縲・ };

    var delimiter = detectDelimiter(lines[0]);
    var headers = splitLine(lines[0], delimiter).filter(function (h) { return h !== ""; });
    if (!headers.length) return { error: "1陦檎岼縺ｫ蛻怜錐縺悟ｿ・ｦ√〒縺吶・ };
    if (lines.length < 2) return { error: "繝・・繧ｿ陦後′縺ゅｊ縺ｾ縺帙ｓ・・陦檎岼莉･髯搾ｼ峨・ };

    var rows = [];
    for (var r = 1; r < lines.length; r++) {
      var cells = splitLine(lines[r], delimiter);
      while (cells.length < headers.length) cells.push("");
      rows.push(cells.slice(0, headers.length));
    }

    var table = escapeIdent(tableName || "table_name");
    var cols = headers.map(escapeIdent).join(",\n    ");
    var values = rows.map(function (row) {
      return "    (" + row.map(formatValue).join(", ") + ")";
    }).join(",\n");

    var sql =
      "INSERT INTO " + table + " (\n" +
      "    " + cols + "\n" +
      ")\nVALUES\n" +
      values + ";";

    return { sql: sql };
  }

  function highlight(sql) {
    return String(sql)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/'([^']|'')*'/g, function (m) {
        return '<span class="str">' + m + "</span>";
      })
      .replace(/\b(INSERT|INTO|VALUES|NULL)\b/gi, function (m) {
        return '<span class="kw">' + m.toUpperCase() + "</span>";
      });
  }

  function render() {
    var result = buildInsert(tableInput ? tableInput.value : "employees", dataInput.value);
    if (result.error) {
      output.textContent = result.error;
      return;
    }
    output.innerHTML = highlight(result.sql);
    output.dataset.raw = result.sql;
  }

  function copyText(text, btn) {
    if (!text) return;
    function ok() {
      if (!btn) return;
      var prev = btn.textContent;
      btn.textContent = "繧ｳ繝斐・貂医∩";
      btn.classList.add("is-ok");
      setTimeout(function () {
        btn.textContent = prev;
        btn.classList.remove("is-ok");
      }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok).catch(function () {
        window.prompt("繧ｳ繝斐・縺励※縺上□縺輔＞", text);
      });
    } else {
      window.prompt("繧ｳ繝斐・縺励※縺上□縺輔＞", text);
    }
  }

  if (generateBtn) generateBtn.addEventListener("click", render);
  if (sampleBtn) {
    sampleBtn.addEventListener("click", function () {
      dataInput.value = SAMPLE;
      if (tableInput) tableInput.value = "employees";
      render();
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      dataInput.value = "";
      output.textContent = "";
      delete output.dataset.raw;
    });
  }
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      copyText(output.dataset.raw || output.textContent, copyBtn);
    });
  }

  dataInput.addEventListener("input", function () {
    if (dataInput.value.trim()) render();
  });
})();
/**
 * SQL謨ｴ蠖｢繝・・繝ｫ・・ostgreSQL蜷代￠繝ｻ邁｡譏薙Ν繝ｼ繝ｫ繝吶・繧ｹ・・
 */
(function () {
  "use strict";

  var input = document.getElementById("formatInput");
  var output = document.getElementById("formatOutput");
  var runBtn = document.getElementById("formatRun");
  var sampleBtn = document.getElementById("formatSample");
  var clearBtn = document.getElementById("formatClear");
  var copyBtn = document.getElementById("formatCopy");

  if (!input || !output) return;

  var SAMPLE =
    "select e.name,d.department_name from employees e inner join departments d on e.department_id=d.department_id where e.salary>=300000 order by e.salary desc;";

  function stashStrings(sql) {
    var strings = [];
    var out = String(sql).replace(/'([^']|'')*'/g, function (m) {
      strings.push(m);
      return "\u0000S" + (strings.length - 1) + "\u0000";
    });
    return { text: out, strings: strings };
  }

  function restoreStrings(text, strings) {
    return text.replace(/\u0000S(\d+)\u0000/g, function (_, i) {
      return strings[Number(i)];
    });
  }

  function upperKeywords(s) {
    var list = [
      "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN", "FULL JOIN",
      "CROSS JOIN", "GROUP BY", "ORDER BY", "UNION ALL", "INSERT INTO",
      "DELETE FROM", "ON CONFLICT", "DO UPDATE", "DO NOTHING",
      "SELECT", "FROM", "WHERE", "AND", "OR", "HAVING", "LIMIT", "OFFSET",
      "UNION", "JOIN", "ON", "USING", "WITH", "AS", "ASC", "DESC",
      "VALUES", "UPDATE", "SET", "RETURNING", "DISTINCT", "NULL", "NOT",
      "IN", "BETWEEN", "LIKE", "ILIKE", "EXISTS", "CASE", "WHEN", "THEN",
      "ELSE", "END", "IS",
    ];
    list.forEach(function (kw) {
      var re = new RegExp("\\b" + kw.replace(/ /g, "\\s+") + "\\b", "gi");
      s = s.replace(re, kw);
    });
    return s;
  }

  function formatSql(sql) {
    var packed = stashStrings(String(sql || "").trim());
    var s = packed.text.replace(/\s+/g, " ").trim();
    if (!s) return "";

    s = upperKeywords(s);

    // 豈碑ｼ・ｼ皮ｮ怜ｭ舌∪繧上ｊ縺ｮ繧ｹ繝壹・繧ｹ
    s = s.replace(/\s*(>=|<=|<>|!=|=|>|<)\s*/g, " $1 ");

    // 荳ｻ隕∝唱縺ｮ蜑阪〒謾ｹ陦・
    var mains = [
      "WITH", "SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY",
      "LIMIT", "OFFSET", "UNION ALL", "UNION", "VALUES", "SET", "RETURNING",
      "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN", "FULL JOIN",
      "CROSS JOIN",
    ];
    mains.forEach(function (kw) {
      var re = new RegExp("\\s+(" + kw.replace(/ /g, "\\s+") + ")\\s+", "g");
      s = s.replace(re, "\n" + kw + " ");
    });

    s = s.replace(/\s+ON\s+/g, "\n  ON ");
    s = s.replace(/\s+AND\s+/g, "\n  AND ");
    s = s.replace(/\s+OR\s+/g, "\n  OR ");

    // SELECT / VALUES 縺ｮ繧ｫ繝ｳ繝・
    s = s.replace(/^(SELECT)\s+/m, "$1\n  ");
    s = s.replace(/,\s*/g, ",\n  ");

    // FROM 縺ｮ邁｡譏・AS 陬懷ｮ鯉ｼ・able alias・・
    s = s.replace(
      /\nFROM\s+(\S+)\s+(\w+)(?=\s|\n|$)/,
      function (_, table, alias) {
        if (/^(AS|WHERE|INNER|LEFT|RIGHT|FULL|CROSS|JOIN|GROUP|ORDER|LIMIT|OFFSET|UNION)$/i.test(alias)) {
          return "\nFROM " + table + " " + alias;
        }
        return "\nFROM " + table + " AS " + alias;
      }
    );
    s = s.replace(
      /\n((?:INNER|LEFT|RIGHT|FULL OUTER|FULL|CROSS) JOIN)\s+(\S+)\s+(\w+)(?=\s|\n|$)/,
      function (_, join, table, alias) {
        if (/^(AS|ON|WHERE|INNER|LEFT|RIGHT|FULL|CROSS|JOIN|GROUP|ORDER|LIMIT)$/i.test(alias)) {
          return "\n" + join + " " + table + " " + alias;
        }
        return "\n" + join + " " + table + " AS " + alias;
      }
    );

    var lines = s.split("\n").map(function (l) { return l.replace(/\s+$/g, ""); });
    var cleaned = [];
    lines.forEach(function (line) {
      if (!line.trim()) return;
      // SELECT 驟堺ｸ九・繧ｫ繝ｳ繝櫁｡後う繝ｳ繝・Φ繝・
      if (/^SELECT$/i.test(cleaned[cleaned.length - 1] || "")) {
        cleaned.push("  " + line.trim().replace(/^,\s*/, ""));
        return;
      }
      if (/^  ,/.test(line) || /^,/.test(line.trim())) {
        cleaned.push("  " + line.trim());
        return;
      }
      cleaned.push(line.trim());
    });

    s = cleaned.join("\n");
    s = restoreStrings(s, packed.strings);
    if (!/;\s*$/.test(s)) s += ";";
    return s;
  }

  function highlight(sql) {
    var tokens = [];
    function stash(html) {
      tokens.push(html);
      return "\u0000" + (tokens.length - 1) + "\u0000";
    }
    var text = String(sql);
    text = text.replace(/'([^']|'')*'/g, function (m) {
      return stash('<span class="str">' + m.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</span>");
    });
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    text = text.replace(
      /\b(WITH|SELECT|FROM|WHERE|AND|OR|GROUP|BY|HAVING|ORDER|LIMIT|OFFSET|UNION|ALL|INNER|LEFT|RIGHT|FULL|OUTER|JOIN|ON|USING|INSERT|INTO|VALUES|UPDATE|SET|DELETE|RETURNING|AS|ASC|DESC|DISTINCT|NULL|NOT|IN|BETWEEN|LIKE|ILIKE|EXISTS|CASE|WHEN|THEN|ELSE|END|IS)\b/gi,
      function (m) {
        return '<span class="kw">' + m.toUpperCase() + "</span>";
      }
    );
    return text.replace(/\u0000(\d+)\u0000/g, function (_, i) {
      return tokens[Number(i)];
    });
  }

  function render() {
    var sql = formatSql(input.value);
    if (!sql) {
      output.textContent = "";
      delete output.dataset.raw;
      return;
    }
    output.innerHTML = highlight(sql);
    output.dataset.raw = sql;
  }

  function copyText(text, btn) {
    if (!text) return;
    function ok() {
      var prev = btn.textContent;
      btn.textContent = "繧ｳ繝斐・貂医∩";
      btn.classList.add("is-ok");
      setTimeout(function () {
        btn.textContent = prev;
        btn.classList.remove("is-ok");
      }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok).catch(function () {
        window.prompt("繧ｳ繝斐・縺励※縺上□縺輔＞", text);
      });
    } else {
      window.prompt("繧ｳ繝斐・縺励※縺上□縺輔＞", text);
    }
  }

  if (runBtn) runBtn.addEventListener("click", render);
  if (sampleBtn) {
    sampleBtn.addEventListener("click", function () {
      input.value = SAMPLE;
      render();
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      input.value = "";
      output.textContent = "";
      delete output.dataset.raw;
    });
  }
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      copyText(output.dataset.raw || output.textContent, copyBtn);
    });
  }
})();
/**
 * 繧ｨ繝ｩ繝ｼ讀懃ｴ｢霎槫・ UI
 */
(function () {
  "use strict";

  var input = document.getElementById("errorInput");
  var results = document.getElementById("errorResults");
  var searchBtn = document.getElementById("errorSearch");
  var sampleBtn = document.getElementById("errorSample");
  var clearBtn = document.getElementById("errorClear");

  if (!input || !results || typeof ERROR_DICTIONARY === "undefined") return;

  var SAMPLE = 'column "employee_name" does not exist';

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function scoreEntry(query, entry) {
    var q = query.toLowerCase();
    var score = 0;
    var hit = 0;
    entry.patterns.forEach(function (p) {
      if (q.indexOf(p.toLowerCase()) !== -1) {
        hit++;
        score += 10 + p.length;
      }
    });
    if (entry.title && q.indexOf(entry.title.toLowerCase()) !== -1) score += 5;
    if (hit === 0) return 0;
    // 蜈ｨ繝代ち繝ｼ繝ｳ荳閾ｴ繧貞━驕・
    if (hit === entry.patterns.length) score += 20;
    return score;
  }

  function search(query) {
    var q = String(query || "").trim();
    if (!q) {
      results.innerHTML = '<div class="error-empty">繧ｨ繝ｩ繝ｼ譁・ｒ雋ｼ繧贋ｻ倥￠縺ｦ縲梧､懃ｴ｢縲阪ｒ謚ｼ縺励※縺上□縺輔＞縲・/div>';
      return;
    }

    var ranked = ERROR_DICTIONARY.map(function (entry) {
      return { entry: entry, score: scoreEntry(q, entry) };
    })
      .filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 5);

    if (!ranked.length) {
      results.innerHTML =
        '<div class="error-empty">荳閾ｴ縺吶ｋ逋ｻ骭ｲ縺後≠繧翫∪縺帙ｓ縺ｧ縺励◆縲ゅく繝ｼ繝ｯ繝ｼ繝峨ｒ遏ｭ縺擾ｼ井ｾ・ does not exist / syntax error・峨＠縺ｦ蜀肴､懃ｴ｢縺励※縺上□縺輔＞縲・/div>';
      return;
    }

    results.innerHTML = ranked.map(function (item) {
      var e = item.entry;
      var causes = e.causes.map(function (c) {
        return "<li>" + escapeHtml(c) + "</li>";
      }).join("");
      return (
        '<article class="error-card">' +
        "<h3>" + escapeHtml(e.title) + "</h3>" +
        '<p class="error-match">繝槭ャ繝∽ｾ・ ' + escapeHtml(e.matchHint) + "</p>" +
        "<h4>閠・∴繧峨ｌ繧句次蝗</h4>" +
        "<ul>" + causes + "</ul>" +
        "<h4>遒ｺ隱堺ｾ・/h4>" +
        "<pre>" + escapeHtml(e.checkSql) + "</pre>" +
        "</article>"
      );
    }).join("");
  }

  if (searchBtn) searchBtn.addEventListener("click", function () { search(input.value); });
  if (sampleBtn) {
    sampleBtn.addEventListener("click", function () {
      input.value = SAMPLE;
      search(SAMPLE);
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      input.value = "";
      results.innerHTML = "";
    });
  }

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      search(input.value);
    }
  });
})();
