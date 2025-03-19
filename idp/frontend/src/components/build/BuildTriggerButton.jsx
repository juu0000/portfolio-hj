import React, {useState} from 'react';
import axios from 'axios';
import { Button, CircularProgress, Snackbar } from '@mui/material';

const BuildTriggerButton = ({ jobName, hasParams, onStatusUpdate }) =>{
  const [building, setBuilding] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message:'', severity: 'success'});

  const handleTrigger = async () => {
    setBuilding(true);
    const backendUrl = window._env_ && window._env_.REACT_APP_BACKEND_URL
    ? window._env_.REACT_APP_BACKEND_URL
    : process.env.REACT_APP_BACKEND_URL;
    const endpoint = hasParams
      ? `/jenkins/job/${jobName}/buildWithParameters`
      : `/jenkins/job/${jobName}/build`;
    try {
      const response = await axios.post(backendUrl + endpoint);
      if(onStatusUpdate){
        onStatusUpdate(response.data);
      }
      else{
        console.log(`Build triggered for ${jobName}`, response.data);
      }
      setSnackbar({ open: true, message: 'Build triggered successfully.', severity: 'success'});
      
    } catch (error) {
      console.log(`Failed to trigger build for ${jobName}`, error);
      setSnackbar({open:true, message:'Failed to trigger build.', severity: 'error'});
    } finally {
      setTimeout(()=>{
        setBuilding(false);
      },500)
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleTrigger}
        disabled={building}
        startIcon={building ? <CircularProgress size={20} color="inherit" /> : null }
      >
        {building ? 'Building...' : (hasParams ? 'Build (with Params)':"Build")}
      </Button>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={()=> setSnackbar({ ...snackbar, open: false})}
        message={snackbar.message}
      />
    </>
  );
};

export default BuildTriggerButton;