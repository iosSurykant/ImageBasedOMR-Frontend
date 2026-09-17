import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { removeUser } from "helper/userManagment_helper";
import { updateUser } from "helper/userManagment_helper";
import { createUser } from "helper/userManagment_helper";
import { fetchAllUsers } from "helper/userManagment_helper";
import { toast } from "react-toastify";

const getAllUsers = createAsyncThunk("users/getAllUsers", async ({ currentPage,referenceId, statusFilter, roleFilter, debouncedSearchQuery }) => {
  try {
    const response = await fetchAllUsers(currentPage, statusFilter, roleFilter, debouncedSearchQuery, referenceId);

    if (response.state === "false") {
      return [];
    }
    return response;

  } catch (error) {
    return error.response?.data?.message || "Failed to fetch users";
  }
});

const createNewUser = createAsyncThunk("users/createNewUser", async (form) => {
  console.log("form", form)
  try {
    const response = await createUser(form)

    if (response.state === true) {
      toast.success(response.message)
      return [];
    }

    if (response.state === false) {
      toast.error(response.message)
      return [];
    }
    return response;
  } catch (error) {
    return error.response?.data?.message || "Failed to create user";
  }
})

const deleteUser = createAsyncThunk("users/deleteUser", async (id) => {
  try {
    const response = await removeUser(id)

    if (response.state === true) {
      toast.success(response.result)
      return [];
    }

    if (response.state === false) {
      toast.error(response.result)
      return [];
    }
    return response;
  } catch (error) {
    return error.response?.data?.result || "Failed to delete user";
  }
})

const updateUserbyId = createAsyncThunk("users/updateUser", async(form) => {
  console.log("form", form)

  try{
    const response = await updateUser(form)

    if(response.state === true){
      toast.success(response.message)
      return [];
    }

    if(response.state === false){
      toast.error(response.message)
      return [];
    }
  }
  catch(error){
    return error.response?.data?.message || "Failed to update user";
  }
})

const initialState = {
  allUsers: [],
  totalPages: 0,
  loading: false,
  error: null,
  refreshUsers: false,
};

const userManagementSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All Users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.allUsers = action.payload?.result;
        state.totalPages = action.payload?.count
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //New user creation 
      .addCase(createNewUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewUser.fulfilled, (state) => {
        state.loading = false;
        state.refreshUsers = !state.refreshUsers;
      })
      .addCase(createNewUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.loading = false;
        state.refreshUsers = !state.refreshUsers;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // update USER
      .addCase(updateUserbyId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserbyId.fulfilled, (state) => {
        state.loading = false;
        state.refreshUsers = !state.refreshUsers;
      })
      .addCase(updateUserbyId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

  },
});

export default userManagementSlice.reducer;

export {
  getAllUsers, createNewUser, deleteUser, updateUserbyId
};