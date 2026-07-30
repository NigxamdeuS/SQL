/**
 * SQL生成ツール（INSERT / UPDATE）— PostgreSQL向け
 */
(function () {
  "use strict";

  var tableInput = document.getElementById("insertTableName");
  var tableNameError = document.getElementById("tableNameError");
  var dataInput = document.getElementById("insertInput");
  var output = document.getElementById("insertOutput");
  var statusEl = document.getElementById("insertStatus");
  var warningsEl = document.getElementById("insertWarnings");
  var previewWrap = document.getElementById("insertPreviewWrap");
  var previewTable = document.getElementById("insertPreview");
  var colConfigWrap = document.getElementById("colConfigWrap");
  var colConfigBody = document.getElementById("colConfigBody");
  var generateBtn = document.getElementById("insertGenerate");
  var sampleBtn = document.getElementById("insertSample");
  var clearBtn = document.getElementById("insertClear");
  var copyBtn = document.getElementById("insertCopy");
  var emptyModeEl = document.getElementById("emptyMode");
  var batchSizeEl = document.getElementById("insertBatchSize");
  var includeKeyEl = document.getElementById("updateIncludeKeyInSet");
  var insertOptions = document.getElementById("genInsertOptions");
  var updateOptions = document.getElementById("genUpdateOptions");
  var tabButtons = document.querySelectorAll("[data-gen-tab]");
  var styleRadios = document.querySelectorAll('input[name="insertStyle"]');

  if (!dataInput || !output) return;

  var genMode = "insert";
  var colMeta = []; // { name, include, type, where }
  var lastHeaderKey = "";
  var LARGE_WARN = 2000;

  var SAMPLE_INSERT =
    "id\tname\tmemo\tamount\n" +
    "1\tO'Brien\t通常データ\t1000\n" +
    '2\t山田\t大阪,京都を担当\t1,000\n' +
    "3\t\t空文字\t\n" +
    "4\tNULL\tnullという文字\tNULL\n" +
    "5\t00123\t先頭ゼロ\t-500.25\n" +
    "6\t田中\t改行なしメモ\t0";

  var SAMPLE_UPDATE =
    "employee_id\temployee_name\tsalary\t更新内容メモ\n" +
    "101\t佐々木 太郎\t420,000\t昇給対応\n" +
    "102\tO'Brien\t380000\tメモのみ\n" +
    "103\t山田\t\t空欄給与";

  var PLACEHOLDER =
    '<span class="insert-placeholder">データを貼ると、ここに SQL が表示されます。</span>';

  /* ---------- ユーティリティ ---------- */

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function quoteIdent(name) {
    return String(name || "")
      .trim()
      .split(".")
      .map(function (part) {
        var s = part.trim();
        if (/^[a-z_][a-z0-9_]*$/i.test(s) && !isReserved(s)) return s;
        return '"' + s.replace(/"/g, '""') + '"';
      })
      .join(".");
  }

  function isReserved(name) {
    // PostgreSQL 予約語（主要なもの）
    return /^(all|analyse|analyze|and|any|array|as|asc|asymmetric|authorization|binary|both|case|cast|check|collate|column|concurrently|constraint|create|cross|current_catalog|current_date|current_role|current_schema|current_time|current_timestamp|current_user|default|deferrable|desc|distinct|do|else|end|except|false|fetch|for|foreign|freeze|from|full|grant|group|having|ilike|in|initially|inner|intersect|into|is|isnull|join|lateral|leading|left|like|limit|localtime|localtimestamp|natural|not|notnull|null|offset|on|only|or|order|outer|overlaps|placing|primary|references|returning|right|select|session_user|similar|some|symmetric|table|tablesample|then|to|trailing|true|union|unique|user|using|variadic|verbose|when|where|window|with)$/i.test(
      name
    );
  }

  function validateIdent(name, label) {
    var s = String(name || "").trim();
    if (!s) return label + "が空です。";
    if (/[\s\u3000]/.test(s)) {
      return label + "に空白や改行は使えません。";
    }
    if (/[;\n\r]|--|\/\*|\*\//.test(s)) {
      return label + "に ; や改行、コメント記号は使えません。";
    }
    if (/[`'\\]/.test(s)) {
      return label + "に不正な文字があります。";
    }
    // schema.table 形式を許可（各パートは英数字・_・日本語）
    if (
      !/^[A-Za-z_\u3040-\u30ff\u3400-\u9fff\u3005][A-Za-z0-9_\u3040-\u30ff\u3400-\u9fff\u3005]*(\.[A-Za-z_\u3040-\u30ff\u3400-\u9fff\u3005][A-Za-z0-9_\u3040-\u30ff\u3400-\u9fff\u3005]*)?$/.test(
        s
      )
    ) {
      return label + "は英数字・アンダースコア・日本語のみ使用できます（空白不可）。";
    }
    return "";
  }

  function quoteString(v) {
    return "'" + String(v).replace(/'/g, "''") + "'";
  }

  function getEmptyMode() {
    return emptyModeEl ? emptyModeEl.value : "null";
  }

  function getStyle() {
    var checked = document.querySelector('input[name="insertStyle"]:checked');
    return checked ? checked.value : "multi";
  }

  function getBatchSize() {
    var n = batchSizeEl ? Number(batchSizeEl.value) : 0;
    return !n || n < 0 ? 0 : Math.floor(n);
  }

  /* ---------- パース ---------- */

  function detectDelimiter(sample) {
    var tabs = (sample.match(/\t/g) || []).length;
    var commas = 0;
    var inQ = false;
    for (var i = 0; i < sample.length; i++) {
      var ch = sample[i];
      if (ch === '"') {
        if (inQ && sample[i + 1] === '"') i++;
        else inQ = !inQ;
      } else if (ch === "," && !inQ) commas++;
    }
    if (tabs > 0 && tabs >= commas) return "\t";
    if (commas > 0) return ",";
    return "\t";
  }

  function splitCsvLine(line, delimiter) {
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
      } else if (ch === delimiter && !inQuotes) {
        cells.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    return cells;
  }

  /** 引用符内改行を考慮してレコード分割 */
  function splitRecords(text, delimiter) {
    var records = [];
    var cur = "";
    var inQuotes = false;
    var s = String(text || "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (ch === '"') {
        if (inQuotes && s[i + 1] === '"') {
          cur += '""';
          i++;
        } else {
          inQuotes = !inQuotes;
          cur += ch;
        }
      } else if (ch === "\n" && !inQuotes) {
        records.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    if (cur.length || records.length) records.push(cur);

    // 末尾の完全空行のみ落とす（中間の空行は列数エラーで検出）
    while (records.length && records[records.length - 1].trim() === "") {
      records.pop();
    }
    return records;
  }

  function parseData(text) {
    var raw = String(text || "");
    if (!raw.replace(/^\uFEFF/, "").trim()) {
      return { error: "データを貼り付けてください。" };
    }

    var probe = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    var firstLineEnd = probe.indexOf("\n");
    var firstLine = firstLineEnd === -1 ? probe : probe.slice(0, firstLineEnd);
    var delimiter = detectDelimiter(firstLine);
    var records = splitRecords(raw, delimiter);
    if (!records.length) return { error: "データを貼り付けてください。" };

    var headers = splitCsvLine(records[0], delimiter).map(function (h) {
      return String(h).trim();
    });

    if (!headers.length || headers.every(function (h) { return h === ""; })) {
      return { error: "1行目に列名が必要です。" };
    }
    if (headers.some(function (h) { return h === ""; })) {
      return { error: "空の列名があります。1行目を確認してください。" };
    }
    var seen = {};
    for (var hi = 0; hi < headers.length; hi++) {
      var dupKey = headers[hi].toLowerCase();
      if (seen[dupKey]) {
        return {
          error:
            "列名が重複しています: 「" +
            headers[hi] +
            "」（" +
            (hi + 1) +
            "列目）",
        };
      }
      seen[dupKey] = true;
    }
    if (records.length < 2) {
      return { error: "データ行がありません（ヘッダーのみ）。" };
    }

    var rows = [];
    var rowErrors = [];
    for (var r = 1; r < records.length; r++) {
      if (records[r].trim() === "") {
        rowErrors.push((r + 1) + "行目：空行です");
        continue;
      }
      var cells = splitCsvLine(records[r], delimiter).map(function (c) {
        // セル周囲の空白は除去（セル内改行・中身は維持）
        return String(c).replace(/^\s+|\s+$/g, "");
      });
      // 末尾の余分な空セルはヘッダー長に合わせて切り詰め可
      while (cells.length > headers.length && cells[cells.length - 1] === "") {
        cells.pop();
      }
      if (cells.length !== headers.length) {
        rowErrors.push(
          (r + 1) +
            "行目：列数が一致しません（期待 " +
            headers.length +
            " 列 / 実際 " +
            cells.length +
            " 列）"
        );
        continue;
      }
      rows.push(cells);
    }

    if (rowErrors.length) {
      return { error: rowErrors.join("\n"), rowErrors: rowErrors };
    }
    if (!rows.length) return { error: "有効なデータ行がありません。" };

    return {
      delimiter: delimiter,
      headers: headers,
      rows: rows,
    };
  }

  /* ---------- 値変換 ---------- */

  function looksLikeNumberWithComma(v) {
    return /^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(v);
  }

  function looksLikePlainNumber(v) {
    return /^-?\d+(\.\d+)?$/.test(v);
  }

  function looksLikeBool(v) {
    return /^(true|false)$/i.test(v);
  }

  function isLiteralNullToken(v) {
    return v === "NULL" || v === "null" || v === "Null";
  }

  function formatValue(raw, type, emptyMode) {
    var v = raw == null ? "" : String(raw);

    // 空欄
    if (v === "") {
      if (emptyMode === "null") return { sql: "NULL" };
      return { sql: "''" };
    }

    // 明示的な null / NULL トークンのみ NULL（"null" という文字列は別）
    if (isLiteralNullToken(v)) {
      return { sql: "NULL" };
    }

    if (type === "string") {
      return { sql: quoteString(v) };
    }

    if (type === "boolean") {
      if (looksLikeBool(v)) return { sql: v.toLowerCase() };
      return {
        error: "真偽値として解釈できません。true / false を指定してください。",
        value: v,
      };
    }

    if (type === "number") {
      if (looksLikeNumberWithComma(v)) {
        return { sql: v.replace(/,/g, "") };
      }
      if (looksLikePlainNumber(v) && !/^0\d+$/.test(v)) {
        return { sql: v };
      }
      if (/^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(v) && !/^0\d+$/.test(v)) {
        return { sql: v.replace(/^\+/, "") };
      }
      return {
        error:
          "数値として解釈できません。「" +
          v +
          "」→ 例: 420000（カンマなし）",
        value: v,
      };
    }

    if (type === "date" || type === "datetime") {
      return { sql: quoteString(v) };
    }

    // auto
    if (looksLikeBool(v)) return { sql: v.toLowerCase() };
    if (looksLikeNumberWithComma(v)) {
      return {
        sql: v.replace(/,/g, ""),
        warning: "「" + v + "」を数値 " + v.replace(/,/g, "") + " として解釈しました。",
      };
    }
    // 先頭ゼロ付きは文字列維持
    if (/^0\d+$/.test(v)) return { sql: quoteString(v) };
    if (looksLikePlainNumber(v)) return { sql: v };
    if (/^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(v) && !/^[+-]?0\d+/.test(v)) {
      return { sql: v.replace(/^\+/, "") };
    }
    return { sql: quoteString(v) };
  }

  /* ---------- 列メタ ---------- */

  function headerKey(headers) {
    return headers.join("\u0001");
  }

  function ensureColMeta(headers) {
    var key = headerKey(headers);
    if (key === lastHeaderKey && colMeta.length === headers.length) return;
    lastHeaderKey = key;
    colMeta = headers.map(function (name, idx) {
      var lower = name.toLowerCase();
      var guessType = "auto";
      if (/id$|_id$|code|zip|postal|tel|phone/i.test(lower)) guessType = "string";
      if (/salary|amount|price|cost|qty|count|age/i.test(lower)) guessType = "number";
      if (/date|day|birthday/i.test(lower)) guessType = "date";
      if (/time|at$|timestamp/i.test(lower)) guessType = "datetime";
      if (/^(is_|has_|flag)/i.test(lower) || /bool/i.test(lower)) guessType = "boolean";

      var isMemo = /メモ|memo|備考|note|comment/i.test(name);
      return {
        name: name,
        include: !isMemo,
        type: guessType,
        where: idx === 0,
      };
    });
  }

  function renderColConfig() {
    if (!colConfigWrap || !colConfigBody) return;
    if (!colMeta.length) {
      colConfigWrap.hidden = true;
      colConfigBody.innerHTML = "";
      return;
    }
    colConfigBody.innerHTML = colMeta
      .map(function (c, i) {
        return (
          "<tr>" +
          "<td>" +
          escapeHtml(c.name) +
          "</td>" +
          '<td><input type="checkbox" data-col="' +
          i +
          '" data-field="include"' +
          (c.include ? " checked" : "") +
          "></td>" +
          '<td><select data-col="' +
          i +
          '" data-field="type">' +
          option("auto", "自動", c.type) +
          option("string", "文字列", c.type) +
          option("number", "数値", c.type) +
          option("date", "日付", c.type) +
          option("datetime", "日時", c.type) +
          option("boolean", "真偽値", c.type) +
          "</select></td>" +
          '<td><input type="radio" name="whereCol" data-col="' +
          i +
          '" data-field="where"' +
          (c.where ? " checked" : "") +
          (genMode === "update" ? "" : " disabled") +
          "></td>" +
          "</tr>"
        );
      })
      .join("");
    colConfigWrap.hidden = false;
  }

  function option(value, label, current) {
    return (
      '<option value="' +
      value +
      '"' +
      (current === value ? " selected" : "") +
      ">" +
      label +
      "</option>"
    );
  }

  function includedCols() {
    return colMeta.filter(function (c) {
      return c.include;
    });
  }

  function whereCol() {
    for (var i = 0; i < colMeta.length; i++) {
      if (colMeta[i].where) return colMeta[i];
    }
    return null;
  }

  /* ---------- SQL生成 ---------- */

  function buildRowValues(row, cols, emptyMode, valueWarnings) {
    var out = [];
    for (var i = 0; i < cols.length; i++) {
      var col = cols[i];
      var idx = colMeta.indexOf(col);
      var cell = row[idx];
      var formatted = formatValue(cell, col.type, emptyMode);
      if (formatted.error) {
        return {
          error:
            "列「" +
            col.name +
            "」の「" +
            cell +
            "」: " +
            formatted.error,
        };
      }
      if (formatted.warning) valueWarnings.push(formatted.warning);
      out.push(formatted.sql);
    }
    return { values: out };
  }

  function buildInsertSql(table, parsed, emptyMode) {
    var cols = includedCols();
    if (!cols.length) return { error: "SQLに含める列を1つ以上選んでください。" };

    var valueWarnings = [];
    var valueRows = [];
    for (var r = 0; r < parsed.rows.length; r++) {
      var built = buildRowValues(parsed.rows[r], cols, emptyMode, valueWarnings);
      if (built.error) {
        return { error: r + 2 + "行目: " + built.error };
      }
      valueRows.push(built.values);
    }

    var colList = cols.map(function (c) {
      return quoteIdent(c.name);
    });
    var style = getStyle();
    var batch = getBatchSize();
    var statements = [];

    if (style === "each") {
      valueRows.forEach(function (vals) {
        statements.push(
          "INSERT INTO " +
            table +
            " (" +
            colList.join(", ") +
            ")\nVALUES (" +
            vals.join(", ") +
            ");"
        );
      });
    } else {
      var chunkSize = batch > 0 ? batch : valueRows.length;
      for (var i = 0; i < valueRows.length; i += chunkSize) {
        var chunk = valueRows.slice(i, i + chunkSize);
        var body = chunk
          .map(function (vals) {
            return "    (" + vals.join(", ") + ")";
          })
          .join(",\n");
        statements.push(
          "INSERT INTO " +
            table +
            " (\n    " +
            colList.join(",\n    ") +
            "\n)\nVALUES\n" +
            body +
            ";"
        );
      }
    }

    return { sql: statements.join("\n\n"), warnings: uniq(valueWarnings) };
  }

  function buildUpdateSql(table, parsed, emptyMode) {
    var key = whereCol();
    if (!key) return { error: "UPDATE には WHERE 列の指定が必須です。" };

    var setCols = colMeta.filter(function (c) {
      if (!c.include) return false;
      if (c.where && !(includeKeyEl && includeKeyEl.checked)) return false;
      return true;
    });
    if (!setCols.length) {
      return { error: "SET する列がありません。含める列を選んでください。" };
    }

    var keyIdx = colMeta.indexOf(key);
    var valueWarnings = [];
    var stmts = [];
    var keySeen = {};

    for (var r = 0; r < parsed.rows.length; r++) {
      var row = parsed.rows[r];
      var keyRaw = row[keyIdx];
      var keyFmt = formatValue(keyRaw, key.type, emptyMode);
      if (keyFmt.error) {
        return { error: r + 2 + "行目: WHERE列「" + key.name + "」: " + keyFmt.error };
      }
      if (keyFmt.warning) valueWarnings.push(keyFmt.warning);

      // NULL / 空欄(→NULL) は IS NULL
      var whereClause;
      if (keyFmt.sql === "NULL") {
        whereClause = quoteIdent(key.name) + " IS NULL";
      } else {
        whereClause = quoteIdent(key.name) + " = " + keyFmt.sql;
      }

      var keyToken = String(keyRaw);
      if (keySeen[keyToken]) {
        valueWarnings.push(
          "WHERE列「" + key.name + "」の値「" + keyToken + "」が重複しています。"
        );
      }
      keySeen[keyToken] = true;

      var sets = [];
      for (var i = 0; i < setCols.length; i++) {
        var col = setCols[i];
        var idx = colMeta.indexOf(col);
        var fmt = formatValue(row[idx], col.type, emptyMode);
        if (fmt.error) {
          return { error: r + 2 + "行目: 列「" + col.name + "」: " + fmt.error };
        }
        if (fmt.warning) valueWarnings.push(fmt.warning);
        // SET name = NULL を正しく出す（文字列化しない）
        sets.push("    " + quoteIdent(col.name) + " = " + fmt.sql);
      }

      stmts.push(
        "UPDATE " + table + "\nSET\n" + sets.join(",\n") + "\nWHERE " + whereClause + ";"
      );
    }

    return { sql: stmts.join("\n\n"), warnings: uniq(valueWarnings) };
  }

  function uniq(arr) {
    var out = [];
    var seen = {};
    arr.forEach(function (x) {
      if (!seen[x]) {
        seen[x] = true;
        out.push(x);
      }
    });
    return out;
  }

  function highlight(sql) {
    return String(sql)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/'([^']|'')*'/g, function (m) {
        return '<span class="str">' + m + "</span>";
      })
      .replace(
        /\b(INSERT|INTO|VALUES|UPDATE|SET|WHERE|IS|NULL|TRUE|FALSE)\b/gi,
        function (m) {
          return '<span class="kw">' + m.toUpperCase() + "</span>";
        }
      );
  }

  /* ---------- UI ---------- */

  function setCopyEnabled(on) {
    if (copyBtn) copyBtn.disabled = !on;
  }

  function setStatus(msg, isError) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.toggle("is-error", !!isError);
    statusEl.classList.toggle("is-ok", !isError && /列/.test(msg));
  }

  function setWarnings(list) {
    if (!warningsEl) return;
    if (!list || !list.length) {
      warningsEl.hidden = true;
      warningsEl.innerHTML = "";
      return;
    }
    warningsEl.hidden = false;
    warningsEl.innerHTML =
      "<ul>" +
      list
        .map(function (w) {
          return "<li>" + escapeHtml(w) + "</li>";
        })
        .join("") +
      "</ul>";
  }

  function clearOutputKeepPlaceholder() {
    output.innerHTML = PLACEHOLDER;
    delete output.dataset.raw;
    setCopyEnabled(false);
  }

  function renderPreview(parsed) {
    if (!previewWrap || !previewTable) return;
    if (!parsed || !parsed.rows) {
      previewWrap.hidden = true;
      previewTable.innerHTML = "";
      return;
    }
    var maxRows = Math.min(parsed.rows.length, 6);
    var thead =
      "<thead><tr>" +
      parsed.headers
        .map(function (h, i) {
          var meta = colMeta[i];
          var cls = [];
          if (meta && meta.where && genMode === "update") cls.push("is-key");
          if (meta && !meta.include) cls.push("is-excluded");
          return (
            "<th" +
            (cls.length ? ' class="' + cls.join(" ") + '"' : "") +
            ">" +
            escapeHtml(h) +
            "</th>"
          );
        })
        .join("") +
      "</tr></thead>";

    var body = "";
    for (var r = 0; r < maxRows; r++) {
      body +=
        "<tr>" +
        parsed.rows[r]
          .map(function (cell, ci) {
            var show = cell === "" ? "(空)" : cell;
            var cls = [];
            if (cell === "") cls.push("is-null");
            if (colMeta[ci] && !colMeta[ci].include) cls.push("is-excluded");
            if (colMeta[ci] && colMeta[ci].where && genMode === "update") cls.push("is-key");
            return (
              "<td" +
              (cls.length ? ' class="' + cls.join(" ") + '"' : "") +
              ">" +
              escapeHtml(show) +
              "</td>"
            );
          })
          .join("") +
        "</tr>";
    }
    previewTable.innerHTML = thead + "<tbody>" + body + "</tbody>";
    previewWrap.hidden = false;
  }

  function applyTabUi() {
    tabButtons.forEach(function (btn) {
      var on = btn.getAttribute("data-gen-tab") === genMode;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (insertOptions) insertOptions.hidden = genMode !== "insert";
    if (updateOptions) updateOptions.hidden = genMode !== "update";
    renderColConfig();
  }

  function render() {
    var warnings = [];
    var tableName = tableInput ? tableInput.value.trim() : "";
    var tableErr = validateIdent(tableName, "テーブル名");
    if (tableNameError) {
      if (tableErr) {
        tableNameError.hidden = false;
        tableNameError.textContent = tableErr;
      } else {
        tableNameError.hidden = true;
        tableNameError.textContent = "";
      }
    }

    var text = dataInput.value;
    if (!String(text || "").replace(/^\uFEFF/, "").trim()) {
      clearOutputKeepPlaceholder();
      setStatus("データを貼ると、ここに解析結果が出ます。");
      setWarnings([]);
      renderPreview(null);
      if (colConfigWrap) colConfigWrap.hidden = true;
      return;
    }

    var parsed = parseData(text);
    if (parsed.error) {
      output.textContent = parsed.error;
      delete output.dataset.raw;
      setCopyEnabled(false);
      setStatus("入力エラー", true);
      setWarnings(parsed.rowErrors || [parsed.error]);
      renderPreview(null);
      return;
    }

    ensureColMeta(parsed.headers);
    renderColConfig();
    renderPreview(parsed);

    if (tableErr || !tableName) {
      clearOutputKeepPlaceholder();
      setStatus(tableErr || "テーブル名を入力してください。", true);
      setWarnings([]);
      return;
    }

    if (parsed.rows.length >= LARGE_WARN) {
      warnings.push(
        "行数が多いです（" +
          parsed.rows.length.toLocaleString() +
          " 行）。ブラウザが重くなる可能性があります。"
      );
    }

    var emptyMode = getEmptyMode();
    var result =
      genMode === "update"
        ? buildUpdateSql(quoteIdent(tableName), parsed, emptyMode)
        : buildInsertSql(quoteIdent(tableName), parsed, emptyMode);

    if (result.error) {
      output.textContent = result.error;
      delete output.dataset.raw;
      setCopyEnabled(false);
      setStatus("生成できません", true);
      setWarnings([result.error].concat(warnings));
      return;
    }

    if (result.warnings) warnings = warnings.concat(result.warnings);
    output.innerHTML = highlight(result.sql);
    output.dataset.raw = result.sql;
    setCopyEnabled(true);
    setWarnings(warnings);

    var included = includedCols().length;
    var msg =
      parsed.headers.length +
      " 列（SQL " +
      included +
      " 列）× " +
      parsed.rows.length +
      " 行 ／ " +
      (parsed.delimiter === "," ? "CSV" : "TSV/Excel");
    if (genMode === "update" && whereCol()) {
      msg += " ／ WHERE: " + whereCol().name;
    }
    if (genMode === "insert" && getStyle() === "multi" && getBatchSize() > 0) {
      msg += " ／ " + getBatchSize() + " 行単位で分割";
    }
    setStatus(msg);
  }

  function copyText(text, btn) {
    if (!text) return;
    function ok() {
      if (!btn) return;
      var prev = btn.textContent;
      btn.textContent = "コピーしました";
      btn.classList.add("is-ok");
      setTimeout(function () {
        btn.textContent = prev;
        btn.classList.remove("is-ok");
      }, 1400);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok).catch(function () {
        window.prompt("コピーしてください", text);
      });
    } else {
      window.prompt("コピーしてください", text);
    }
  }

  var renderTimer = null;
  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 140);
  }

  function switchTab(mode) {
    genMode = mode === "update" ? "update" : "insert";
    applyTabUi();
    render();
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      switchTab(btn.getAttribute("data-gen-tab"));
    });
  });

  if (colConfigBody) {
    colConfigBody.addEventListener("change", function (e) {
      var t = e.target;
      var idx = Number(t.getAttribute("data-col"));
      var field = t.getAttribute("data-field");
      if (!colMeta[idx] || !field) return;
      if (field === "include") colMeta[idx].include = t.checked;
      if (field === "type") colMeta[idx].type = t.value;
      if (field === "where") {
        colMeta.forEach(function (c, i) {
          c.where = i === idx;
        });
      }
      render();
    });
  }

  if (generateBtn) generateBtn.addEventListener("click", render);
  if (sampleBtn) {
    sampleBtn.addEventListener("click", function () {
      dataInput.value = genMode === "update" ? SAMPLE_UPDATE : SAMPLE_INSERT;
      if (tableInput) tableInput.value = "employees";
      lastHeaderKey = "";
      colMeta = [];
      render();
      dataInput.focus();
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      dataInput.value = "";
      lastHeaderKey = "";
      colMeta = [];
      clearOutputKeepPlaceholder();
      setStatus("データを貼ると、ここに解析結果が出ます。");
      setWarnings([]);
      renderPreview(null);
      if (colConfigWrap) colConfigWrap.hidden = true;
      dataInput.focus();
    });
  }
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      copyText(output.dataset.raw || "", copyBtn);
    });
  }

  dataInput.addEventListener("input", scheduleRender);
  dataInput.addEventListener("paste", function () {
    setTimeout(render, 0);
  });
  if (tableInput) tableInput.addEventListener("input", scheduleRender);
  if (emptyModeEl) emptyModeEl.addEventListener("change", render);
  if (batchSizeEl) batchSizeEl.addEventListener("change", render);
  if (includeKeyEl) includeKeyEl.addEventListener("change", render);
  styleRadios.forEach(function (radio) {
    radio.addEventListener("change", render);
  });

  applyTabUi();
  setCopyEnabled(false);
})();
