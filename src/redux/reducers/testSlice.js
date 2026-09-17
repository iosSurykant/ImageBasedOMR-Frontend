import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { createTest, getTestList } from "helper/TemplateHelper";
import { toast } from "react-toastify";

export const createTestAsync = createAsyncThunk(
  "tests/createTest",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await createTest(formData);
      if (response.status === 200 || response.status === 201) {
        toast.success("Test Created Successfully");
        return response.data;
      }
      return rejectWithValue("Failed to create test");
    } catch (error) {
      toast.error("Error creating test");
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Something went wrong"
      );
    }
  }
);

export const fetchTestList = createAsyncThunk(
  "tests/fetchTestList",
  async (arg, { rejectWithValue }) => {
    const { search = "", page = 1, range = 5 } = arg || {};
    try {
      const response = await getTestList(search, page, range);

      if (response.status === 200) {
        return response.data;
      }
      return rejectWithValue("Failed to fetch test list");
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Something went wrong"
      );
    }
  }
);

const testSlice = createSlice({
  name: "tests",
  refreshTest: false,
  initialState: {
    list: [],
    loading: false,
    error: null,
    creating: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Test Lifecycle
      .addCase(createTestAsync.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createTestAsync.fulfilled, (state) => {
        state.creating = false;
        state.refreshTest = !state.refreshTest;
      })
      .addCase(createTestAsync.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

      // Fetch Test List Lifecycle
      .addCase(fetchTestList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestList.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchTestList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default testSlice.reducer;