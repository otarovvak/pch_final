import React, { useState, useEffect } from "react"; 
import axios from "axios";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Collapse,
  IconButton, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close'; 
import {
  regions,
  positions,
  investigationTypes,
  interrogationLocations,
} from "../utils/data"; // Import data from data.js
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import NotificationBlock from "../components/NotificationBlock";

const CreateCardPage = () => {
  const [callHistory, setCallHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [callHistoryOpen, setCallHistoryOpen] = useState(false);
  const [approvalPathOpen, setApprovalPathOpen] = useState(false); 
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [cardData, setCardData] = useState({
    case_number: "",
    ИИН_вызываемого: "",
    должность_вызываемого: "",
    БИН_ИИН: "",
    регион: "",
    планируемые_следственные_действия: "",
    дата_и_время_проведения: "",
    время_ухода: "",
    место_проведения: "",
    статус_по_делу: "",
    отношение_к_событию: "",
    виды_следствия: "",
    относится_ли_к_бизнесу: "",
    ИИН_защитника: "",
    обоснование: "",
    результат: "",
    status: "В работе", 
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  useEffect(() => {
    const fetchCallHistory = async () => {
      if (cardData.ИИН_вызываемого) {
        try {
          setLoadingHistory(true);
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Token not found in localStorage");
          }
          const response = await axios.get(
            `http://localhost:3350/api/cards/check-history/${cardData.ИИН_вызываемого}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (Array.isArray(response.data.callHistory)) {
            setCallHistory(response.data.callHistory);
          } else {
            console.error("API did not return a 'callHistory' array:", response.data);
            setCallHistory([]);
          }
        } catch (error) {
          console.error("Error fetching call history:", error);
          setCallHistory([]);
        } finally {
          setLoadingHistory(false);
        }
      } else {
        setCallHistory([]);
      }
    };

    fetchCallHistory();
  }, [cardData.ИИН_вызываемого]);

  const handleChange = (e) => {
    setCardData({ ...cardData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await handleSubmit("В работе");
  };

  const handleSendForApproval = async () => {
    await handleSubmit("На согласовании");
  };

  const handleSubmit = async (status) => {
    try {
      setShowSuccessNotification(true);
      setIsSubmitting(true);
      setError("");
      const userString = localStorage.getItem("user");
      if (!userString) {
        throw new Error("User not logged in or user data not found.");
      }
      const user = JSON.parse(userString);
      const userId = user._id;

      const updatedCardData = {
        ...cardData,
        status: status, 
      };

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Токен отсутствует в localStorage");
      }

      const response = await axios.post(
        "http://localhost:3350/api/cards",
        updatedCardData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Created card:", response.data);

      setCardData({
        case_number: "",
        ИИН_вызываемого: "",
        должность_вызываемого: "",
        БИН_ИИН: "",
        регион: "",
        планируемые_следственные_действия: "",
        дата_и_время_проведения: "",
        время_ухода: "",
        место_проведения: "",
        статус_по_делу: "",
        отношение_к_событию: "",
        виды_следствия: "",
        относится_ли_к_бизнесу: "",
        ИИН_защитника: "",
        обоснование: "",
        результат: "",
        status: "В работе",
      });
    } catch (error) {
      console.error("Error creating card:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Ошибка создания карточки.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Создать Карточку
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      <form>
        <TextField
          label="Номер УД"
          name="case_number"
          value={cardData.case_number}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="ИИН вызываемого"
          name="ИИН_вызываемого"
          value={cardData.ИИН_вызываемого}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <IconButton onClick={() => setCallHistoryOpen(!callHistoryOpen)}>
          {callHistoryOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />} История вызовов
        </IconButton>
        <Collapse in={callHistoryOpen}>
          {loadingHistory ? (
            <Typography>Загрузка истории вызовов...</Typography>
          ) : callHistory.length === 0 ? (
            <Typography>История вызовов не найдена.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Номер УД</TableCell>
                    <TableCell>Кто вызывал</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Время прихода</TableCell>
                    <TableCell>Время ухода</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {callHistory.map((call) => (
                    <TableRow key={call._id || call.case_number}>
                      <TableCell>{call.case_number}</TableCell>
                      <TableCell>{call.called_by || "N/A"}</TableCell>
                      <TableCell>{call.call_status}</TableCell>
                      <TableCell>{call.arrival_time}</TableCell>
                      <TableCell>{call.departure_time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Collapse>

       

<FormControl fullWidth margin="normal">
          <InputLabel>Должность вызываемого</InputLabel>
          <Select
            name="должность_вызываемого"
            value={cardData.должность_вызываемого}
            onChange={handleChange}
          >
            {positions.map((position, index) => (
              <MenuItem key={index} value={position.title}>
                {position.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="БИН/ИИН"
          name="БИН_ИИН"
          value={cardData.БИН_ИИН}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Регион</InputLabel>
          <Select name="регион" value={cardData.регион} onChange={handleChange}>
            {regions.map((region, index) => (
              <MenuItem key={index} value={region.name}>
                {region.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Планируемые следственные действия"
          name="планируемые_следственные_действия"
          value={cardData.планируемые_следственные_действия}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Дата и время проведения"
          name="дата_и_время_проведения"
          type="datetime-local"
          value={cardData.дата_и_время_проведения}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Время ухода"
          name="время_ухода"
          type="datetime-local"
          value={cardData.время_ухода}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Место проведения</InputLabel>
          <Select
            name="место_проведения"
            value={cardData.место_проведения}
            onChange={handleChange}
          >
            {interrogationLocations.map((location, index) => (
              <MenuItem key={index} value={location.location}>
                {location.location}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Статус по делу</InputLabel>
          <Select
            name="статус_по_делу"
            value={cardData.статус_по_делу}
            onChange={handleChange}
          >
            <MenuItem value="Ожидает обработки">В процессе</MenuItem>
            <MenuItem value="Завершено">Завершено</MenuItem>
            <MenuItem value="На рассмотрении">Отложено</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Отношение к событию</InputLabel>
          <Select
            name="отношение_к_событию"
            value={cardData.отношение_к_событию}
            onChange={handleChange}
          >
            <MenuItem value="Прямое">Прямое</MenuItem>
            <MenuItem value="Косвенное">Косвенное</MenuItem>
            <MenuItem value="Не связано">Не связано</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Относится ли к бизнесу?</InputLabel>
          <Select
            name="относится_ли_к_бизнесу"
            value={cardData.относится_ли_к_бизнесу}
            onChange={handleChange}
          >
            <MenuItem value="Да">Да</MenuItem>
            <MenuItem value="Нет">Нет</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Виды следствия</InputLabel>
          <Select
            name="виды_следствия"
            value={cardData.виды_следствия}
            onChange={handleChange}
          >
            {investigationTypes.map((type, index) => (
              <MenuItem key={index} value={type.type}>
                {type.type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="ИИН защитника"
          name="ИИН_защитника"
          value={cardData.ИИН_защитника}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Обоснование"
          name="обоснование"
          value={cardData.обоснование}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Результат"
          name="результат"
          value={cardData.результат}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            Сохранить
          </Button>
          <Button
            sx={{ backgroundColor: "#edcc6f", color: "black" }}
            onClick={handleSendForApproval}
            disabled={isSubmitting}
          >
            На согласование
          </Button>

        </Box>
      </form>
      {showSuccessNotification && (
        <NotificationBlock
          severity="success"
          message="Карточка успешно создана"
          onClose={() => setShowSuccessNotification(false)} // Hide after closing
        />
      )}
    </Box>
  );
};

export default CreateCardPage;
