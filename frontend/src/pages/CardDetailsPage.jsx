import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TextField, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useParams } from "react-router-dom";
import EditCardModal from "../components/EditCardModal";
import NotificationBlock from "../components/NotificationBlock";
import "../styles/CardDetails.css"; 

const CardDetailsPage = () => {
  const { id } = useParams(); 
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false); 
  const [reason, setReason] = useState(""); 
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null); 

  const isCardLocked = () => {
    return (
      cardData &&
      (cardData.status === "Отказано" ||
        cardData.status === "Оставлено без рассмотрения" ||
        cardData.status === "Согласовано" ||
        cardData.status === "В работе")
    );
  };
  const showApproverName = () => {
    return cardData && cardData.status !== "В работе"; 
  };
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cardResponse = await axios.get(
          `http://localhost:3350/api/cards/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCardData(cardResponse.data);

        const userString = localStorage.getItem("user");
        if (userString) {
          setUser(JSON.parse(userString));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error fetching data: " + err.message);
      } finally {
        setLoading(false);
      }

     
    };

    fetchData();
  }, [id, token]);

  const isEditable = () => {
    return (
      user &&
      user.role === "Сотрудник СУ" &&
      cardData &&
      (cardData.status === "В работе" ||
        cardData.status === "Отправлено на доработку")
    );
  };

  const isAnalyst = () => {
    return user && user.role === "Аналитик СД";
  };

  const handleAnalystAction = async (action) => {
    setCurrentAction(action); 
    setActionDialogOpen(true); 
  };
  const handleConfirmAction = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3350/api/cards/${id}/${currentAction}`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response.data);
      setCardData(response.data.card);
      setReason(""); 
      setActionDialogOpen(false);
    } catch (error) {
      console.error(`Error performing ${currentAction}:`, error);
      alert(`Error performing ${currentAction}: ${error.message}`);
    }
  };

  const handleCloseDialog = () => {
    setReason(""); 
    setActionDialogOpen(false); 
  };

  const isUnderReview = cardData && cardData.status === "на согласовании";

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  if (error) {
    return (
      <Typography variant="h6" color="error">
        {error}
      </Typography>
    );
  }

  if (!cardData) {
    return (
      <Typography variant="h6" color="error">
        Card not found
      </Typography>
    );
  }

  return (
    <Box className="content">
      <Typography variant="h5" gutterBottom>
        Карточка документа
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Регистрационный номер</TableCell>
              <TableCell>Дата создания документа</TableCell>
              <TableCell>ИИН вызываемого</TableCell>
              <TableCell>ФИО вызываемого</TableCell>
              <TableCell>Номер УД</TableCell>
              <TableCell>Статья УК</TableCell>
              <TableCell>Время прихода</TableCell>
              <TableCell>Время ухода</TableCell>
              {isAnalyst() && ( 
                <>
                  <TableCell>БИН/ИИН</TableCell>
                </>
              )}
              <TableCell>Место работы</TableCell>
              <TableCell>Должность</TableCell>
              <TableCell>Регион</TableCell>
              <TableCell>Относится ли к бизнесу</TableCell>
              
              <TableCell>ИИН защитника</TableCell>
              <TableCell>ФИО защитника</TableCell>
              <TableCell>Обоснование</TableCell>
              <TableCell>Результат</TableCell>
              {showApproverName() && ( 
                <TableCell>ФИО согласующего</TableCell>
              )}
              <TableCell>Статус документа</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow
              key={cardData._id}
              style={{
                backgroundColor: isUnderReview ? "green" : "transparent",
              }}
            >
              <TableCell>{cardData.registration_number}</TableCell>
              <TableCell>{cardData.creation_date}</TableCell>
              <TableCell>{cardData.ИИН_вызываемого}</TableCell>
              <TableCell>{cardData.ФИО_вызываемого}</TableCell>
              <TableCell>{cardData.case_number}</TableCell>
              <TableCell>{cardData.статья_ук_казахстана}</TableCell>
              <TableCell>{cardData.дата_и_время_проведения}</TableCell>
              <TableCell>{cardData.время_ухода}</TableCell>
              {isAnalyst() && (
                <>
                  <TableCell>{cardData.БИН_ИИН}</TableCell>
                </>
              )}
              <TableCell>{cardData.место_работы}</TableCell>
              <TableCell>{cardData.должность_вызываемого}</TableCell>
              <TableCell>{cardData.регион}</TableCell>
              <TableCell>{cardData.business_related ? "Да" : "Нет"}</TableCell>
              
              <TableCell>{cardData.ИИН_защитника}</TableCell>
              <TableCell>{cardData.ФИО_защитника}</TableCell>
              <TableCell>{cardData.обоснование}</TableCell>
              <TableCell>{cardData.результат}</TableCell>
              {showApproverName() && (
                <TableCell>
                  {cardData.approval_path?.[cardData.approval_path?.length - 1]
                    ?.name || "Не согласовано"}
                </TableCell>

              )}{" "}
                        <TableCell>{cardData.status}</TableCell>

            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      {isAnalyst() &&
        !isCardLocked() && ( 
          <Box mt={3} display="flex" gap={1}>
        <Button
          variant="contained"
          size="small"
          sx={{ backgroundColor: "#edcc6f" }} 
          onClick={() => handleAnalystAction('approve')}
        >
          Согласовать
        </Button>
        <Button
          variant="contained"
          size="small"
          sx={{ backgroundColor: "#88cafc" }} 
          onClick={() => handleAnalystAction('reject')}
        >
          Отказать
        </Button>
        <Button
          variant="contained"
          size="small"
          sx={{ backgroundColor: "#404066", color: "white" }} 
          onClick={() => handleAnalystAction('revision')}
        >
          На доработку
        </Button>
        <Button
          variant="contained"
          size="small"
          sx={{ backgroundColor: "#2b2c41", color: "white" }} 
          onClick={() => handleAnalystAction('leave')}
        >
          Без рассмотрения
        </Button>
      </Box>
        )}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Путь согласования заключения:
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Должность</TableCell>
              <TableCell>ФИО</TableCell>
              <TableCell>Статус согласования</TableCell>
              <TableCell>Дата и время согласования</TableCell>
              <TableCell>Причины</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cardData.approval_path &&
              cardData.approval_path.map((approval, index) => (
                <TableRow key={approval._id || index}>
                  <TableCell>{approval.position}</TableCell>
                  <TableCell>{approval.name}</TableCell>
                  <TableCell>{approval.approval_status}</TableCell>
                  <TableCell>{approval.approval_time}</TableCell>
                  <TableCell>{approval.reason}</TableCell>
                </TableRow>
              ))}

            {(!cardData.approval_path ||
              cardData.approval_path.length === 0) && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography align="center">
                    Approval history not available.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={actionDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Укажите причину</DialogTitle>
        <DialogContent>
          <TextField
            label="Причина"
            fullWidth
            multiline
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleConfirmAction} color="primary">
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
      <Box mt={3}>
        <Button
          variant="outlined"
          sx={{ backgroundColor: "#88cafc", color: "black" }}
          onClick={() => window.history.back()}
        >
          Вернуться
        </Button>
        {isEditable() && (
          <Button
            variant="outlined"
            color="primary"
            sx={{ ml: 2 }}
            onClick={handleOpenModal}
          >
            Редактировать
          </Button>
        )}
      </Box>

      <EditCardModal
        open={modalOpen}
        onClose={handleCloseModal}
        cardId={id}
        cardData={cardData}
      />
    </Box>
  );
};

export default CardDetailsPage;
