import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import { TextField, Box, Button, Paper, Chip, Typography } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";

const MergeCsvComponent = () => {
  const [csv1, setCsv1] = useState(null);
  const [csv2, setCsv2] = useState(null);
  const [headers1, setHeaders1] = useState([]);
  const [headers2, setHeaders2] = useState([]);
  const [key1, setKey1] = useState(null);
  const [key2, setKey2] = useState(null);
  const [ignoreColumns, setIgnoreColumns] = useState([]);
  const [filterKey, setFilterKey] = useState("");
  const [resultBlob, setResultBlob] = useState(null);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // parse CSV headers
  const parseCsvHeaders = (file, setHeaders) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const [headerLine] = text.split("\n");
      const headers = headerLine.split(",").map((h) => h.trim());
      setHeaders(headers);
    };
    reader.readAsText(file);
  };

  const handleCsv1Upload = (file) => {
    setCsv1(file);
    parseCsvHeaders(file, setHeaders1);
    setKey1(null);
  };

  const handleCsv2Upload = (file) => {
    setCsv2(file);
    parseCsvHeaders(file, setHeaders2);
    setKey2(null);
  };

  const handleProcess = async () => {
    if (!csv1 || !csv2) return toast.error("Please upload both CSVs");
    if (!key1 || !key2) return toast.error("Please select keys for both CSVs");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("CSV1", csv1);
      formData.append("CSV2", csv2);
      formData.append("CommonKey", key1);
      formData.append("ignoreColumns", ignoreColumns.join(","));
      formData.append("Filer_key", filterKey);

      const response = await axios.post("/api/merge-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("CSV merged successfully");

      const blob = new Blob([response.data], { type: "text/csv" });
      setResultBlob(blob);

      const text = await blob.text();
      const rows = text.split("\n").map((row) => row.split(","));
      const headers = rows[0];
      const data = rows.slice(1).map((row) => {
        const obj = {};
        headers.forEach((h, i) => (obj[h.trim()] = row[i]));
        return obj;
      });

      setTableHeaders(headers);
      setTableData(data);

      navigate("/admin/result-table", {
        state: { tableHeaders: headers, tableData: data, resultBlob: blob },
      });
    } catch (err) {
      console.error(err);
      toast.error("Error merging CSVs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f5f5f5",
        p: 2,
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 900,
          p: 5,
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
        elevation={6}
      >
        <Typography variant="h4" align="center" sx={{ fontWeight: 700 }}>
          Merge CSV Files
        </Typography>

        {/* CSV Uploads */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            component="label"
            sx={{ flex: 1, height: 56, borderRadius: 2 }}
          >
            {csv1 ? csv1.name : "Upload CSV 1"}
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={(e) => handleCsv1Upload(e.target.files[0])}
            />
          </Button>

          <Button
            variant="outlined"
            component="label"
            sx={{ flex: 1, height: 56, borderRadius: 2 }}
          >
            {csv2 ? csv2.name : "Upload CSV 2"}
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={(e) => handleCsv2Upload(e.target.files[0])}
            />
          </Button>
        </Box>

        {/* Key Selection */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Autocomplete
            sx={{ flex: 1 }}
            options={headers1}
            value={key1}
            onChange={(event, newValue) => setKey1(newValue)}
            renderInput={(params) => <TextField {...params} label="Key for CSV 1" />}
          />
          <Autocomplete
            sx={{ flex: 1 }}
            options={headers2}
            value={key2}
            onChange={(event, newValue) => setKey2(newValue)}
            renderInput={(params) => <TextField {...params} label="Key for CSV 2" />}
          />
        </Box>

        {/* Ignore Columns + Filter Key */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Autocomplete
            multiple
            sx={{ flex: 1 }}
            options={[...headers1, ...headers2]}
            value={ignoreColumns}
            onChange={(event, newValue) => setIgnoreColumns(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} key={option} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Ignore Columns" placeholder="Select columns" />
            )}
          />
          <TextField
            sx={{ flex: 1 }}
            label="Filter Key"
            variant="outlined"
            value={filterKey}
            onChange={(e) => setFilterKey(e.target.value)}
          />
        </Box>

        {/* Process Button */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ borderRadius: 3, textTransform: "none", fontWeight: 600 }}
          onClick={handleProcess}
          disabled={loading}
        >
          {loading ? "Processing..." : "Process Merge"}
        </Button>
      </Paper>
    </Box>
  );
};

export default MergeCsvComponent;