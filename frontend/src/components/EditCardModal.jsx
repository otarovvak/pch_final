import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  interrogationLocations,
  investigationTypes,
  positions,
  regions,
  departments,
} from "../utils/data";

const EditCardModal = ({ open, onClose, cardId, cardData }) => {
  const [editedCardData, setEditedCardData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (cardData) {
      console.log("Setting initial card data:", cardData);
      setEditedCardData({ ...cardData });
    }
  }, [cardData]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditedCardData((prevData) => {
      console.log(
        `Updating field ${name} to`,
        type === "checkbox" ? checked : value
      );
      return {
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };
  const token = localStorage.getItem("token");
  console.log("Token:", token); 

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSave = async (newStatus) => {
    console.log("Preparing to save the card with data:", editedCardData);
    try {
      const dataToSave = { ...editedCardData, status: newStatus };
      const response = await axios.put(
        `http://localhost:3350/api/cards/${cardId}`,
        dataToSave,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Card updated successfully:", response.data);
      onClose();
      navigate("/cases");

      setEditedCardData(response.data);
    } catch (error) {
      console.error("Error updating card:", error);
      alert("There was an error updating the card. Please try again.");
    }
  };

  if (!editedCardData) return null;

  const formFields = [
    { label: "Номер УД", name: "case_number", type: "text" },
    { label: "ИИН вызываемого", name: "ИИН_вызываемого", type: "text" },
    {
      label: "Должность вызываемого",
      name: "должность_вызываемого",
      type: "select",
      options: positions,
      valueProperty: "title",
    },
    { label: "БИН/ИИН", name: "БИН_ИИН", type: "text" },
    {
      label: "Регион",
      name: "регион",
      type: "select",
      options: regions,
      valueProperty: "name",
    },
    {
      label: "Планируемые следственные действия",
      name: "планируемые_следственные_действия",
      type: "text",
    },
    {
      label: "Дата и время проведения",
      name: "дата_и_время_проведения",
      type: "datetime-local",
    },
    { label: "Время ухода", name: "время_ухода", type: "datetime-local" },
    {
      label: "Место проведения",
      name: "место_проведения",
      type: "select",
      options: interrogationLocations,
      valueProperty: "location",
    },
    { label: "Статус по делу", name: "статус_по_делу", type: "text" },
    { label: "Отношение к событию", name: "отношение_к_событию", type: "text" },
    {
      label: "Виды следствия",
      name: "виды_следствия",
      type: "select",
      options: investigationTypes,
      valueProperty: "type",
    },
    {
      label: "Относится ли к бизнесу",
      name: "business_related",
      type: "checkbox",
    },
    { label: "ИИН защитника", name: "ИИН_защитника", type: "text" },
    { label: "Обоснование", name: "обоснование", type: "text" },
    { label: "Результат", name: "результат", type: "text" },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          maxWidth: "95vw",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" component="h2">
          Редактировать карточку
        </Typography>

        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
          }}
        >
          {formFields.map((field) => (
            <Box key={field.name} mb={2}>
              {field.type === "checkbox" ? (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editedCardData[field.name] || false}
                      onChange={handleInputChange}
                      name={field.name}
                    />
                  }
                  label={field.label}
                />
              ) : field.type === "select" ? (
                <FormControl fullWidth>
                  <InputLabel id={`${field.name}-label`}>
                    {field.label}
                  </InputLabel>
                  <Select
                    labelId={`${field.name}-label`}
                    label={field.label}
                    name={field.name}
                    value={editedCardData[field.name] || ""}
                    onChange={handleInputChange}
                  >
                    {field.options.map((option) => (
                      <MenuItem
                        key={option._id || option[field.valueProperty]}
                        value={option[field.valueProperty]}
                      >
                        {option[field.valueProperty]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  label={field.label}
                  name={field.name}
                  value={
                    field.type === "datetime-local"
                      ? formatDate(editedCardData[field.name])
                      : editedCardData[field.name] || ""
                  }
                  onChange={handleInputChange}
                  fullWidth
                  type={field.type}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            </Box>
          ))}
        </Box>

        <Box mt={2} display="flex" justifyContent="space-between">
          {" "}
          {/* Space buttons evenly */}
          <Button
            variant="outlined"
            onClick={() => handleSave("В работе")}
            disabled={!token}
          >
            Сохранить (В работе)
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleSave("На согласовании")}
            disabled={!token}
          >
            Сохранить и отправить на согласование
          </Button>
          <Button variant="outlined" onClick={onClose} sx={{ ml: 2 }}>
            Отмена
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditCardModal;
