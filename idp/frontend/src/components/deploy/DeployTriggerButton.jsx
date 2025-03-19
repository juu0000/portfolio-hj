import React, { useState } from 'react';
import { Button, CircularProgress, Snackbar } from '@mui/material';
import axios from 'axios';

const DeployTriggerButton = ({ appName, onStatusUpdate }) => {
  const [deploying, setDeploying] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleTrigger = async () => {
    setDeploying(true);
    try {
      // 배포 요청을 위한 POST 호출 (백엔드에서 ArgoCD sync 수행)
      const backendUrl = window._env_ && window._env_.REACT_APP_BACKEND_URL
        ? window._env_.REACT_APP_BACKEND_URL
        : process.env.REACT_APP_BACKEND_URL;
      const response = await axios.post(`${backendUrl}/argocd/app/${appName}/sync`);
      
      if(onStatusUpdate){
        onStatusUpdate(response.data);
      }
      else{
        console.log(`Deploy triggered for ${appName}`, response.data);
      }
      setSnackbar({ open: true, message: 'Deployment triggered successfully.', severity: 'success' });
      
    } catch (error) {
      console.error(`Failed to trigger deploy for ${appName}`, error);
      setSnackbar({ open: true, message: 'Failed to trigger deployment.', severity: 'error' });
    } finally {
      setTimeout(()=>{
        setDeploying(false);
      },500);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleTrigger}
        disabled={deploying}
        startIcon={deploying ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {deploying ? 'Deploying...' : 'Deploy'}
      </Button>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </>
  );
};

export default DeployTriggerButton;
