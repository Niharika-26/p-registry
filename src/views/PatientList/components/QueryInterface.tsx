import { useState } from "react";
import { executeQuery } from "@/db/database";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

interface QueryRow {
  [key: string]: string | number | boolean | null;
}

interface QueryResult {
  rows: QueryRow[];
  columns: { name: string; type: string }[];
  executionTime?: string;
  query?: string;
}

const QueryInterface = () => {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");
  const navigate = useNavigate();

  const [sqlQuery, setSqlQuery] = useState(
    patientId
      ? `SELECT * FROM patients WHERE id = '${patientId}';`
      : "SELECT * FROM patients;"
  );
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const executeCustomQuery = async () => {
    try {
      setIsQueryLoading(true);
      setError(null);

      const result = (await executeQuery(sqlQuery)) as QueryRow[];

      const columns =
        result.length > 0
          ? Object.keys(result[0]).map((key) => ({
              name: key,
              type: typeof result[0][key],
            }))
          : [];

      setQueryResult({
        rows: result,
        columns,
        executionTime: new Date().toLocaleTimeString(),
        query: sqlQuery,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "SQL execution failed");
    } finally {
      setIsQueryLoading(false);
    }
  };

  const formatCellValue = (value: string | number | boolean | null) => {
    if (value === null || value === undefined)
      return <span className="text-gray-400 italic">NULL</span>;
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "boolean") return value ? "✓" : "✗";
    return value;
  };

  const convertToCSV = (data: QueryRow[]) => {
    const headers = Object.keys(data[0] || {});
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map(
            (fieldName) =>
              `"${String(row[fieldName] ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ];
    return csvRows.join("\n");
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Patient Query Interface</h2>
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="w-40 bg-[#393D9D] hover:bg-[#2f3488] text-white"
        >
          Back to Patient List
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">SQL Query</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSqlQuery(
                    patientId
                      ? `SELECT * FROM patients WHERE id = '${patientId}';`
                      : "SELECT * FROM patients;"
                  )
                }
              >
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Collapse" : "Expand"}
              </Button>
            </div>
          </div>
          <div
            className={`${
              isExpanded ? "h-64" : "h-32"
            } transition-all duration-200`}
          >
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="Enter SQL query (e.g., SELECT * FROM patients WHERE gender = 'Male')"
              className="w-full h-full p-3 border rounded font-mono text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={executeCustomQuery}
            disabled={isQueryLoading}
            className="w-32 bg-[#393D9D] hover:bg-[#2f3488] text-white"
          >
            {isQueryLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Execute"
            )}
          </Button>
        </div>
      </div>

      {queryResult && (
        <div className="space-y-6">
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Query Results ({queryResult.rows.length} rows)
                <span className="text-sm font-normal text-gray-500 ml-2">
                  • Executed at {queryResult.executionTime}
                </span>
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const csv = convertToCSV(queryResult.rows);
                    downloadCSV(csv, "query-results.csv");
                  }}
                >
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify(queryResult.rows, null, 2)
                    );
                    toast.success("Results copied to clipboard");
                  }}
                >
                  Copy Results
                </Button>
              </div>
            </div>

            <div className="border rounded overflow-hidden">
              <div className="overflow-auto max-h-[60vh]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      {queryResult.columns?.map((column) => (
                        <th
                          key={column.name}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            {column.name}
                            <span className="ml-2 text-xs text-gray-400">
                              ({column.type})
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {queryResult.rows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={
                          rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }
                      >
                        {queryResult.columns?.map((column) => (
                          <td
                            key={`${rowIndex}-${column.name}`}
                            className="px-6 py-4 text-sm text-gray-800 font-medium"
                          >
                            {formatCellValue(row[column.name])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Common Queries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
            onClick={() =>
              setSqlQuery(
                "SELECT * FROM patients ORDER BY last_name, first_name;"
              )
            }
          >
            <h4 className="font-medium">All Patients (Alphabetical)</h4>
            <p className="text-sm text-gray-600 mt-1 font-mono">
              SELECT * FROM patients ORDER BY last_name, first_name;
            </p>
          </div>
          <div
            className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
            onClick={() =>
              setSqlQuery("SELECT * FROM patients WHERE gender = 'Male';")
            }
          >
            <h4 className="font-medium">Male Patients</h4>
            <p className="text-sm text-gray-600 mt-1 font-mono">
              SELECT * FROM patients WHERE gender = 'Male';
            </p>
          </div>
          <div
            className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
            onClick={() =>
              setSqlQuery("SELECT * FROM patients WHERE blood_group = 'O+';")
            }
          >
            <h4 className="font-medium">O+ Blood Type</h4>
            <p className="text-sm text-gray-600 mt-1 font-mono">
              SELECT * FROM patients WHERE blood_group = 'O+';
            </p>
          </div>
          <div
            className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
            onClick={() =>
              setSqlQuery(
                "SELECT id, first_name, last_name, phone FROM patients;"
              )
            }
          >
            <h4 className="font-medium">Basic Contact Info</h4>
            <p className="text-sm text-gray-600 mt-1 font-mono">
              SELECT id, first_name, last_name, phone FROM patients;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryInterface;
