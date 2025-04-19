import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Alert, AlertTitle, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const NotificationBlock = ({ severity, title, message, onClose }) => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Collapse in={open}>
      <Alert 
        severity={severity} 
        sx={{ 
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          mb: 1, 
          borderRadius: 1, 
          boxShadow: 1 
        }} 
        action={ 
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        <Typography variant="body2"> {message} </Typography>
      </Alert>
    </Collapse>
  );
};

export default NotificationBlock;
