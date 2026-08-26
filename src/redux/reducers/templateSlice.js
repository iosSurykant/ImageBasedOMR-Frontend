import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { updateTemplate,  getLayoutDataById, getAllTemplate, createTemplate, deleteTemplateById} from "helper/TemplateHelper";
import { toast } from "react-toastify";

export const fetchTemplates = createAsyncThunk(
  "templates/fetchTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllTemplate();
      if (response.status === 200) {
        return response.data.body;
      }
      return rejectWithValue("Failed to fetch templates");
    } catch (error) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  },
);

export const addTemplate = createAsyncThunk(
  "templates/addTemplate",
  async ({ templateName, image, empId, description }, { rejectWithValue }) => {
    try {
      const response = await createTemplate(
        templateName,
        image,
        empId,
        description,
      );
      if (response.status === 200) {
        return response.data;
      }
      return rejectWithValue("Failed to fetch templates");
    } catch (error) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  },
);

export const deleteTemplate = createAsyncThunk(
  "template/deleteTemplate",
  async (id, { rejectWithValue }) => {
    try {
      const res = await deleteTemplateById(id);

      if (res.status === 200) {
        toast.success("Template Deleted Successfully");

        return {
          id,
          ...res.data,
        };
      }
      return rejectWithValue("Failed to delete template");
    } catch (error) {
      toast.error("Something went wrong");
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete template",
      );
    }
  },
);

export const getLayoutData = createAsyncThunk(
  "template/getLayoutData",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getLayoutDataById(id);
      if (res.status === 200) {
        return res.data;
      }
      return rejectWithValue("Failed to fetch layout data");
    } catch (error) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  },
);

export const updateTemplateData = createAsyncThunk(
  "template/updateTemplate",
  async ({ FileName, tempName }, { rejectWithValue }) => {
    try {
      if (!FileName || !tempName) {
        return rejectWithValue("FileName and tempName are required");
      }

      const res = await updateTemplate(FileName, tempName);

      if (res.state === true) {
        toast.success("Template Updated Successfully");
        return res;
      }

      return rejectWithValue("Failed to update template");
    } catch (error) {
      // toast.error("Something went wrong");

      return rejectWithValue("Failed to update template" );
    }
  }
);


const templateSlice = createSlice({
  name: "templates",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Fetch Templates Lifecycle
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Template Lifecycle
      .addCase(addTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTemplate.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // TEMPLATE DELETE LIFECYCLE
      .addCase(deleteTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(
          (template) => template.id !== action.payload.id,
        );
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET TEMPLATE DATA
      .addCase(getLayoutData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLayoutData.fulfilled, (state, action) => {
        state.loading = false;
        state.layoutData = action.payload;
      })
      .addCase(getLayoutData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE and Save TEMPLATE LIFECYCLE
      .addCase(updateTemplateData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTemplateData.fulfilled, (state, action) => {
        state.loading = false;

        // If API returns updated template, update it here
        // Example:
        // const updatedTemplate = action.payload.body;
        // const index = state.list.findIndex(
        //   (item) => item.id === updatedTemplate.id
        // );
        // if (index !== -1) {
        //   state.list[index] = updatedTemplate;
        // }
      })
      .addCase(updateTemplateData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export default templateSlice.reducer;
