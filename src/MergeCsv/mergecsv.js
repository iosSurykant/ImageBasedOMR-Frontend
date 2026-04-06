import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import {
  TextField,
  Box,
  Button,
  Paper,
  Chip,
  Typography,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import { fetchCsvHeader, mergerCsv } from "helper/ResultGenerationHelper";

const MergeCsvComponent = () => {
  const [csv1, setCsv1] = useState(null);
  const [csv2, setCsv2] = useState(null);

  const [headers1, setHeaders1] = useState([]);
  const [headers2, setHeaders2] = useState([]);

  const [key1, setKey1] = useState(null);
  const [key2, setKey2] = useState(null);

  const [ignoreColumns, setIgnoreColumns] = useState([]);
  const [filterKey, setFilterKey] = useState("");

  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const navigate = useNavigate();

  // ✅ Fetch Headers CSV1
  const handleCsvOneHeaders = async (file) => {
    try {
      setLoading1(true);
      const res = await fetchCsvHeader(file);
      setHeaders1(res || []);
      setKey1(null);
    } catch {
      toast.error("Failed to load CSV1 headers");
    } finally {
      setLoading1(false);
    }
  };

  // ✅ Fetch Headers CSV2
  const handleCsvTwoHeaders = async (file) => {
    try {
      setLoading2(true);
      const res = await fetchCsvHeader(file);
      setHeaders2(res || []);
      setKey2(null);
    } catch {
      toast.error("Failed to load CSV2 headers");
    } finally {
      setLoading2(false);
    }
  };

  // ✅ Check if keys match
const isKeyValid = key1 && key2 && key1 === key2;

  // ✅ Process Merge
  const handleProcess = async () => {
    if (!csv1 || !csv2) return toast.error("Upload both CSV files");

    if (!key1 || !key2) return toast.error("Select both keys");

    try {
      setLoading(true);

  if (!isKeyValid)
     return toast.error("Keys must match!");

      const formData = new FormData();
      formData.append("CSV1", csv1);
      formData.append("CSV2", csv2);
      formData.append("CommonKey", key1);
      formData.append("ignoreColumns", ignoreColumns.join(",") || null);
      formData.append("Filer_key", filterKey || null);

      const response = await mergerCsv(formData);

      console.log("RAW RESPONSE:", response);

      // Convert Blob → Text
      const text = await response.text();

      // Convert Text → JSON
      const finalData = JSON.parse(text);

      console.log("FINAL DATA:", finalData);

      // Validate
      if (!Array.isArray(finalData)) {
        toast.error("Invalid data format");
        return;
      }

      // ✅ Extract headers
      const headers = Object.keys(finalData[0] || {});
      const tableData = finalData;

      console.log(headers);
      console.log(tableData);

      navigate("/admin/result-table", {
        state: {
          tableHeaders: headers,
          tableData: tableData,
          resultBlob: response
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Error merging CSVs");
    } finally {
      setLoading(false);
    }
  };

  const allHeaders = [...new Set([...headers1, ...headers2])];

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
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 900,
          p: 5,
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Typography variant="h4" align="center" fontWeight={700}>
          Merge CSV Files 
        </Typography>

        {/* Upload Section */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            component="label"
            variant="outlined"
            fullWidth
            color={csv1 ? "success" : "primary"}
          >
            {csv1 ? csv1.name : "Upload CSV 1"}
            <input
              hidden
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files[0];
                setCsv1(file);
                handleCsvOneHeaders(file);
              }}
            />
          </Button>

          <Button
            component="label"
            variant="outlined"
            fullWidth
            color={csv2 ? "success" : "primary"}
          >
            {csv2 ? csv2.name : "Upload CSV 2"}
            <input
              hidden
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files[0];
                setCsv2(file);
                handleCsvTwoHeaders(file);
              }}
            />
          </Button>
        </Box>

        {/* Header Loading */}
        {(loading1 || loading2) && (
          <Box textAlign="center">
            <CircularProgress size={24} />
            <Typography variant="body2">Extracting headers...</Typography>
          </Box>
        )}

        {/* Key Selection */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Autocomplete
            fullWidth
            options={headers1}
            value={key1}
            disabled={!headers1.length}
            onChange={(e, v) => setKey1(v)}
            renderInput={(params) => (
              <TextField {...params} label="Key CSV 1" />
            )}
          />

          <Autocomplete
            fullWidth
            options={headers2}
            value={key2}
            disabled={!headers2.length}
            onChange={(e, v) => setKey2(v)}
            renderInput={(params) => (
              <TextField {...params} label="Key CSV 2" />
            )}
          />
        </Box>

        {/* Ignore + Filter */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Autocomplete
            multiple
            fullWidth
            options={allHeaders}
            value={ignoreColumns}
            onChange={(e, v) => setIgnoreColumns(v)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} key={option} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Ignore Columns" />
            )}
          />

          <TextField
            fullWidth
            label="Filter Key"
            value={filterKey}
            onChange={(e) => setFilterKey(e.target.value)}
          />
        </Box>

        {/* Process Button */}
        <Button
          variant="contained"
          size="large"
          onClick={handleProcess}
          disabled={loading}
        >
          {loading ? "Processing..." : "Merge CSV"}
        </Button>
      </Paper>
    </Box>
  );
};

export default MergeCsvComponent;
