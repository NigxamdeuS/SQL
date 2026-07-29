/**
 * 作成タブ用 — タグ定義
 * id は sql-builder / テンプレートの intent と一致させます。
 */

const INTENT_TAG_GROUPS = [
  {
    id: "action",
    label: "やりたいこと",
    tags: [
      { id: "fetch", label: "取得する", hints: ["取得", "出して", "一覧"] },
      { id: "insert", label: "追加する", hints: ["追加", "登録", "挿入"] },
      { id: "update", label: "更新する", hints: ["更新", "変更"] },
      { id: "delete", label: "削除する", hints: ["削除", "消す"] },
    ],
  },
  {
    id: "basic_select",
    label: "基本取得",
    tags: [
      { id: "all_columns", label: "全列取得", hints: ["全列", "全部", "*"] },
      { id: "select_columns", label: "列を選択", hints: ["列を選", "特定列"] },
      { id: "alias", label: "別名", hints: ["別名", "AS", "エイリアス"] },
      { id: "calc_column", label: "計算列", hints: ["計算", "掛け", "割"] },
      { id: "const_column", label: "定数列", hints: ["定数", "固定値"] },
    ],
  },
  {
    id: "condition",
    label: "条件",
    tags: [
      { id: "filter", label: "条件で絞る", hints: ["条件", "WHERE", "絞"] },
      { id: "compare", label: "比較", hints: ["比較", "以上", "以下", "<>", ">="] },
      { id: "not_op", label: "NOT", hints: ["NOT", "ではない", "除く"] },
      { id: "exists", label: "EXISTS", hints: ["EXISTS", "存在"] },
      { id: "not_exists", label: "NOT EXISTS", hints: ["NOT EXISTS", "存在しない"] },
      { id: "any_op", label: "ANY", hints: ["ANY", "いずれか"] },
      { id: "all_op", label: "ALL", hints: ["ALL", "すべて"] },
      { id: "compound_where", label: "複合条件", hints: ["AND", "OR", "複合"] },
      { id: "is_null", label: "NULLを扱う", hints: ["NULL", "未設定"] },
      { id: "like", label: "部分一致", hints: ["LIKE", "部分一致"] },
      { id: "case_insensitive", label: "大文字小文字無視", hints: ["ILIKE"] },
    ],
  },
  {
    id: "aggregate",
    label: "集計",
    tags: [
      { id: "sum", label: "合計", hints: ["合計", "SUM"] },
      { id: "avg", label: "平均", hints: ["平均", "AVG"] },
      { id: "count", label: "件数", hints: ["件数", "COUNT"] },
      { id: "max", label: "最大", hints: ["最大", "MAX"] },
      { id: "min", label: "最小", hints: ["最小", "MIN"] },
      { id: "count_distinct", label: "重複を除いて数える", hints: ["COUNT DISTINCT", "ユニーク件数"] },
      { id: "per_group", label: "〜ごと", hints: ["ごと", "GROUP BY"] },
      { id: "group_multi", label: "複数列でグループ化", hints: ["複数グループ", "2列"] },
      { id: "filter_agg", label: "条件付き集計", hints: ["FILTER", "条件付き集計"] },
      { id: "ratio_agg", label: "集計結果の割合", hints: ["割合", "構成比", "パーセント"] },
      { id: "after_group", label: "集計後に絞る", hints: ["HAVING", "集計後"] },
    ],
  },
  {
    id: "shape",
    label: "まとめ方",
    tags: [
      { id: "sort", label: "並べる", hints: ["ORDER BY", "並べ"] },
      { id: "limit", label: "件数を制限", hints: ["LIMIT", "上位"] },
      { id: "unique", label: "重複を除く", hints: ["DISTINCT", "重複"] },
    ],
  },
  {
    id: "join",
    label: "JOIN",
    tags: [
      { id: "join", label: "内部結合", hints: ["INNER JOIN", "内部結合"] },
      { id: "left_join", label: "左外部結合", hints: ["LEFT JOIN", "左外部"] },
      { id: "right_join", label: "右外部結合", hints: ["RIGHT JOIN", "右外部"] },
      { id: "full_join", label: "完全外部結合", hints: ["FULL JOIN", "完全外部"] },
      { id: "self_join", label: "自己結合", hints: ["自己結合", "同じテーブル"] },
      { id: "cross_join", label: "交差結合", hints: ["CROSS JOIN", "直積"] },
      { id: "multi_join", label: "複数テーブル結合", hints: ["3テーブル", "複数JOIN"] },
      { id: "no_match", label: "紐づかない行", hints: ["紐づかない", "未登録"] },
    ],
  },
  {
    id: "subquery",
    label: "サブクエリ",
    tags: [
      { id: "scalar_subquery", label: "単一行サブクエリ", hints: ["スカラ", "単一行"] },
      { id: "multirow_subquery", label: "複数行サブクエリ", hints: ["INサブクエリ", "複数行"] },
      { id: "correlated_subquery", label: "相関サブクエリ", hints: ["相関"] },
      { id: "from_subquery", label: "FROM内サブクエリ", hints: ["派生テーブル", "FROM句"] },
      { id: "select_subquery", label: "SELECT内サブクエリ", hints: ["SELECT句サブ"] },
    ],
  },
  {
    id: "cte_group",
    label: "CTE",
    tags: [
      { id: "cte", label: "WITH", hints: ["WITH", "CTE"] },
      { id: "multi_cte", label: "複数CTE", hints: ["複数WITH", "複数CTE"] },
      { id: "recursive_cte", label: "再帰CTE", hints: ["RECURSIVE", "再帰"] },
      { id: "update_cte", label: "更新CTE", hints: ["更新CTE", "CTEで更新"] },
    ],
  },
  {
    id: "window_group",
    label: "ウィンドウ関数",
    tags: [
      { id: "window", label: "ウィンドウ（全般）", hints: ["ウィンドウ", "OVER"] },
      { id: "win_row_number", label: "行番号", hints: ["ROW_NUMBER", "行番号"] },
      { id: "win_rank", label: "順位", hints: ["RANK", "順位"] },
      { id: "win_dense_rank", label: "同順位", hints: ["DENSE_RANK", "同順位"] },
      { id: "win_lag", label: "前の行", hints: ["LAG", "前の行"] },
      { id: "win_lead", label: "次の行", hints: ["LEAD", "次の行"] },
      { id: "win_running_total", label: "累計", hints: ["累計", "ランニング"] },
      { id: "win_moving_avg", label: "移動平均", hints: ["移動平均"] },
      { id: "win_group_compare", label: "グループ内比較", hints: ["グループ内", "パーティション比較"] },
    ],
  },
  {
    id: "pg",
    label: "PostgreSQL",
    tags: [
      { id: "returning", label: "RETURNING", hints: ["RETURNING"] },
      { id: "upsert", label: "ON CONFLICT", hints: ["ON CONFLICT", "UPSERT"] },
      { id: "distinct_on", label: "DISTINCT ON", hints: ["DISTINCT ON", "代表1件"] },
      { id: "filter_clause", label: "FILTER", hints: ["FILTER"] },
      { id: "lateral", label: "LATERAL", hints: ["LATERAL"] },
      { id: "generate_series", label: "generate_series", hints: ["generate_series", "連番"] },
      { id: "json", label: "JSONB", hints: ["JSONB", "JSON"] },
      { id: "array", label: "配列", hints: ["配列", "ARRAY"] },
      { id: "cast", label: "型変換", hints: ["型変換", "CAST", "::"] },
      { id: "regex", label: "正規表現", hints: ["正規表現", "~"] },
    ],
  },
  {
    id: "ddl_dml",
    label: "データ操作・設計",
    tags: [
      { id: "multi_insert", label: "複数行追加", hints: ["複数行INSERT", "まとめて追加"] },
      { id: "insert_select", label: "別テーブルから追加", hints: ["INSERT SELECT", "コピー追加"] },
      { id: "update_join", label: "結合して更新", hints: ["UPDATE JOIN", "結合更新"] },
      { id: "delete_join", label: "結合して削除", hints: ["DELETE USING", "結合削除"] },
      { id: "create_table", label: "テーブル作成", hints: ["CREATE TABLE"] },
      { id: "constraints", label: "制約", hints: ["PRIMARY KEY", "CHECK", "制約"] },
      { id: "view", label: "ビュー", hints: ["VIEW", "ビュー"] },
      { id: "index", label: "インデックス", hints: ["INDEX", "インデックス"] },
    ],
  },
  {
    id: "tx_perf",
    label: "トランザクション・性能",
    tags: [
      { id: "begin", label: "BEGIN", hints: ["BEGIN", "開始"] },
      { id: "commit", label: "COMMIT", hints: ["COMMIT", "確定"] },
      { id: "rollback", label: "ROLLBACK", hints: ["ROLLBACK", "取消"] },
      { id: "savepoint", label: "SAVEPOINT", hints: ["SAVEPOINT"] },
      { id: "explain", label: "EXPLAIN", hints: ["EXPLAIN", "実行計画"] },
      { id: "explain_analyze", label: "EXPLAIN ANALYZE", hints: ["EXPLAIN ANALYZE"] },
    ],
  },
];

const INTENT_EXAMPLES = [
  "部署ごとの売上合計を取得したい",
  "条件に合う行だけ削除したい",
  "追加した行のIDを返したい",
  "紐づかない社員を調べたい",
  "グループ内の順位を付けたい",
];
