// RolesSelector.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  Chip,
  Select,
  MenuItem,
  InputAdornment,
  Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const ALL_ROLES = ["doctor", "student"];

export default function RolesSelector({
  value = "",
  onChange = () => {},
  options = ALL_ROLES,
}) {
  const [selected, setSelected] = useState(value || "");

  useEffect(() => {
    // keep in sync if parent updates prop
    setSelected(value || "");
  }, [value]);

  const handleSelect = (ev, newVal) => {
    // newVal will be the selected option (string) or null
    const v = newVal || "";
    setSelected(v);
    onChange(v);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 720 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        Roles
      </Typography>
      {/* <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 1, display: "block" }}
      >
        Access limited to everyone of selected role(s)
      </Typography> */}

      <Autocomplete
        options={options}
        value={selected || null}
        onChange={handleSelect}
        getOptionLabel={(opt) =>
          String(opt).charAt(0).toUpperCase() + String(opt).slice(1)
        }
        isOptionEqualToValue={(option, val) =>
          String(option).toLowerCase() === String(val).toLowerCase()
        }
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Select the role for Subscription.."
            variant="outlined"
            InputProps={{
              ...params.InputProps,
            }}
          />
        )}
        sx={{
          "& .MuiOutlinedInput-root": { borderRadius: 2 },
          width: "100%",
        }}
      />
    </Box>
  );
}
