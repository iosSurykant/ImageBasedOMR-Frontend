import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getPackages } from "helper/Pricing_helper";
import { deletePackage } from "helper/Pricing_helper";
import { toast } from "react-toastify";
import { PricingCard } from "./PricingCard";
import Swal from "sweetalert2";
// import NormalHeader from "components/Headers/NormalHeader";

export default function PricingPlans() {
  const [plans, setPlans] = useState([]);

  const navigate = useNavigate();

  const userData = localStorage.getItem("userData");
  const role = JSON.parse(userData).role;

  const getSubscription = async () => {
    try {
      const response = await getPackages();
      const data = await response.data;
      setPlans(data);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

    const handleDelete = async (packId) => {
      Swal.fire({
        title: "Delete Template?",
        text: "Are you sure you want to delete this template?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result?.isConfirmed) {
          const res = await deletePackage(packId);
          getSubscription();
  
          if (res?.state === true) {
            toast.success("Deleted Sucessfull")
  
            Swal.fire({
              icon: "success",
              title: "Deleted",
              text: "Subscription deleted successfully",
              timer: 1500,
              showConfirmButton: false,
            });
            
          } else {
            Swal.fire({
              icon: "error",
              title: "Failed",
              text: "Could not delete Subscription",
            });
          }
        }
      });
    };

  useEffect(() => {
    getSubscription();
  }, []);

  return (
    <>
      {/* <NormalHeader /> */}
      <Container maxWidth="lg" sx={{ bg: "white", py: 5 }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={3}
          mb={5}
        >
          {/* Left Side */}
          <Box flex={1}>
            <Typography variant="h3" fontWeight={600} gutterBottom>
              Pricing Plans
            </Typography>

            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                bgcolor: "rgba(25,118,210,0.05)",
                border: "1px solid rgba(25,118,210,0.12)",
                borderRadius: "30px",
                px: 2,
                py: 1,
                mt: 1,
              }}
            >
              <Chip
                label="Info"
                size="small"
                color="primary"
                sx={{
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              />

              <Typography variant="body2" color="primary">
                Manage and configure subscription tiers for your customers
                across different market segments.
              </Typography>
            </Box>
          </Box>

          {/* Right Side */}
          {role === "admin" && (
            <Button
              variant="contained"
              onClick={() => navigate("/admin/Subscription/create")}
              sx={{
                minWidth: 140,
                height: 48,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "none",
              }}
            >
              Create Package
            </Button>
          )}
        </Stack>

        {/* Cards */}
        <Grid container spacing={2} justifyContent="center">
          {plans?.map((plan, index) => (
            <Grid
              key={plan.packId}
              size={{ xs: 12, sm: 6, lg: 4 }}
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <PricingCard
                handleDelete={handleDelete}
                plan={plan}
                role={role}
                isFeatured={index === 1}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
