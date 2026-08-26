import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Edit, Delete, CheckCircle } from "@mui/icons-material";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { createPayment } from "helper/Pricing_helper";
import { openCashfreeCheckout } from "services/cashfreeService";
import { deletePackage } from "helper/Pricing_helper";

export const PricingCard = ({
  // role,
  // handleDelete,
  // handleSubscription,
  getSubscription,
  plan,
  isFeatured = false,
}) => {
  const userData = localStorage.getItem("userData");

  const role = JSON.parse(userData).role;
  const phone = JSON.parse(userData).phone;
  const email = JSON.parse(userData).email;
  const userName = JSON.parse(userData).userName;

  const handleSubscription = async (plan) => {
    const data = {
      order_Amount: plan.amount,
      packageId: plan.packId,
      customer_Details: {
        customer_Phone: phone,
        customer_Email: email,
        customer_Name: userName,
      },
    };

    try {
      const response = await createPayment({ data });

      console.log(response);

      const orderDetails = JSON.parse(response.result2);

      console.log(
        "(orderDetails.order_meta.return_url",
        orderDetails.order_meta.return_url,
      );

      const paymentSessionId = response.data.payment_session_id;
      const order_id = response.data.order_id;

      await openCashfreeCheckout(paymentSessionId, order_id);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
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
          toast.success("Deleted Sucessfull");

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
  return (
    <Card
      sx={{
        position: "relative",
        height: "100%",
        width: "90%",
        borderRadius: 3,
        overflow: "hidden",

        bgcolor: isFeatured ? "#0f172a" : "#fff",
        color: isFeatured ? "#fff" : "inherit",

        border: "1px solid",
        borderColor: isFeatured ? "#1e293b" : "divider",

        boxShadow: isFeatured
          ? "0 20px 40px rgba(0,0,0,.25)"
          : "0 4px 12px rgba(0,0,0,.08)",

        transform: isFeatured ? "translateY(-20px)" : "translateY(0)",

        transition: "all .3s ease",

        "&:hover": {
          transform: isFeatured ? "translateY(-28px)" : "translateY(-4px)",
        },
      }}
    >
      {/* Featured Badge */}
      {isFeatured && (
        <Chip
          label="Most Popular"
          color="primary"
          size="small"
          sx={{
            position: "absolute",
            top: 7,
            left: 16,
            fontWeight: 600,
          }}
        />
      )}

      {/* Actions */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
        }}
      >
        {/* <IconButton size="small">
          <Edit
            sx={{
              color: isFeatured ? "#fff" : "text.secondary",
            }}
          />
        </IconButton> */}

        {role === "admin" && (
          <IconButton
            size="small"
            onClick={() => handleDelete(plan.packId)}
            sx={{
              //   color: "error.main",
              color: isFeatured ? "#fff" : "error.main",
              "&:hover": {
                bgcolor: "error.lighter",
              },
            }}
          >
            <Delete />
          </IconButton>
        )}
      </Stack>

      {/* Header */}
      <Box
        p={4}
        sx={{
          mt: 2,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          gutterBottom
          sx={{
            color: isFeatured ? "#f5f5f5" : "text.secondary",
          }}
        >
          {plan.packageName}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: isFeatured ? "rgba(255,255,255,.75)" : "text.secondary",
          }}
        >
          {plan.subHeading}
        </Typography>
      </Box>

      {/* Price */}
      <Box
        px={4}
        py={3}
        borderTop="1px solid"
        borderBottom="1px solid"
        borderColor={isFeatured ? "rgba(255,255,255,.12)" : "divider"}
      >
        <Stack direction="row" alignItems="flex-end" spacing={1}>
          <Typography
            variant="h5"
            sx={{
              color: isFeatured ? "#f5f5f5" : "text.secondary",
            }}
          >
            ₹
          </Typography>

          <Typography
            sx={{
              fontSize: 34,
              lineHeight: 1,
              fontWeight: 900,
            }}
          >
            {plan.amount}
          </Typography>

          <Typography
            sx={{
              color: isFeatured ? "rgba(255,255,255,.7)" : "text.secondary",
            }}
          >
            /mo
          </Typography>
        </Stack>

        <Box mt={3}>
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Typography
              variant="body2"
              sx={{
                color: isFeatured ? "rgba(255,255,255,.8)" : "text.secondary",
              }}
            >
              Credits
            </Typography>

            <Typography variant="body2" fontWeight={600}>
              {plan.creditLimit} Limit
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={50}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: isFeatured ? "rgba(255,255,255,.15)" : undefined,
            }}
          />
        </Box>
      </Box>

      {/* Features */}
      <Box p={4} sx={{ flexGrow: 1 }}>
        <Stack spacing={2}>
          {plan?.buttlePints?.map((feature, index) => (
            <Stack
              key={index}
              direction="row"
              spacing={1.5}
              alignItems="flex-start"
            >
              <CheckCircle
                sx={{
                  color: isFeatured ? "#60a5fa" : "#1976d2",
                }}
              />

              <Typography>{feature}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Button */}
      <Box sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={() => handleSubscription(plan)}
          variant={isFeatured ? "contained" : "outlined"}
          fullWidth
          sx={{
            borderRadius: 2,
            py: 1.2,
            fontWeight: 600,
            textTransform: "none",
            bgcolor: isFeatured ? "#2563eb" : undefined,
            "&:hover": {
              bgcolor: isFeatured ? "#1d4ed8" : undefined,
            },
          }}
        >
          Purchase
        </Button>
      </Box>
    </Card>
  );
};
