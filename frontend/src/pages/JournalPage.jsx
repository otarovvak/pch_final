import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/CardDetails.css";

import {
  TextField,
  Button,
  Box,
  Typography,
  Grid, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const ConclusionsJournalPage = () => {
  const [conclusions, setConclusions] = useState([]);
  const [filteredConclusions, setFilteredConclusions] = useState([]);
  const [filters, setFilters] = useState({
    registration_number: "",
    status: "",
    region: "",
    creation_date_from: "",
    creation_date_to: "",
    iin: "",
    case_number: "",
    approver_name: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchConclusions = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!token) {
          console.error("Token not found. Redirecting to login.");
          return;
        }
        const response = await axios.get("http://localhost:3350/api/cards", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!Array.isArray(response.data)) {
          throw new Error(
            "Invalid data received from server. Expected an array."
          );
        }

        const formattedData = response.data.map((item) => ({
          ...item,
          registration_number: item.registration_number || "",
          status: item.status || "",
          region: item.регион || "",
          approver_name:
            item.approval_path?.[item.approval_path?.length - 1]?.name || "",
          iin: item.ИИН_вызываемого || "",
          case_number: item.case_number || "",
          creation_date: item.creation_date || "",
          creator_id: item.creator_id || null,
          department: item.department || null,
        }));

        let filteredData = formattedData;
        console.log(formattedData);
        console.log(user.name)
        if (user?.role === "Сотрудник СУ") {
          filteredData = formattedData.filter(
            
            
            (item) => item.следователь === user.name
          );
        } else if (user?.role === "Аналитик СД") {
          filteredData = formattedData.filter(
            (item) => item.регион === user.регион
          );
        }

        filteredData.sort((a, b) => {
          const isAOnApproval = a.status === "На согласовании";
          const isBOnApproval = b.status === "На согласовании";

          if (isAOnApproval && !isBOnApproval) return -1;
          if (!isAOnApproval && isBOnApproval) return 1;

          return 0;
        });

        setConclusions(filteredData);
        setFilteredConclusions(filteredData);
      } catch (error) {
        console.error("Error fetching or filtering data:", error);
        setError("Failed to load data: " + (error.message || "Unknown Error"));
      } finally {
        setLoading(false);
      }
    };

    fetchConclusions();
  }, [token]);

  const isAnalyst = () => {
    return user && user.role === "Аналитик СД";
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  useEffect(() => {
    const filteredData = conclusions.filter((conclusion) => {
      let matches = true;

      for (const key in filters) {
        const filterValue = filters[key];
        const conclusionValue = conclusion[key];

        if (filterValue) {
          if (key === "creation_date_from" || key === "creation_date_to") {
            const conclusionDate = new Date(conclusion.creation_date);
            if (
              key === "creation_date_from" &&
              conclusionDate < new Date(filterValue)
            ) {
              matches = false;
              break;
            }
            if (
              key === "creation_date_to" &&
              conclusionDate > new Date(filterValue)
            ) {
              matches = false;
              break;
            }
          } else if (typeof conclusionValue === "string") {
            if (
              !conclusionValue.toLowerCase().includes(filterValue.toLowerCase())
            ) {
              matches = false;
              break;
            }
          } else {
            if (conclusionValue !== filterValue) {
              matches = false;
              break;
            }
          }
        }
      }
      return matches;
    });

    setFilteredConclusions(filteredData);
  }, [filters, conclusions]);

  const handleExportExcel = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3350/api/cards/export/excel`,
        {
          params: filters,
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Журнал_Заключений.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setError(
        "Failed to export to Excel: " + (error.message || "Unknown error")
      );
    }
  };

  const handleExportPdf = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3350/api/cards/export/pdf`,
        {
          params: filters,
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Журнал_Заключений.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      setError(
        "Failed to export to PDF: " + (error.message || "Unknown error")
      );
    }
  };

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

  return (
    <Box className="content">
      <Typography variant="h4" gutterBottom>
        Журнал заключений
      </Typography>

      {}
      <Grid container spacing={2} mb={3}>
      <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="ИИН вызываемого"
            variant="outlined"
            name="iin" 
            value={filters.iin}
            onChange={handleFilterChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Номер УД"
            variant="outlined"
            name="case_number" 
            value={filters.case_number}
            onChange={handleFilterChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Регистрационный номер"
            variant="outlined"
            name="registration_number"
            value={filters.registration_number}
            onChange={handleFilterChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Статус документа"
            variant="outlined"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Регион"
            variant="outlined"
            name="region"
            value={filters.region}
            onChange={handleFilterChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="ФИО согласующего"
            variant="outlined"
            name="approver_name"
            value={filters.approver_name}
            onChange={handleFilterChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Дата создания с"
            variant="outlined"
            type="date"
            name="creation_date_from"
            value={filters.creation_date_from}
            onChange={handleFilterChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Дата создания по"
            variant="outlined"
            type="date"
            name="creation_date_to"
            value={filters.creation_date_to}
            onChange={handleFilterChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <Box mb={3} display="flex" justifyContent="flex-start">
  <Button 
    variant="contained" 
    color="primary" 
    onClick={handleExportExcel} 
    sx={{ 
      padding: '4px 8px',  
      fontSize: '0.75rem', 
      minWidth: 'auto' 
    }}
  >
    Экспорт в Excel
  </Button>
  <Button 
    variant="contained" 
    onClick={handleExportPdf} 
    sx={{ 
      backgroundColor: "	#edcc6f",
      ml: 2, 
      padding: '4px 8px', 
      fontSize: '0.75rem',
      minWidth: 'auto'
    }}
  >
    Экспорт в PDF
  </Button>
</Box>

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
              <TableCell>Место работы</TableCell>
              <TableCell>Должность</TableCell>
              <TableCell>Регион</TableCell>
              <TableCell>Относится ли к бизнесу</TableCell>
              <TableCell>Статус документа</TableCell>
              <TableCell>ФИО согласующего</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            
            {filteredConclusions.map((conclusion) => (
             <TableRow
             key={conclusion._id || conclusion.id}
             style={{
               backgroundColor:
                 (user?.role ===  "Аналитик СД") && conclusion.status === "На согласовании"
                   ? "lightgreen"
                   : "transparent",
             }}
           >
                <TableCell>{conclusion.registration_number}</TableCell>
                <TableCell>{conclusion.creation_date}</TableCell>
                <TableCell>{conclusion.ИИН_вызываемого}</TableCell>
                <TableCell>{conclusion.ФИО_вызываемого}</TableCell>
                <TableCell>{conclusion.case_number}</TableCell>
                <TableCell>{conclusion.статья_ук_казахстана}</TableCell>
                <TableCell>{conclusion.дата_и_время_проведения}</TableCell>
                <TableCell>{conclusion.время_ухода}</TableCell>
                <TableCell>{conclusion.место_работы}</TableCell>
                <TableCell>{conclusion.должность_вызываемого}</TableCell>
                <TableCell>{conclusion.регион}</TableCell>
                <TableCell>{conclusion.относится_ли_к_бизнесу}</TableCell>
                <TableCell>{conclusion.status}</TableCell>
                <TableCell>
                  {
                    conclusion.approval_path?.[
                      conclusion.approval_path?.length - 1
                    ]?.name
                  }
                </TableCell>
                <TableCell>
                  {user && user.role === "Сотрудник СУ" ? (
                    <Link to={`/card-details/${conclusion._id}`}>
                      <Button variant="outlined" color="primary">
                        Просмотреть/Редактировать
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/card-details/${conclusion._id}`}>
                      <Button variant="outlined" color="primary">
                        Просмотреть
                      </Button>
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ConclusionsJournalPage;
